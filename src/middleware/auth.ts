import { NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;

const auth = async (req: any, res: any, next: NextFunction) => {
    try {
        if (!secret) throw new Error('JWT Secret is missing!')
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, secret);
        if (typeof decoded === 'string') throw new Error();
        next();
    } catch (error: any) {
        res.status(401).send({ error: error.message });
    }
};

const refreshTokenAuth = async (req: any, res: any, next: Function) => {
    try {
        if (!secret) throw new Error('JWT Secret is missing!')
        const token = req.header('Authorization').replace('Bearer ', '');
        jwt.verify(token, secret, { ignoreExpiration: true });
        next();
    } catch (error: any) {
        res.status(401).send({ error: error.message });
    }
};

const generateTokenAuth = async (req: any, res: any, next: Function) => {
    const apiKey = req.header('x-api-key');
    const validApiKey = process.env.API_KEY;

    if (!validApiKey) return res.status(403).send({ error: 'No valid API key is set in the environment' });

    if (!apiKey || apiKey !== validApiKey) {
        return res.status(403).send({ error: 'Invalid API Key' });
    }

    next();
};

export {
    auth,
    refreshTokenAuth,
    generateTokenAuth
}