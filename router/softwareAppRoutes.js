import express from 'express';

import { isAuthenticated } from '../middlewares/auth.js';
import {
  addNewApplication,
  deleteApplication,
  getAllApplications,
  getSingleApplication,
  updateSoftwareApp,
} from '../controller/softwareAppController.js';

const router = express.Router();

router.post('/add', isAuthenticated, addNewApplication);
router.get('/getAll', getAllApplications);
router.get('/get/:id', isAuthenticated, getSingleApplication);
router.patch('/update/:id', isAuthenticated, updateSoftwareApp);
router.delete('/delete/:id', isAuthenticated, deleteApplication);

export default router;
