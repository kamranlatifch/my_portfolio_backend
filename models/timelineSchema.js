import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  order: {
    type: String,
    required: [true, 'Order is required'],
  },
  timeline: {
    from: {
      type: String,
      required: [true, 'From date is required'],
    },
    to: String,
  },
  responsibilities: {
    type: String,
    required: [true, 'Responsibilities are required'],
  },
  image: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
});

export const Timeline = mongoose.model('Timeline', timelineSchema);
