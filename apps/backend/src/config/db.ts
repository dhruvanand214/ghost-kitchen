import mongoose from "mongoose";

const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Forces Node to use Google DNS

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};
