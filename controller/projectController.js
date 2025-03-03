import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/error.js';
import { Project } from '../models/projectSchema.js';
import { v2 as cloudinary } from 'cloudinary';

export const addNewProject = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler(400, 'Project Image is required'));
  }

  const { image } = req.files;
  const {
    title,
    description,
    gitRepoLink,
    projectLink,
    technologies,
    stack,
    deployed,
  } = req.body;
  if (!title || !description || !technologies || !stack || !deployed) {
    return next(
      new ErrorHandler(
        400,
        'All fields are required except git and project link'
      )
    );
  }
  const cloudinaryResponse = await cloudinary.uploader.upload(
    image.tempFilePath,
    {
      folder: 'PROJECTS',
    }
  );
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      cloudinaryResponse.error || 'Cloudinary error for uploading avatar'
    );
  }

  const project = await Project.create({
    title,
    description,
    gitRepoLink,
    projectLink,
    technologies,
    stack,
    deployed,
    image: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });
  res.status(201).json({
    success: true,
    message: 'Project added successfully',
    project,
  });
});

export const getAllProjects = catchAsyncErrors(async (req, res, next) => {
  const projects = await Project.find();
  res.status(200).json({
    success: true,
    projects,
  });
});

export const getSingleProject = catchAsyncErrors(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return next(new ErrorHandler(404, 'Project not found'));
  }
  res.status(200).json({
    success: true,
    project,
  });
});
export const updateProject = catchAsyncErrors(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return next(new ErrorHandler(404, 'Project not found'));
  }
  if (req.files) {
    const { image } = req.files;
    const cloudinaryResponse = await cloudinary.uploader.upload(
      image.tempFilePath,
      {
        folder: 'PROJECTS',
      }
    );
    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.error(
        cloudinaryResponse.error || 'Cloudinary error for uploading avatar'
      );
    }
    const image_id = project.image.public_id;
    await cloudinary.uploader.destroy(image_id);
    project.image = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
  }
  const {
    title,
    description,
    gitRepoLink,
    projectLink,
    technologies,
    stack,
    deployed,
  } = req.body;
  project.title = title;
  project.description = description;
  project.gitRepoLink = gitRepoLink;
  project.projectLink = projectLink;
  project.technologies = technologies;
  project.stack = stack;
  project.deployed = deployed;
  await project.save();
  res.status(200).json({
    success: true,
    message: 'Project updated successfully',
    project,
  });
});

export const deleteProject = catchAsyncErrors(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return next(new ErrorHandler(404, 'Project not found'));
  }
  const image_id = project.image.public_id;
  await cloudinary.uploader.destroy(image_id);
  await project.deleteOne();
  res.status(200).json({
    success: true,
    message: 'Project deleted successfully',
  });
});
