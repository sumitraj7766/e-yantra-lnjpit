import mongoose, { Schema, Model } from 'mongoose';

export interface IProject {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  problemStatement?: string;
  methodology?: string;
  hardwareComponents?: string[];
  softwareStack?: string[];
  results?: string;
  futureScope?: string;
  category: string;
  leadName: string;
  leadRoll?: string;
  teamMembers?: Array<{ name: string; roll: string; role: string }>;
  guideName?: string;
  status: string;
  year: string;
  coverImage: string;
  gallery?: string[];
  githubUrl?: string;
  liveDemoUrl?: string;
  videoUrl?: string;
  reportUrl?: string;
  isFeatured?: boolean;
  tags?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    id: { type: String, unique: true, required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    shortDescription: { type: String, required: true },
    problemStatement: { type: String, default: '' },
    methodology: { type: String, default: '' },
    hardwareComponents: { type: [String], default: [] },
    softwareStack: { type: [String], default: [] },
    results: { type: String, default: '' },
    futureScope: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    leadName: { type: String, default: 'e-Yantra LNJPIT Team' },
    leadRoll: { type: String, default: '' },
    teamMembers: {
      type: [
        {
          name: { type: String, default: '' },
          roll: { type: String, default: '' },
          role: { type: String, default: '' }
        }
      ],
      default: []
    },
    guideName: { type: String, default: 'Dr. R. K. Sharma' },
    status: {
      type: String,
      default: 'Ongoing',
      index: true
    },
    year: { type: String, default: '2026' },
    coverImage: { type: String, default: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800' },
    gallery: { type: [String], default: [] },
    githubUrl: { type: String, default: '' },
    liveDemoUrl: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    reportUrl: { type: String, default: '' },
    isFeatured: { type: Boolean, default: false, index: true },
    tags: { type: [String], default: [] }
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

export const ProjectModel: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
export default ProjectModel;
