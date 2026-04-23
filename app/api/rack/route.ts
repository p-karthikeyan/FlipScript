import dbConnect from '@/lib/mongodb';
import Book from '@/models/Book';
import { NextResponse } from 'next/server';

// Public endpoint — no auth required.
// Only returns books explicitly approved by an admin.
export async function GET() {
  await dbConnect();

  const books = await Book.find(
    { publishStatus: 'approved', isPublic: true },
    { title: 1, coverImage: 1, penName: 1, shareId: 1, publishedAt: 1, updatedAt: 1 }
  ).sort({ publishedAt: -1 }).limit(100);

  return NextResponse.json(books);
}
