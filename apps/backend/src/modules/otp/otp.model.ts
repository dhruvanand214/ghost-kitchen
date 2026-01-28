import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});

export const OTP = mongoose.model("OTP", OtpSchema);
