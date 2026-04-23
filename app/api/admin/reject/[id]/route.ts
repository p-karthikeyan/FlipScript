import { verifyAdminPassword } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminPassword(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const reason = (body.reason as string | undefined)?.trim() ?? null;

  await dbConnect();

  await mongoose.connection.collection('books').updateOne(
    { _id: new mongoose.Types.ObjectId(id) },
    {
      $set: {
        publishStatus: 'rejected',
        isPublic: false,
        publishReviewedAt: new Date(),
        publishRejectedReason: reason,
      },
    }
  );

  const book = await mongoose.connection
    .collection('books')
    .findOne({ _id: new mongoose.Types.ObjectId(id) });

  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(book);
}
