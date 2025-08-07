import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import Database from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

Database.initialize();

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
})