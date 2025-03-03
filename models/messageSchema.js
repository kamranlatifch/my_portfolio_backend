import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderName: {
    type: String,
    minLength: [2, 'Name must contain 2 characters!'],
  },
  subject: {
    type: String,
    minLength: [2, 'Subject must contain 2 characters!'],
  },
  message: {
    type: String,
    minLength: [10, 'Message must contain 10 characters!'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

export const Message = mongoose.model('Message', messageSchema);
