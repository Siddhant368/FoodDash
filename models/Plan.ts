import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

export interface IPlan extends Document {
  name: string;
  slug: string;
  description?: string;

  price: number;
  billingCycle: "MONTHLY" | "YEARLY";
  features: string[];

  maxStaff: number;
  maxDeliveryPartners: number;
  maxMenuItems: number;

  isPopular?: boolean;
  sortOrder?: number;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema = new Schema<IPlan>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    billingCycle: {
      type: String,
      enum: ["MONTHLY", "YEARLY"],
      default: "MONTHLY",
      required: true,
    },

    features: {
      type: [String],
      default: [],
    },

    maxStaff: {
      type: Number,
      default: 5,
      min: 0,
    },

    maxDeliveryPartners: {
      type: Number,
      default: 2,
      min: 0,
    },

    maxMenuItems: {
      type: Number,
      default: 50,
      min: 0,
    },

    isPopular: {
      type: Boolean,
      default: false,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

PlanSchema.index({
  isActive: 1,
  price: 1,
});

const Plan: Model<IPlan> =
  mongoose.models.Plan ||
  mongoose.model<IPlan>("Plan", PlanSchema);

export default Plan;