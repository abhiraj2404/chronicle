import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
    creatorWallet: string;
    contentUrl: string;
    caption: string;
    tokenCA: string;
    rightSwipes: number;
    tapestryContentId?: string;
    createdAt: Date;
}

const PostSchema: Schema = new Schema(
    {
        creatorWallet: { type: String, required: true },
        contentUrl: { type: String, required: true },
        caption: { type: String, required: true },
        tokenCA: { type: String, required: true },
        rightSwipes: { type: Number, default: 0 },
        tapestryContentId: { type: String },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const Post = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
