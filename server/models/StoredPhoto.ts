import mongoose, { Schema, Model } from 'mongoose';

export interface IStoredPhoto {
  publicId: string;
  filename: string;
  mimeType: string;

  // Legacy MongoDB image data.
  // New images will use Cloudinary instead.
  data?: Buffer;

  size: number;

  // Cloudinary fields
  url?: string;
  cloudinaryPublicId?: string;

  uploadedBy?: string;
  teamMemberId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const StoredPhotoSchema = new Schema<IStoredPhoto>(
  {
    publicId: { type: String, required: true, unique: true, index: true },
    filename: { type: String, required: true, index: true },
    mimeType: { type: String, required: true, default: 'image/jpeg' },

    // Optional because new photos are stored on Cloudinary.
    // Existing photos can still have this Buffer.
    data: { type: Buffer, required: false },

    size: { type: Number, required: true },

    // Cloudinary URL
    url: { type: String, required: false },

    // Exact Cloudinary public_id used for deletion
    cloudinaryPublicId: { type: String, required: false, index: true },

    uploadedBy: { type: String, default: '' },
    teamMemberId: { type: String, default: '', index: true }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret: any) => {
        delete ret.data;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const StoredPhotoModel: Model<IStoredPhoto> =
  mongoose.models.StoredPhoto ||
  mongoose.model<IStoredPhoto>(
    'StoredPhoto',
    StoredPhotoSchema,
    'storedphotos'
  );

export default StoredPhotoModel;