import { Document, model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export enum UserRole {
  ADMIN = "admin",
  END_USER = "endUser",
}

export enum ApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

type UserStatus = "active" | "inactive" | "banned";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: UserRole;
  address?: IAddress;
  deleted: boolean;
  status: UserStatus;
  approvalStatus: ApprovalStatus;
  approvalToken: string | null;
  approvalTokenExpiry: Date | null;
  approvedAt: Date | null;
  approvedBy: string | null;
  rejectedAt: Date | null;
  rejectedBy: string | null;
  rejectionReason: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive", "banned"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[\d\s\-\+\(\)]+$/, "Please enter a valid phone number"],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.END_USER,
    },
    address: {
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      zipCode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
      },
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    approvalStatus: {
      type: String,
      enum: Object.values(ApprovalStatus),
      default: ApprovalStatus.PENDING,
    },
    approvalToken: {
      type: String,
      default: null,
    },
    approvalTokenExpiry: {
      type: Date,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: String,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    rejectedBy: {
      type: String,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ deleted: 1 });
userSchema.index({ email: 1, name: 1, phoneNumber: 1 });
userSchema.index({ approvalStatus: 1 });
userSchema.index({ approvalToken: 1 });

// Hash password before saving
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const UserModel = model<IUser>("User", userSchema);
