import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

export type SubscriptionStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "CANCELLED";

export interface ISubscription extends Document {
  restaurantId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;

  status: SubscriptionStatus;

  startDate: Date;
  endDate: Date;

  autoRenew: boolean;

  priceAtPurchase: number;
  billingCycle:
    | "MONTHLY"
    | "YEARLY";

  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema =
  new Schema<ISubscription>(
    {
      restaurantId: {
        type: Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
        index: true,
      },

      planId: {
        type: Schema.Types.ObjectId,
        ref: "Plan",
        required: true,
        index: true,
      },

      status: {
        type: String,
        enum: [
          "ACTIVE",
          "EXPIRED",
          "CANCELLED",
        ],
        default: "ACTIVE",
        index: true,
      },

      startDate: {
        type: Date,
        required: true,
      },

      endDate: {
        type: Date,
        required: true,
      },

      autoRenew: {
        type: Boolean,
        default: true,
      },

      priceAtPurchase: {
        type: Number,
        required: true,
        min: 0,
      },

      billingCycle: {
        type: String,
        enum: [
          "MONTHLY",
          "YEARLY",
        ],
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

SubscriptionSchema.index(
  {
    restaurantId: 1,
    status: 1,
  }
);

SubscriptionSchema.index(
  {
    endDate: 1,
    status: 1,
  }
);

const Subscription: Model<ISubscription> =
  mongoose.models.Subscription ||
  mongoose.model<ISubscription>(
    "Subscription",
    SubscriptionSchema
  );

export default Subscription;