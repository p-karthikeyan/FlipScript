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
    shareId: { type: String, unique: true, sparse: true, index: true },
    coverImage: { type: String, default: null },
    penName: { type: String, default: null },
    publishedAt: { type: Date, default: null },
    publishStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none',
      index: true,
    },
    publishRequestedAt: { type: Date, default: null },
    publishReviewedAt: { type: Date, default: null },
    publishRejectedReason: { type: String, default: null },
  },
  { timestamps: true }
);

// In development Next.js caches modules between hot-reloads.
// If we added new fields to the schema after the first server start,
// the stale cached model won't know about them and Mongoose strict mode
// will silently drop those fields on every $set. Delete the cache so the
// model is always compiled fresh from the current schema.
if (process.env.NODE_ENV !== 'production' && models.Book) {
  delete models.Book;
}

const Book = models.Book || model('Book', BookSchema);

export default Book;
