import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICategory extends Document {
  restaurantId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: [true, "Category slug is required"],
      lowercase: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Same category slug can exist in different restaurants,
// but not twice inside the same restaurant.
CategorySchema.index(
  { restaurantId: 1, slug: 1 },
  { unique: true }
);

export default (mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema)) as Model<ICategory>;