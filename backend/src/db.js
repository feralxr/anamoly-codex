import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is required');
  await mongoose.connect(uri);
}

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true, trim: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    username: { type: String, required: true },
    gameName: { type: String, required: true },
    sessionStart: { type: Date, required: true },
    sessionEnd: { type: Date, required: true },
    survivalSeconds: { type: Number, required: true },
    finalScore: { type: Number, required: true },
    causeOfDeath: { type: String, required: true },
    anomaliesFaced: { type: Number, required: true },
    anomaliesSurvived: { type: Number, required: true },
    sanityRemaining: { type: Number, required: true }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

const devlogSchema = new mongoose.Schema(
  {
    tag: { type: String, enum: ['UPDATE', 'BUGFIX', 'UPCOMING', 'WARNING'], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);
export const Devlog = mongoose.models.Devlog || mongoose.model('Devlog', devlogSchema);
