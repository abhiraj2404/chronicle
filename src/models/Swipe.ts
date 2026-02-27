import mongoose, { Schema, Document } from 'mongoose';

export interface ISwipe extends Document {
    swiperWallet: string;
    postId: mongoose.Types.ObjectId;
    isRightSwipe: boolean;
    createdAt: Date;
}

const SwipeSchema: Schema = new Schema(
    {
        swiperWallet: { type: String, required: true },
        postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
        isRightSwipe: { type: Boolean, required: true },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Compound index to prevent duplicate swipes by the same user on the same post
SwipeSchema.index({ swiperWallet: 1, postId: 1 }, { unique: true });

export const Swipe = mongoose.models.Swipe || mongoose.model<ISwipe>('Swipe', SwipeSchema);
