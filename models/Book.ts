import mongoose, { Schema, model, models } from 'mongoose';

const PageSchema = new Schema({
  id: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: { type: String },
  animation: { type: String },
});

const BookSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    pages: [PageSchema],
    currentPage: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Book = models.Book || model('Book', BookSchema);

export default Book;
