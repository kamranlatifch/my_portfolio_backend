import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/error.js';
import { Skills } from '../models/skillsSchema.js';
import { v2 as cloudinary } from 'cloudinary';

export const addNewSkill = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler(400, 'Skill Image is required'));
  }

  const { image } = req.files;
  const { name, proficiency } = req.body;
  if (!name || !proficiency) {
    return next(new ErrorHandler(400, 'Name and Proficiency are required'));
  }
  const cloudinaryResponse = await cloudinary.uploader.upload(
    image.tempFilePath,
    {
      folder: 'SKILLS',
    }
  );
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      cloudinaryResponse.error || 'Cloudinary error for uploading avatar'
    );
  }

  const skill = await Skills.create({
    name,
    proficiency,
    image: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });
  res.status(201).json({
    success: true,
    message: 'Skill added successfully',
    skill,
  });
});

export const getSingleSkill = catchAsyncErrors(async (req, res, next) => {
  const skill = await Skills.findById(req.params.id);
  if (!skill) {
    return next(new ErrorHandler(404, 'Skill not found'));
  }
  res.status(200).json({
    success: true,
    skill,
  });
});

export const updateSkill = catchAsyncErrors(async (req, res, next) => {
  const skill = await Skills.findById(req.params.id);
  if (!skill) {
    return next(new ErrorHandler(404, 'Skill not found'));
  }
  if (req.files) {
    const { image } = req.files;
    const cloudinaryResponse = await cloudinary.uploader.upload(
      image.tempFilePath,
      {
        folder: 'SKILLS',
      }
    );
    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.error(
        cloudinaryResponse.error || 'Cloudinary error for uploading avatar'
      );
    }
    const image_id = skill.image.public_id;
    await cloudinary.uploader.destroy(image_id);
    skill.image = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
  }
  skill.name = req.body.name || skill.name;
  skill.proficiency = req.body.proficiency || skill.proficiency;
  await skill.save();

  res.status(200).json({
    success: true,
    message: 'Skill updated successfully',
    skill,
  });
});

export const getAllSkills = catchAsyncErrors(async (req, res, next) => {
  const skills = await Skills.find();
  res.status(200).json({
    success: true,
    skills,
  });
});

export const deleteSkill = catchAsyncErrors(async (req, res, next) => {
  const skill = await Skills.findById(req.params.id);
  if (!skill) {
    return next(new ErrorHandler(404, 'Skill not found'));
  }
  const image_id = skill.image.public_id;
  await cloudinary.uploader.destroy(image_id);
  await skill.deleteOne();
  res.status(200).json({
    success: true,
    message: 'Skill deleted successfully',
  });
});
