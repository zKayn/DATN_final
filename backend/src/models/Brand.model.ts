// backend/src/models/Brand.model.ts
import { Schema, model, Document } from 'mongoose';

export interface IBrand extends Document {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    logo: String,
    description: String,
    isActive: {
      type: Boolean,
      default: true,
    },
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

BrandSchema.index({ slug: 1 });
BrandSchema.index({ name: 1 });
BrandSchema.index({ isActive: 1 });

export const Brand = model<IBrand>('Brand', BrandSchema);