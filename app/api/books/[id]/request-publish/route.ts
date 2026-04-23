import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Book from '@/models/Book';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import mongoose from 'mongoose';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { penName } = await req.json();

  if (!penName?.trim()) {
    return NextResponse.json({ error: 'Pen name is required' }, { status: 400 });
  }

  await dbConnect();

  // Validate id
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const existing = await Book.findOne({ _id: id, userId: session.user.id });
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const shareId = existing.shareId || crypto.randomBytes(16).toString('hex');

  // Use the native MongoDB driver directly to bypass any stale Mongoose
  // model cache that might strip new schema fields via strict mode.
  const collection = mongoose.connection.collection('books');
  await collection.updateOne(
    { _id: new mongoose.Types.ObjectId(id) },
    {
      $set: {
        penName: penName.trim(),
        publishStatus: 'pending',
        publishRequestedAt: new Date(),
        publishRejectedReason: null,
        shareId,
      },
    }
  );

  const updated = await collection.findOne({ _id: new mongoose.Types.ObjectId(id) });
  return NextResponse.json(updated);
}
