import { verifyAdminPassword } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  if (!verifyAdminPassword(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  // Use the native driver so this works regardless of Mongoose model cache state.
  const books = await mongoose.connection
    .collection('books')
    .find(
      { publishStatus: { $in: ['pending', 'approved', 'rejected'] } },
      {
        projection: {
          title: 1,
          coverImage: 1,
          penName: 1,
          shareId: 1,
          publishStatus: 1,
          publishRequestedAt: 1,
          publishReviewedAt: 1,
          publishRejectedReason: 1,
          publishedAt: 1,
          userId: 1,
          updatedAt: 1,
        },
      }
    )
    .sort({ publishRequestedAt: -1 })
    .toArray();

  return NextResponse.json(books);
}
