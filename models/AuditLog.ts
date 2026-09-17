import mongoose, { Document, Model } from "mongoose";

export interface IAuditLog extends Document {
  adminId: mongoose.Types.ObjectId;
  action: string;
  module: string;
  targetId?: string;
  description: string;
  ipAddress?: string;
  createdAt: Date;
}

const auditLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    module: { type: String, required: true },
    targetId: { type: String },
    description: { type: String, required: true },
    ipAddress: { type: String },
  },
  { timestamps: { updatedAt: false } }
);

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", auditLogSchema);

export default AuditLog;
