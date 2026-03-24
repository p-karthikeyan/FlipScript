import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Book from "@/models/Book";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const book = await Book.findOne({ _id: params.id, userId: session.user.id });
  if (!book) return NextResponse.json({ error: "Not Found" }, { status: 404 });

  return NextResponse.json(book);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  await dbConnect();
  
  const book = await Book.findOneAndUpdate(
    { _id: params.id, userId: session.user.id },
    { $set: data },
    { new: true }
  );

  if (!book) return NextResponse.json({ error: "Not Found" }, { status: 404 });
  return NextResponse.json(book);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const result = await Book.deleteOne({ _id: params.id, userId: session.user.id });
  if (result.deletedCount === 0) return NextResponse.json({ error: "Not Found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
