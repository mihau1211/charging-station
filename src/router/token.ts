import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import cache from '../utils/cache';
import { refreshTokenAuth, generateTokenAuth } from '../middleware/auth';

const router = express.Router();

interface RequestWithToken extends Request {
	token?: string;
}

/**
 * @swagger
 * /api/v1/generatetoken:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Generates a new token
 *     security:
 *       - apikeyAuth: []
 *     responses:
 *       200:
 *         description: A successful response with JWT token
 *         content:
 *           application/json:
 *             example:
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Bad Request, errors in response body
 *       403:
 *         description: Forbidden
 */
router.post('/generatetoken', generateTokenAuth, async (req: Request, res: Response) => {
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
});

/**
 * @swagger
 * /api/v1/refreshtoken:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refreshes the token
 *     security:
 *       - bearerAuth: []
 *     responses:
*       200:
 *         description: A successful response with JWT token
 *         content:
 *           application/json:
 *             example:
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Bad Request, errors in response body
 *       401:
 *         description: Unauthorized
 */
router.post('/refreshtoken', refreshTokenAuth, async (req: RequestWithToken, res: Response) => {
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
});

export default router;
