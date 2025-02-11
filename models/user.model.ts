import mongoose, {Document, Model, Schema} from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import 'dotenv/config';

//email regex checker
const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IUser extends Document{
    name: string;
    email:string;
    password: string;
    avatar: {
        public_id: string;
        url: string;
    },
    role:string;
    isVerified: boolean;
    comparePassword: (password: string) => Promise<boolean>;
    SignAccessToken: () => string;
    SignRefreshToken: () => string;
}

//User Schema
const userSchema : Schema<IUser> = new mongoose.Schema({
    name: {
        type : String,
        required: [true, "Enter username"]
    },
    email: {
        type : String,
        required: [true, "Enter username"],
        validate: {
            validator: function (value: string) {
              return emailRegexPattern.test(value);
            },
            message: "please enter a valid email",
          }
    },
    password: {
        type : String,
        required: [true, "Enter username"]
    },
    avatar: {
        public_id: String,
        url: String,
      },
      role: {
        type: String,
        default: "user",
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
    },
    { timestamps: true }
);
 
// sign access token
userSchema.methods.SignAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || "", {
    expiresIn: "1d",
  });
};

// sign refresh token
userSchema.methods.SignRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || "", {
    expiresIn: "3d",
  });
};

// Hash Password before saving
userSchema.pre<IUser>("save", async function (next) {
    if (!this.isModified("password")) {
      next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });

// compare password
userSchema.methods.comparePassword = async function (
    enteredPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  const userModel: Model<IUser> = mongoose.model("User", userSchema);
  export default userModel;