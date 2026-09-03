import mongoose, { Schema, Model } from 'mongoose';

export interface IFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export interface ITestimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatar: string;
}

export interface ISettings {
  siteName: string;
  tagline: string;
  officialEmail: string;
  phone: string;
  address: string;
  githubUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  noticeBanner?: string;
  faqs?: IFAQ[];
  testimonials?: ITestimonial[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    siteName: { type: String, default: 'e-Yantra LNJPIT' },
    tagline: { type: String, default: 'Robotics & Engineering Excellence at LNJPIT Chapra' },
    officialEmail: { type: String, default: 'lnjpiteyantra@gmail.com' },
    phone: { type: String, default: '+91 6152 280000' },
    address: { type: String, default: 'LNJPIT Campus, Chapra, Saran, Bihar - 841302' },
    githubUrl: { type: String, default: 'https://github.com/eyantra-lnjpit' },
    linkedinUrl: { type: String, default: 'https://linkedin.com/company/eyantra-lnjpit' },
    instagramUrl: { type: String, default: 'https://instagram.com/eyantra_lnjpit' },
    youtubeUrl: { type: String, default: 'https://youtube.com/@eyantra_lnjpit' },
    noticeBanner: { type: String, default: '🚀 Registration Open: e-LNJPIT HackRobotics 2026!' },
    faqs: {
      type: [
        {
          id: { type: String, default: '' },
          question: { type: String, default: '' },
          answer: { type: String, default: '' },
          category: { type: String, default: '' },
          order: { type: Number, default: 0 }
        }
      ],
      default: []
    },
    testimonials: {
      type: [
        {
          id: { type: String, default: '' },
          name: { type: String, default: '' },
          role: { type: String, default: '' },
          quote: { type: String, default: '' },
          avatar: { type: String, default: '' }
        }
      ],
      default: []
    }
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

export const SettingsModel: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
export default SettingsModel;
