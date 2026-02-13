import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import { connectDB } from "../config/db";
import { User } from "../modules/user/user.model";
import { UserRole } from "../shared/role.enum";

async function seedAdmin() {
  await connectDB();

  const existing = await User.findOne({ role: UserRole.ADMIN });
  if (existing) {
    console.log("Admin already exists");
    return;
  }

  const password = await bcrypt.hash("admin123", 10);

  await User.create({
    email: "admin@ghostkitchen.com",
    password,
    role: UserRole.ADMIN
  });

  console.log("Admin created");
  process.exit();
}

seedAdmin();
