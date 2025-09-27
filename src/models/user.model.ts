import { Document, model, Schema } from "mongoose";


export enum UserRole {
    ADMIN = "admin",
    END_USER = "endUser"
}

export interface IUser extends Document {
    name: string
    email: string
    password: string
    role: UserRole
    createdAt: Date
    updatedAt: Date
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: [true, "Name is required"] },
  email: { type: String, required: [true, "Email is required"], unique: true },
  password: { type: String, required: [true, "Password is required"] },
  role: { type: String, enum: UserRole, default: UserRole.END_USER },
},
    {timestamps: true}
);

export const UserModel = model<IUser>("User", userSchema)