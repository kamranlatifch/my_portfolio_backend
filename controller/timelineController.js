import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/error.js';
import { Timeline } from '../models/timelineSchema.js';
import { v2 as cloudinary } from 'cloudinary';
export const postTimeline = catchAsyncErrors(async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler(400, 'Timeline Image is required'));
  }
  const { image } = req.files;
  const { title, description, responsibilities, order, from, to } = req.body;
  if (!title || !description || !from || !order || !responsibilities) {
    return next(new ErrorHandler(400, 'All fields are required'));
  }
  const cloudinaryResponse = await cloudinary.uploader.upload(
    image.tempFilePath,
    {
      folder: 'TIMELINE',
    }
  );
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      cloudinaryResponse.error || 'Cloudinary error for uploading avatar'
    );
  }
  const timeline = await Timeline.create({
    title,
    description,
    timeline: {
      from,
      to,
    },
    order,
    responsibilities,
    image: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });
  res.status(201).json({
    success: true,
    message: 'Timeline added successfully',
    timeline,
  });
});

export const deleteTimeline = catchAsyncErrors(async (req, res) => {
  const { id } = req.params;
  const timeline = await Timeline.findById(id);
  if (!timeline) {
    return next(new ErrorHandler(404, `Timeline not found with ID ${id}`));
  }
  const image_id = timeline.image.public_id;
  await cloudinary.uploader.destroy(image_id);
  await timeline.deleteOne();
  res.status(200).json({
    success: true,
    message: 'Timeline deleted successfully.',
  });
});

export const getAllTimelines = catchAsyncErrors(async (req, res) => {
  const timelines = await Timeline.find();
  res.status(200).json({
    success: true,
    timelines,
  });
});

export const updateTimeLine = catchAsyncErrors(async (req, res) => {
  const { id } = req.params;
  const timeline = await Timeline.findById(id);
  if (!timeline) {
    return next(new ErrorHandler(404, `Timeline not found with ID ${id}`));
  }
  if (req.files) {
    const { image } = req.files;
    const cloudinaryResponse = await cloudinary.uploader.upload(
      image.tempFilePath,
      {
        folder: 'TIMELINE',
      }
    );
    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.error(
        cloudinaryResponse.error || 'Cloudinary error for uploading avatar'
      );
    }
    const image_id = timeline.image.public_id;
    await cloudinary.uploader.destroy(image_id);
    timeline.image = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
  }
  timeline.title = req.body.title || timeline.title;
  timeline.description = req.body.description || timeline.description;
  timeline.timeline.from = req.body.from || timeline.timeline.from;
  timeline.timeline.to = req.body.to || timeline.timeline.to;
  timeline.order = req.body.order || timeline.timeline.order;
  timeline.responsibilities =
    req.body.responsibilities || timeline.responsibilities;

  await timeline.save();
  res.status(200).json({
    success: true,
    message: 'Timeline updated successfully',
    timeline,
  });
});

export const getSingleTimeline = catchAsyncErrors(async (req, res) => {
  const { id } = req.params;
  const timeline = await Timeline.findById(id);
  if (!timeline) {
    return next(new ErrorHandler(404, `Timeline not found with ID ${id}`));
  }
  res.status(200).json({
    success: true,
    timeline,
  });
});
