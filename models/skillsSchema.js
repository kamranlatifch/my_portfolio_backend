import mongoose from 'mongoose';

const skillsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  proficiency: {
    type: String,
    required: [true, 'Proficiency is required'],
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

export const Skills = mongoose.model('Skills', skillsSchema);
