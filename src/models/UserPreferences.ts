import mongoose, { Schema, Document } from 'mongoose';

export interface IUserPreferences extends Document {
    walletAddress: string;
    defaultBuyAmount: number; // Stored in USD or Native Token (e.g. USDC or SOL) depending on frontend logic
    createdAt: Date;
    updatedAt: Date;
}

const UserPreferencesSchema: Schema = new Schema(
    {
        walletAddress: { type: String, required: true, unique: true },
        defaultBuyAmount: { type: Number, required: true, default: 0 },
    },
    { timestamps: true }
);

export const UserPreferences =
    mongoose.models.UserPreferences ||
    mongoose.model<IUserPreferences>('UserPreferences', UserPreferencesSchema);
