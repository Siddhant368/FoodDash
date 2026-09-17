export type DeliveryStatus =
  | "ASSIGNED"
  | "ACCEPTED"
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface DeliveryOrder {
  assignment: {
    id: string;
    status: DeliveryStatus;
    assignedAt?: string;
    acceptedAt?: string;
    pickedUpAt?: string;
    outForDeliveryAt?: string;
    deliveredAt?: string;
    deliveryNote?: string;
  };
  order: {
    id: string;
    customerId: string;
    items: {
      name: string;
      price: number;
      quantity: number;
      subtotal: number;
      image?: string;
    }[];
    subtotal: number;
    deliveryFee: number;
    tax: number;
    discount: number;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    deliveryAddress: {
      name: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      pincode: string;
    };
    customerNote?: string;
    createdAt: string;
  };
}