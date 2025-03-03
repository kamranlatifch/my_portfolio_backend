import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/error.js';
import { User } from '../models/userSchema.js';
import { v2 as cloudinary } from 'cloudinary';
import { generateToken } from '../utils/jwtToken.js';
import { sendEmail } from '../utils/sendEmail.js';
import { Timeline } from '../models/timelineSchema.js';
import { SoftwareApp } from '../models/softwareAppSchema.js';
import { Skills } from '../models/skillsSchema.js';
import { Project } from '../models/projectSchema.js';
import crypto from 'crypto';

export const register = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler(400, 'Avatar and Resume are required'));
  }

  const { avatar, resume } = req.files;
  const cloudinaryResponseForAvatar = await cloudinary.uploader.upload(
    avatar.tempFilePath,
    {
      folder: 'AVATARS',
    }
  );
  if (!cloudinaryResponseForAvatar || cloudinaryResponseForAvatar.error) {
    // return next(new ErrorHandler(400, 'Avatar could not be uploaded'));
    console.log('Cloudinary error for uploading avatar');
  }
  const cloudinaryResponseForResume = await cloudinary.uploader.upload(
    resume.tempFilePath,
    {
      folder: 'MY_RESUME',
    }
  );
  if (!cloudinaryResponseForResume || cloudinaryResponseForResume.error) {
    // return next(new ErrorHandler(400, 'Avatar could not be uploaded'));
    console.log('Cloudinary error for uploading avatar');
  }

  const {
    fullName,
    email,
    phone,
    aboutMe,
    password,
    portfolioUrl,
    githubUrl,
    instagramUrl,
    facebookUrl,
    twitterUrl,
    linkedInUrl,
    videoUrl,
    youtubeUrl,
  } = req.body;

  const user = await User.create({
    fullName,
    email,
    phone,
    aboutMe,
    password,
    portfolioUrl,
    githubUrl,
    instagramUrl,
    facebookUrl,
    twitterUrl,
    linkedInUrl,
    videoUrl,
    youtubeUrl,
    avatar: {
      public_id: cloudinaryResponseForAvatar.public_id,
      url: cloudinaryResponseForAvatar.secure_url,
    },
    resume: {
      public_id: cloudinaryResponseForResume.public_id,
      url: cloudinaryResponseForResume.secure_url,
    },
  });
  generateToken(user, 'User Registered', 201, res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler(400, 'Please enter email and password!'));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new ErrorHandler(401, 'Invalid Email or Password!'));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler(401, 'Invalid Email or Password!'));
  }
  generateToken(user, 'Logged In', 200, res);
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie('token', null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: 'Logged Out',
  });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    user,
  });
});

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    aboutMe: req.body.aboutMe,
    portfolioUrl: req.body.portfolioUrl,
    githubUrl: req.body.githubUrl,
    instagramUrl: req.body.instagramUrl,
    facebookUrl: req.body.facebookUrl,
    twitterUrl: req.body.twitterUrl,
    linkedInUrl: req.body.linkedInUrl,
    videoUrl: req.body.videoUrl,
    youtubeUrl: req.body.youtubeUrl,
  };

  if (req.files && req.files.avatar) {
    const avatar = req.files.avatar;
    const user = await User.findById(req.user._id);
    const profileImageId = user.avatar.public_id;
    await cloudinary.uploader.destroy(profileImageId);
    const cloudinaryResponseForAvatar = await cloudinary.uploader.upload(
      avatar.tempFilePath,
      {
        folder: 'AVATARS',
      }
    );

    newUserData.avatar = {
      public_id: cloudinaryResponseForAvatar.public_id,
      url: cloudinaryResponseForAvatar.secure_url,
    };
  }
  if (req.files && req.files.resume) {
    const resume = req.files.resume;
    const user = await User.findById(req.user._id);
    const resumeId = user.resume.public_id;
    await cloudinary.uploader.destroy(resumeId);
    const cloudinaryResponseForResume = await cloudinary.uploader.upload(
      resume.tempFilePath,
      {
        folder: 'MY_RESUME',
      }
    );

    newUserData.resume = {
      public_id: cloudinaryResponseForResume.public_id,
      url: cloudinaryResponseForResume.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user._id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: 'Profile Updated Successfully',
    user,
  });
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const { current_password, new_password, confirm_new_password } = req.body;
  if (!current_password || !new_password || !confirm_new_password) {
    return next(new ErrorHandler(400, 'Please enter all fields'));
  }
  const user = await User.findById(req.user._id).select('+password');
  const isPasswordMatched = await user.comparePassword(current_password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler(400, 'Invalid current Password'));
  }
  if (new_password !== confirm_new_password) {
    return next(
      new ErrorHandler(400, 'New and Confirm Password does not match')
    );
  }
  user.password = new_password;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
});

export const getUserForPortfolio = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne();
  res.status(200).json({
    success: true,
    user,
  });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler(404, 'User not found with this email'));
  }
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`;
  const message = `Your password reset token is as follow:\n\n${resetPasswordUrl}\n\nIf you have not requested this email, then ignore it.`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Personal Portfolio Password Recovery',
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to: ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(500, error.message));
  }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorHandler(400, 'Token is invalid or has been expired'));
  }
  if (req.body.password !== req.body.confirm_password) {
    return next(
      new ErrorHandler(400, 'Password and confirm password do not match')
    );
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  generateToken(user, 'Password Reset Successfully', 200, res);
});

export const getCompleteData = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne();
  const timelines = await Timeline.find();
  const softwareApps = await SoftwareApp.find();
  const skills = await Skills.find();
  const projects = await Project.find();
  res.status(200).json({
    success: true,
    user,
    timelines,
    softwareApps,
    skills,
    projects,
  });
});
