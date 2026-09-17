import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

// ======================================================
// CART ITEM INTERFACE
// ======================================================

export interface ICartItem {
  menuItemId: mongoose.Types.ObjectId;
  quantity: number;
}

// ======================================================
// CART INTERFACE
// ======================================================

export interface ICart extends Document {
  customerId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  items: ICartItem[];
  appliedOfferId?: mongoose.Types.ObjectId;
  appliedCouponCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ======================================================
// CART ITEM SCHEMA
// ======================================================

const CartItemSchema = new Schema<ICartItem>(
  {
    menuItemId: {
      type: Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
    },
  },
  {
    _id: false,
  }
);

// ======================================================
// CART SCHEMA
// ======================================================

const CartSchema = new Schema<ICart>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    items: {
      type: [CartItemSchema],
      default: [],
    },

    appliedOfferId: {
      type: Schema.Types.ObjectId,
      ref: "Offer",
    },

    appliedCouponCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
  },
  {
    timestamps: true,
  }
);

// ======================================================
// INDEX
// ======================================================

// One cart per customer per restaurant
CartSchema.index(
  {
    customerId: 1,
    restaurantId: 1,
  },
  {
    unique: true,
  }
);

// ======================================================
// MODEL
// ======================================================

const Cart: Model<ICart> =
  mongoose.models.Cart ||
  mongoose.model<ICart>("Cart", CartSchema);

export default Cart;