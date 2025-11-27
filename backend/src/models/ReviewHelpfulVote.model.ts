// backend/src/models/ReviewHelpfulVote.model.ts
export interface IReviewHelpfulVote extends Document {
  _id: string;
  reviewId: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt: Date;
}

const ReviewHelpfulVoteSchema = new Schema<IReviewHelpfulVote>(
  {
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

ReviewHelpfulVoteSchema.index({ reviewId: 1, userId: 1 }, { unique: true });

export const ReviewHelpfulVote = model<IReviewHelpfulVote>('ReviewHelpfulVote', ReviewHelpfulVoteSchema);