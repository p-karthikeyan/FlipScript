import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Book from "@/models/Book";
import { NextResponse } from "next/server";
import crypto from 'crypto';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;
  await dbConnect();

  // 1. Try direct _id access (usually editor)
  try {
     const bookById = await Book.findOne({ _id: id });
     if (bookById) {
        const isOwner = session?.user && bookById.userId === (session.user as any).id;
        if (isOwner) return NextResponse.json(bookById);
        // Not owner? Block direct access for security
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
     }
  } catch (e) {
     // Not an ObjectId format? That's fine, we'll try shareId below.
  }

  // 2. Try public shareId access
  const bookByShare = await Book.findOne({ shareId: id });
  if (bookByShare) {
    return NextResponse.json(bookByShare);
  }

  return NextResponse.json({ error: "Not Found" }, { status: 404 });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { generateShareId, ...data } = await req.json();
  await dbConnect();
  
  const updateData: any = { ...data };
  if (generateShareId) {
    updateData.shareId = crypto.randomBytes(16).toString('hex');
  }

  const book = await Book.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { $set: updateData },
    { new: true }
  );

  if (!book) return NextResponse.json({ error: "Not Found" }, { status: 404 });
  return NextResponse.json(book);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await dbConnect();
  const result = await Book.deleteOne({ _id: id, userId: session.user.id });
  if (result.deletedCount === 0) return NextResponse.json({ error: "Not Found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
