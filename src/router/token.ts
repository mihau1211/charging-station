import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import cache from '../utils/cache';
import { refreshTokenAuth, generateTokenAuth } from '../middleware/auth';

const router = express.Router();

interface RequestWithToken extends Request {
	token?: string;
}

router.post(
	'/generatetoken',
	generateTokenAuth,
	async (req: Request, res: Response) => {
		const secret = process.env.JWT_SECRET;
		try {
			if (!secret) throw new Error('JWT Secret is missing');
			const token = jwt.sign({ key: Math.random() }, secret, {
				expiresIn: '120s',
			});
			cache.set(token, 'true');
			res.send({ token });
		} catch (error: any) {
			res.status(400).send({ error: error.message });
		}
	},
);

router.post(
	'/refreshtoken',
	refreshTokenAuth,
	async (req: RequestWithToken, res: Response) => {
		const secret = process.env.JWT_SECRET;
		try {
			if (!secret) throw new Error('JWT Secret is missing');
			if (!req.token) throw new Error('Token is missing in request');

			const token = jwt.sign({ key: Math.random() }, secret, {
				expiresIn: '120s',
			});
			cache.del(req.token);
			cache.set(token, 'true');
			res.send({ token: token });
		} catch (error: any) {
			res.status(400).send({ error: error.message });
		}
	},
);

export default router;
