import mongoose, { Schema, Model } from 'mongoose';

export interface IAchievement {
  id: string;
  title: string;
  competition: string;
  organizer?: string;
  date: string;
  rank: string;
  teamMembers?: string[];
  description: string;
  photoUrl?: string;
  image?: string;
  awardLevel?: string;
  category?: string;
  team?: string;
  isFeatured?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    id: { type: String, unique: true, required: true, index: true },
    title: { type: String, required: true, trim: true },
    competition: { type: String, required: true },
    organizer: { type: String, default: '' },
    date: { type: String, required: true },
    rank: { type: String, required: true },
    teamMembers: { type: [String], default: [] },
    description: { type: String, required: true },
    photoUrl: { type: String },
    image: { type: String },
    awardLevel: { type: String },
    category: { type: String },
    team: { type: String },
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

export const AchievementModel: Model<IAchievement> =
  mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', AchievementSchema);
export default AchievementModel;
