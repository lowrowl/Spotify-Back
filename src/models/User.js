import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    lastname: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    country: { type: String },
    role: {
      type: String,
      enum: ['usuario', 'autor', 'admin'],
      default: 'usuario'
    }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
