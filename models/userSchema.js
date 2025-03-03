import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
  },
  phone: {
    type: String,
    required: [true, 'Phone Number is required'],
  },
  aboutMe: {
    type: String,
    required: [true, 'About Me is required'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [8, 'Password must be at least 8 characters long'],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  resume: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  portfolioUrl: {
    type: String,
    required: [true, 'Portfolio URL is required'],
  },
  githubUrl: String,
  instagramUrl: String,
  facebookUrl: String,
  twitterUrl: String,
  linkedInUrl: String,
  videoUrl: String,
  youtubeUrl: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});
// For hashing password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});
// For comparing password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
// Generating json web token

userSchema.methods.generateWebToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

// for forget password
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

export const User = mongoose.model('User', userSchema);
