import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Book from "@/models/Book";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const books = await Book.find({ userId: session.user.id }).sort({ updatedAt: -1 });
  return NextResponse.json(books);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, pages } = await req.json();
  
  await dbConnect();
  const book = await Book.create({
    userId: session.user.id,
    title: title || "New Story",
    pages: pages || [{ id: crypto.randomUUID(), content: "Start writing your story..." }],
  });

  return NextResponse.json(book);
}
