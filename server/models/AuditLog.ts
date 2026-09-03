import mongoose, { Schema, Model } from 'mongoose';

export interface IAuditLog {
  id: string;
  userId?: string;
  user: string;
  userRole?: string;
  role?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  targetRecord: string;
  description?: string;
  details?: any;
  metadata?: any;
  timestamp: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    id: { type: String, unique: true, required: true, index: true },
    userId: { type: String, index: true },
    user: { type: String, required: true },
    userRole: { type: String, default: 'MEMBER' },
    role: { type: String, default: 'MEMBER' },
    action: { type: String, required: true, index: true },
    entityType: { type: String, index: true },
    entityId: { type: String, index: true },
    targetRecord: { type: String, required: true },
    description: { type: String, default: '' },
    details: { type: Schema.Types.Mixed, default: {} },
    metadata: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: String, default: () => new Date().toISOString() }
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

export const AuditLogModel: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLogModel;
