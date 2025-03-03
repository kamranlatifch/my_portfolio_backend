import express from 'express';

import { isAuthenticated } from '../middlewares/auth.js';
import {
  addNewProject,
  deleteProject,
  getAllProjects,
  getSingleProject,
  updateProject,
} from '../controller/projectController.js';

const router = express.Router();

router.post('/add', isAuthenticated, addNewProject);
router.get('/getAll', getAllProjects);
router.get('/get/:id', isAuthenticated, getSingleProject);
router.patch('/update/:id', isAuthenticated, updateProject);
router.delete('/delete/:id', isAuthenticated, deleteProject);

export default router;
