import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

export type DeliveryAssignmentStatus =
  | "ASSIGNED"
  | "ACCEPTED"
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface IDeliveryAssignment
  extends Document {
  orderId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  deliveryPartnerId: mongoose.Types.ObjectId;

  status: DeliveryAssignmentStatus;

  assignedAt: Date;
  acceptedAt?: Date;
  pickedUpAt?: Date;
  outForDeliveryAt?: Date;
  deliveredAt?: Date;

  deliveryNote?: string;

  createdAt: Date;
  updatedAt: Date;
}

const DeliveryAssignmentSchema =
  new Schema<IDeliveryAssignment>(
    {
      orderId: {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        index: true,
      },

      restaurantId: {
        type: Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
        index: true,
      },

      deliveryPartnerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      status: {
        type: String,
        enum: [
          "ASSIGNED",
          "ACCEPTED",
          "PICKED_UP",
          "OUT_FOR_DELIVERY",
          "DELIVERED",
          "CANCELLED",
        ],
        default: "ASSIGNED",
        index: true,
      },

      assignedAt: {
        type: Date,
        default: Date.now,
      },

      acceptedAt: {
        type: Date,
      },

      pickedUpAt: {
        type: Date,
      },

      outForDeliveryAt: {
        type: Date,
      },

      deliveredAt: {
        type: Date,
      },

      deliveryNote: {
        type: String,
        maxlength: 500,
      },
    },
    {
      timestamps: true,
    }
  );

// Prevent one order from being assigned
// to multiple delivery partners.
DeliveryAssignmentSchema.index(
  { orderId: 1 },
  { unique: true }
);

// Fast delivery partner dashboard queries.
DeliveryAssignmentSchema.index({
  deliveryPartnerId: 1,
  status: 1,
  createdAt: -1,
});

// Fast restaurant assignment queries.
DeliveryAssignmentSchema.index({
  restaurantId: 1,
  status: 1,
  createdAt: -1,
});

const DeliveryAssignment: Model<IDeliveryAssignment> =
  mongoose.models.DeliveryAssignment ||
  mongoose.model<IDeliveryAssignment>(
    "DeliveryAssignment",
    DeliveryAssignmentSchema
  );

export default DeliveryAssignment;