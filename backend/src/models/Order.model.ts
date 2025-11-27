// backend/src/models/Order.model.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IOrderItem {
  productId: Types.ObjectId;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  ward?: string;
  district: string;
  city: string;
  zipCode?: string;
}

export interface IOrder extends Document {
  _id: string;
  orderNumber: string;
  userId: Types.ObjectId;
  items: IOrderItem[];
  total: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod: string;
  shippingMethod: string;
  trackingNumber?: string;
  shippingAddress: IShippingAddress;
  notes?: string;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    size: String,
    color: String,
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    ward: String,
    district: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: String,
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [OrderItemSchema],
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    shippingMethod: {
      type: String,
      required: true,
    },
    trackingNumber: String,
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },
    notes: String,
    cancelReason: String,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });

export const Order = model<IOrder>('Order', OrderSchema);