import mongoose from 'mongoose';

const softwareAppSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
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
export const SoftwareApp = mongoose.model('SoftwareApp', softwareAppSchema);
