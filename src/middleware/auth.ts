import { NextFunction } from 'express';
import cache from '../utils/cache';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

const validate = async (req: any) => {
	const secret = process.env.JWT_SECRET;
	if (!secret) throw new Error('JWT Secret is missing');
	if (!req.header('Authorization')) throw new Error('Missing header');
	const token = req.header('Authorization').replace('Bearer ', '');
	const isExist = cache.get(token);
	if (!isExist) throw new Error('Token is invalid');
	return { token, secret };
};

const auth = async (req: any, res: any, next: NextFunction) => {
	try {
		const { token, secret } = await validate(req);
		const decoded = jwt.verify(token, secret);
		if (typeof decoded === 'string') throw new Error();
		next();
	} catch (error: any) {
		logger.error('Authentication failure', 'API');
		res.status(401).send({ error: error.message });
	}
};

const refreshTokenAuth = async (req: any, res: any, next: Function) => {
	try {
		const { token, secret } = await validate(req);
		jwt.verify(token, secret, { ignoreExpiration: true });
		req.token = token;
		next();
	} catch (error: any) {
		logger.error('Authentication failure', 'API');
		res.status(401).send({ error: error.message });
	}
};

const generateTokenAuth = async (req: any, res: any, next: Function) => {
	const apiKey = req.header('x-api-key');
	const validApiKey = process.env.API_KEY;

	if (!validApiKey) return res.status(403).send({ error: 'No valid API key is set in the environment' });

	if (!apiKey || apiKey !== validApiKey) {
		logger.error('Authentication failure: wrong API Key', 'API');
		return res.status(403).send({ error: 'Invalid API Key' });
	}

	next();
};

export { auth, refreshTokenAuth, generateTokenAuth };
