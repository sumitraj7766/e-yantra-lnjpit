import mongoose, { Schema, Model } from 'mongoose';

export interface ILearningResource {
  id: string;
  title: string;
  category: string;
  description: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  link?: string;
  linkUrl?: string;
  type?: string;
  tags?: string[];
  author?: string;
  addedDate?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const ResourceSchema = new Schema<ILearningResource>(
  {
    id: { type: String, unique: true, required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    description: { type: String, required: true },
    difficulty: { type: String, default: 'Beginner' },
    link: { type: String, default: '' },
    linkUrl: { type: String, default: '' },
    type: { type: String, default: 'PDF' },
    tags: { type: [String], default: [] },
    author: { type: String },
    addedDate: { type: String, default: () => new Date().toISOString().split('T')[0] }
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

export const ResourceModel: Model<ILearningResource> =
  mongoose.models.Resource || mongoose.model<ILearningResource>('Resource', ResourceSchema);
export default ResourceModel;
