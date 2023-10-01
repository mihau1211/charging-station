import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { refreshTokenAuth, generateTokenAuth } from '../middleware/auth'

const router = express.Router();

const secret = process.env.JWT_SECRET;

interface RequestWithToken extends Request {
    decoded?: object;
  }

router.post('/generatetoken', generateTokenAuth, async (req: Request, res: Response) => {
    try {
        if (!secret) throw new Error('JWT Secret is missing!')
        const token = jwt.sign({ key: process.env.KEY }, secret, { expiresIn: '20s' });
        res.send({ token });
    } catch (error: any) {
        res.status(400).send({ error: error.message });
    }

})

router.post('/refreshtoken', refreshTokenAuth, async (req: RequestWithToken, res: Response) => {
    try {
        if (!secret) throw new Error('JWT Secret is missing.');

        const token = jwt.sign({ key: process.env.KEY }, secret, { expiresIn: '20s' });

        res.send({ token: token });
    } catch (error: any) {
        res.status(400).send({ error: error.message });
    }
});

export default router;