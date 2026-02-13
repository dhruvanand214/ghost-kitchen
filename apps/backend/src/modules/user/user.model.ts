import mongoose from "mongoose";
import { UserRole } from "../../shared/role.enum";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true
    },
    kitchenId: {
      type: mongoose.Schema.Types.ObjectId,
      required: function () {
        return this.role === UserRole.KITCHEN;
      }
    }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
