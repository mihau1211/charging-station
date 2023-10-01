import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { cache } from '../app';
import { refreshTokenAuth, generateTokenAuth, auth } from '../middleware/auth'

const router = express.Router();

const secret = process.env.JWT_SECRET;

interface RequestWithToken extends Request {
    token?: string;
  }

router.post('/generatetoken', generateTokenAuth, async (req: Request, res: Response) => {
    try {
        if (!secret) throw new Error('JWT Secret is missing')
        const token = jwt.sign({ key: process.env.KEY }, secret, { expiresIn: '20s' });
        cache.set(token, 'true');
        res.send({ token });
    } catch (error: any) {
        res.status(400).send({ error: error.message });
    }

})

router.post('/refreshtoken', refreshTokenAuth, async (req: RequestWithToken, res: Response) => {
    try {
        if (!secret) throw new Error('JWT Secret is missing');
        if (!req.token) throw new Error('Token is missing in request');

        const token = jwt.sign({ key: process.env.KEY }, secret, { expiresIn: '20s' });
        cache.del(req.token)
        cache.set(token, 'true')
        res.send({ token: token });
    } catch (error: any) {
        res.status(400).send({ error: error.message });
    }
});

export default router;