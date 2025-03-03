import express from 'express';

import { isAuthenticated } from '../middlewares/auth.js';
import {
  deleteTimeline,
  getAllTimelines,
  getSingleTimeline,
  postTimeline,
  updateTimeLine,
} from '../controller/timelineController.js';

const router = express.Router();

router.post('/add', isAuthenticated, postTimeline);
router.patch('/update/:id', isAuthenticated, updateTimeLine);
router.get('/get/:id', isAuthenticated, getSingleTimeline);
router.delete('/delete/:id', isAuthenticated, deleteTimeline);
router.get('/getAll', getAllTimelines);

export default router;
