import express from 'express';

import { isAuthenticated } from '../middlewares/auth.js';
import {
  addNewSkill,
  deleteSkill,
  getAllSkills,
  getSingleSkill,
  updateSkill,
} from '../controller/skillController.js';

const router = express.Router();

router.post('/add', isAuthenticated, addNewSkill);
router.get('/getAll', getAllSkills);
router.get('/get/:id', isAuthenticated, getSingleSkill);
router.patch('/update/:id', isAuthenticated, updateSkill);
router.delete('/delete/:id', isAuthenticated, deleteSkill);

export default router;
