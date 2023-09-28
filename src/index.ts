import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../dev.env') });
import express, { Request, Response } from 'express'
import { initializeDatabase } from './db/dbinit';

const app = express()
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

initializeDatabase();

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});