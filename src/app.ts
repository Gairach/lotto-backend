import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';

const app = express();
app.use(cors());
app.use(express.json());

// เส้น API สำหรับ users
app.use('/users', userRoutes);

export default app;
