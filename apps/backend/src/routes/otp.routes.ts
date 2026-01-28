import { Router } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { OTP } from "../modules/otp/otp.model";

const router = Router();

/**
 * POST /api/otp/send
 */
router.post("/send", async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ message: "Phone required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await bcrypt.hash(otp, 10);

  await OTP.deleteMany({ phone });

  await OTP.create({
    phone,
    otpHash,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  });

  // 📲 Replace with SMS provider later
  console.log("OTP for", phone, ":", otp);

  res.json({ success: true });
});

/**
 * POST /api/otp/verify
 */
router.post("/verify", async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ message: "Invalid request" });
  }

  const record = await OTP.findOne({ phone });
  if (!record) {
    return res.status(400).json({ message: "OTP not found" });
  }

  if (record.expiresAt < new Date()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  const isValid = await bcrypt.compare(otp, record.otpHash);
  if (!isValid) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  await OTP.deleteMany({ phone });

  const verificationToken = crypto
    .createHash("sha256")
    .update(phone + process.env.JWT_SECRET)
    .digest("hex");

  res.json({
    success: true,
    verificationToken
  });
});

export default router;
