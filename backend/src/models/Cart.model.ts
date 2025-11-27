// backend/src/models/Cart.model.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface ICartItem extends Document {
  _id: string;
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  quantity: number;
  size?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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

CartItemSchema.index({ userId: 1 });
CartItemSchema.index({ userId: 1, productId: 1, size: 1, color: 1 }, { unique: true });

export const CartItem = model<ICartItem>('CartItem', CartItemSchema);