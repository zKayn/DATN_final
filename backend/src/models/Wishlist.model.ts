// backend/src/models/Wishlist.model.ts
export interface IWishlist extends Document {
  _id: string;
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
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

WishlistSchema.index({ userId: 1 });
WishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const Wishlist = model<IWishlist>('Wishlist', WishlistSchema);