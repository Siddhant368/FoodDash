import mongoose, { Document, Model } from "mongoose";

export interface IPlatformSettings extends Document {
  general: {
    platformName: string;
    currency: string;
    timezone: string;
    language: string;
    supportEmail: string;
    supportPhone: string;
  };
  platform: {
    maintenanceMode: boolean;
    customerRegistration: boolean;
    restaurantRegistration: boolean;
    restaurantApproval: boolean;
  };
  restaurantDefaults: {
    currency: string;
    timezone: string;
    defaultDeliveryFee: number;
    defaultTax: number;
    defaultPreparationTime: number;
  };
  order: {
    minimumOrder: number;
    defaultDeliveryFee: number;
    taxPercentage: number;
    customerCancellation: boolean;
    cancellationWindow: number;
    autoConfirm: boolean;
  };
  delivery: {
    enabled: boolean;
    radius: number;
    autoAssignment: boolean;
    reassignment: boolean;
  };
  notifications: {
    newOrder: boolean;
    orderConfirmed: boolean;
    orderPreparing: boolean;
    orderReady: boolean;
    outForDelivery: boolean;
    orderDelivered: boolean;
    orderCancelled: boolean;
    newRestaurant: boolean;
    subscriptionExpiring: boolean;
    subscriptionExpired: boolean;
  };
  subscription: {
    enabled: boolean;
    trialEnabled: boolean;
    trialDays: number;
    expiryWarningDays: number;
    gracePeriod: number;
    autoRenewDefault: boolean;
  };
  payment: {
    cod: boolean;
    onlinePayment: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword?: string;
    fromName: string;
    fromEmail: string;
    enabled: boolean;
  };
}

const settingsSchema = new mongoose.Schema(
  {
    general: {
      platformName: { type: String, default: "FoodHub" },
      currency: { type: String, default: "INR" },
      timezone: { type: String, default: "Asia/Kolkata" },
      language: { type: String, default: "English" },
      supportEmail: { type: String, default: "" },
      supportPhone: { type: String, default: "" },
    },
    platform: {
      maintenanceMode: { type: Boolean, default: false },
      customerRegistration: { type: Boolean, default: true },
      restaurantRegistration: { type: Boolean, default: true },
      restaurantApproval: { type: Boolean, default: true },
    },
    restaurantDefaults: {
      currency: { type: String, default: "INR" },
      timezone: { type: String, default: "Asia/Kolkata" },
      defaultDeliveryFee: { type: Number, default: 40 },
      defaultTax: { type: Number, default: 5 },
      defaultPreparationTime: { type: Number, default: 30 },
    },
    order: {
      minimumOrder: { type: Number, default: 100 },
      defaultDeliveryFee: { type: Number, default: 40 },
      taxPercentage: { type: Number, default: 5 },
      customerCancellation: { type: Boolean, default: true },
      cancellationWindow: { type: Number, default: 5 },
      autoConfirm: { type: Boolean, default: false },
    },
    delivery: {
      enabled: { type: Boolean, default: true },
      radius: { type: Number, default: 10 },
      autoAssignment: { type: Boolean, default: false },
      reassignment: { type: Boolean, default: true },
    },
    notifications: {
      newOrder: { type: Boolean, default: true },
      orderConfirmed: { type: Boolean, default: true },
      orderPreparing: { type: Boolean, default: true },
      orderReady: { type: Boolean, default: true },
      outForDelivery: { type: Boolean, default: true },
      orderDelivered: { type: Boolean, default: true },
      orderCancelled: { type: Boolean, default: true },
      newRestaurant: { type: Boolean, default: true },
      subscriptionExpiring: { type: Boolean, default: true },
      subscriptionExpired: { type: Boolean, default: true },
    },
    subscription: {
      enabled: { type: Boolean, default: true },
      trialEnabled: { type: Boolean, default: true },
      trialDays: { type: Number, default: 7 },
      expiryWarningDays: { type: Number, default: 7 },
      gracePeriod: { type: Number, default: 3 },
      autoRenewDefault: { type: Boolean, default: false },
    },
    payment: {
      cod: { type: Boolean, default: true },
      onlinePayment: { type: Boolean, default: false },
    },
    email: {
      smtpHost: { type: String, default: "" },
      smtpPort: { type: Number, default: 587 },
      smtpUsername: { type: String, default: "" },
      smtpPassword: { type: String, default: "" },
      fromName: { type: String, default: "FoodHub" },
      fromEmail: { type: String, default: "noreply@foodhub.com" },
      enabled: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

const PlatformSettings: Model<IPlatformSettings> =
  mongoose.models.PlatformSettings ||
  mongoose.model<IPlatformSettings>("PlatformSettings", settingsSchema);

export default PlatformSettings;
