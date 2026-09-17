import mongoose, { Document, Model, Schema } from "mongoose";

export type DiscountType = "PERCENTAGE" | "FLAT" | "FREE_DELIVERY";
export type ApplicableTo = "ALL" | "CATEGORY" | "MENU_ITEM";

export interface IOffer extends Document {
  restaurantId: mongoose.Types.ObjectId;
  title: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount: number;
  applicableTo: ApplicableTo;
  categoryIds?: mongoose.Types.ObjectId[];
  menuItemIds?: mongoose.Types.ObjectId[];
  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;
  usageLimit?: number;
  usedCount: number;
  perCustomerLimit: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    description: { type: String, required: true },
    discountType: {
      type: String,
      enum: ["PERCENTAGE", "FLAT", "FREE_DELIVERY"],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    minOrderAmount: { type: Number, required: true, min: 0, default: 0 },
    applicableTo: {
      type: String,
      enum: ["ALL", "CATEGORY", "MENU_ITEM"],
      default: "ALL",
    },
    categoryIds: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    menuItemIds: [{ type: Schema.Types.ObjectId, ref: "MenuItem" }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    endTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    usageLimit: { type: Number, min: 1 },
    usedCount: { type: Number, default: 0 },
    perCustomerLimit: { type: Number, default: 1, min: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes for performance
OfferSchema.index({ restaurantId: 1, code: 1 }, { unique: true });
OfferSchema.index({ restaurantId: 1, isActive: 1, startDate: 1, endDate: 1 });

const Offer: Model<IOffer> =
  mongoose.models.Offer || mongoose.model<IOffer>("Offer", OfferSchema);

export default Offer;
