import mongoose, { Schema, Model } from 'mongoose';

export type TeamMemberType = 
  | 'FACULTY' 
  | 'TECHNICAL_LEAD' 
  | 'COORDINATOR' 
  | 'PROJECT_LEAD' 
  | 'MEMBER' 
  | 'LAB_ASSISTANT'
  | 'ALUMNI'
  | 'ADVISOR'
  | 'OTHER';

export interface ISocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  website?: string;
  googleScholar?: string;
  researchGate?: string;
  other?: string;
}

export interface IProfilePhoto {
  url: string;
  publicId?: string;
  filename?: string;
  size?: number;
  uploadedAt?: string | Date;
}

export interface ITeamMember {
  id: string;
  name: string;
  slug: string;
  memberType: TeamMemberType | string;
  designation: string;
  department: string;
  batch?: string;
  college?: string;
  shortBio?: string;
  fullBiography?: string;
  skills: string[];
  areasOfInterest: string[];
  projects: string[];
  achievements: string[];
  responsibilities: string[];
  photo: string;
  profilePhoto?: IProfilePhoto;
  photoStorageId?: string;
  photoFilename?: string;
  email: string;
  phone?: string;
  socialLinks: ISocialLinks;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  visibility?: 'PUBLIC' | 'MEMBERS_ONLY' | 'PRIVATE' | string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const SocialLinksSchema = new Schema<ISocialLinks>(
  {
    linkedin: { type: String, default: '', trim: true },
    github: { type: String, default: '', trim: true },
    portfolio: { type: String, default: '', trim: true },
    website: { type: String, default: '', trim: true },
    googleScholar: { type: String, default: '', trim: true },
    researchGate: { type: String, default: '', trim: true },
    other: { type: String, default: '', trim: true }
  },
  { _id: false }
);

const ProfilePhotoSchema = new Schema<IProfilePhoto>(
  {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
    filename: { type: String, default: '' },
    size: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    id: { type: String, unique: true, required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    memberType: {
      type: String,
      required: true,
      enum: ['FACULTY', 'TECHNICAL_LEAD', 'COORDINATOR', 'PROJECT_LEAD', 'MEMBER', 'LAB_ASSISTANT', 'ALUMNI', 'ADVISOR', 'OTHER'],
      default: 'MEMBER',
      index: true
    },
    designation: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    batch: { type: String, default: 'Batch 2023-27' },
    college: { type: String, default: 'Lok Nayak Jai Prakash Institute of Technology (LNJPIT), Chapra' },
    shortBio: { type: String, default: '' },
    fullBiography: { type: String, default: '' },
    skills: { type: [String], default: [] },
    areasOfInterest: { type: [String], default: [] },
    projects: { type: [String], default: [] },
    achievements: { type: [String], default: [] },
    responsibilities: { type: [String], default: [] },
    photo: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400' },
    profilePhoto: { type: ProfilePhotoSchema, default: () => ({}) },
    photoStorageId: { type: String, default: '' },
    photoFilename: { type: String, default: '' },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    socialLinks: { type: SocialLinksSchema, default: () => ({}) },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: true, index: true },
    visibility: { type: String, default: 'PUBLIC' }
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

export const TeamMemberModel: Model<ITeamMember> =
  mongoose.models.TeamMember || mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema, 'teammembers');
export default TeamMemberModel;
