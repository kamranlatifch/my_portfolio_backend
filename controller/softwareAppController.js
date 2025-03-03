import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/error.js';
import { SoftwareApp } from '../models/softwareAppSchema.js';
import { v2 as cloudinary } from 'cloudinary';

export const addNewApplication = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler(400, 'Software App Image is required'));
  }

  const { image } = req.files;
  const { name } = req.body;
  if (!name) {
    return next(new ErrorHandler(400, 'Software name is required'));
  }
  const cloudinaryResponse = await cloudinary.uploader.upload(
    image.tempFilePath,
    {
      folder: 'SOFTWARE_APPLICATIONS',
    }
  );
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      cloudinaryResponse.error || 'Cloudinary error for uploading avatar'
    );
  }

  const softwareApp = await SoftwareApp.create({
    name,
    image: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });
  res.status(201).json({
    success: true,
    message: 'Software App added successfully',
    softwareApp,
  });
});

export const getAllApplications = catchAsyncErrors(async (req, res, next) => {
  const softwareApps = await SoftwareApp.find();
  res.status(200).json({
    success: true,
    softwareApps,
  });
});

export const getSingleApplication = catchAsyncErrors(async (req, res, next) => {
  const softwareApp = await SoftwareApp.findById(req.params.id);
  if (!softwareApp) {
    return next(new ErrorHandler(404, 'Software App not found'));
  }
  res.status(200).json({
    success: true,
    softwareApp,
  });
});

export const updateSoftwareApp = catchAsyncErrors(async (req, res, next) => {
  const softwareApp = await SoftwareApp.findById(req.params.id);
  if (!softwareApp) {
    return next(new ErrorHandler(404, 'Software App not found'));
  }
  if (req.files) {
    const { image } = req.files;
    const cloudinaryResponse = await cloudinary.uploader.upload(
      image.tempFilePath,
      {
        folder: 'SOFTWARE_APPLICATIONS',
      }
    );
    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.error(
        cloudinaryResponse.error || 'Cloudinary error for uploading avatar'
      );
    }
    const image_id = softwareApp.image.public_id;
    await cloudinary.uploader.destroy(image_id);
    softwareApp.image = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
  }
  softwareApp.name = req.body.name || softwareApp.name;
  await softwareApp.save();
  res.status(200).json({
    success: true,
    message: 'Software App updated successfully',
    softwareApp,
  });
});

export const deleteApplication = catchAsyncErrors(async (req, res, next) => {
  const softwareApp = await SoftwareApp.findById(req.params.id);
  if (!softwareApp) {
    return next(new ErrorHandler(404, 'Software App not found'));
  }
  const image_id = softwareApp.image.public_id;
  await cloudinary.uploader.destroy(image_id);
  await softwareApp.deleteOne();
  res.status(200).json({
    success: true,
    message: 'Software App deleted successfully',
  });
});
