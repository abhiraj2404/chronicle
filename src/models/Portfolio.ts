import mongoose, { Schema, Document } from 'mongoose';

export interface IPortfolio extends Document {
    walletAddress: string;
    tokenCA: string;
    balance: number; // Total held amount of the memecoin
    totalInvested: number; // Helper metric for PnL logic later on
    createdAt: Date;
    updatedAt: Date;
}

const PortfolioSchema: Schema = new Schema(
    {
        walletAddress: { type: String, required: true },
        tokenCA: { type: String, required: true },
        balance: { type: Number, required: true, default: 0 },
        totalInvested: { type: Number, required: true, default: 0 },
    },
    { timestamps: true }
);

// Compound index to help fetch all tokens held by a specific wallet quickly
PortfolioSchema.index({ walletAddress: 1, tokenCA: 1 }, { unique: true });

export const Portfolio =
    mongoose.models.Portfolio ||
    mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);
