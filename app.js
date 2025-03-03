// This file could be index.js as well

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import dbConnection from './database/dbConnections.js';
import { errorMiddleware } from './middlewares/error.js';
import messageRouter from './router/messageRoutes.js';
import userRouter from './router/userRoutes.js';
import timelineRouter from './router/timelineRoutes.js';
import softwareAppRouter from './router/softwareAppRoutes.js';
import skillRouter from './router/skillRoutes.js';
import projectRouter from './router/projectRoutes.js';

const app = express();
dotenv.config({ path: './config/.env' });
// Middleware between frontend and backend

app.use(
  cors({
    origin: [process.env.PORTFOLIO_URL, process.env.DASHBOARD_URL],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
// Middleware for cookie parser and others
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true, //to get files from frontend
    tempFileDir: '/tmp/',
  })
);

app.use('/api/v1/message', messageRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/timeline', timelineRouter);
app.use('/api/v1/swapp', softwareAppRouter);
app.use('/api/v1/skills', skillRouter);
app.use('/api/v1/project', projectRouter);

dbConnection();
app.use(errorMiddleware);
export default app;
