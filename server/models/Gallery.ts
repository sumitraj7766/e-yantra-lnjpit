import mongoose, { Schema, Model } from 'mongoose';

export interface IGalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  description?: string;
  caption?: string;
  date: string;
  tags?: string[];
  isFeatured?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const GallerySchema = new Schema<IGalleryItem>(
  {
    id: { type: String, unique: true, required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    imageUrl: { type: String, required: true },
    description: { type: String, default: '' },
    caption: { type: String, default: '' },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    tags: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false, index: true }
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

export const GalleryModel: Model<IGalleryItem> = mongoose.models.Gallery || mongoose.model<IGalleryItem>('Gallery', GallerySchema);
export default GalleryModel;
