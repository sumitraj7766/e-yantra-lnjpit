import mongoose, { Schema, Model } from 'mongoose';

export interface IBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  authorRole?: string;
  authorAvatar?: string;
  publishDate: string;
  readTime?: string;
  category: string;
  tags?: string[];
  isFeatured?: boolean;
  views?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    id: { type: String, unique: true, required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String, default: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800' },
    author: { type: String, required: true },
    authorRole: { type: String, default: 'e-Yantra Member' },
    authorAvatar: { type: String },
    publishDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    readTime: { type: String, default: '5 min read' },
    category: {
      type: String,
      default: 'Tutorial',
      index: true
    },
    tags: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false, index: true },
    views: { type: Number, default: 0 }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret: any) => {
        delete ret.__v;
        delete ret._id;
        return ret;
      }
    }
  }
);

export const BlogPostModel: Model<IBlogPost> = mongoose.models.BlogPost || mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);
export default BlogPostModel;
