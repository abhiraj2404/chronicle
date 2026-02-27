import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    walletAddress: string;
    tokenCA: string;
    type: 'BUY' | 'SELL';
    amount: number; // The amount of memecoin transacted
    pricePaid: number; // The absolute price paid or received in USDC/SOL at the time of trade
    createdAt: Date;
}

const TransactionSchema: Schema = new Schema(
    {
        walletAddress: { type: String, required: true },
        tokenCA: { type: String, required: true },
        type: { type: String, enum: ['BUY', 'SELL'], required: true },
        amount: { type: Number, required: true },
        pricePaid: { type: Number, required: true },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const Transaction =
    mongoose.models.Transaction ||
    mongoose.model<ITransaction>('Transaction', TransactionSchema);
