import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';
import cache from '../src/utils/cache';

const apiKey = 'key';
const secret = 'secret';
const validToken = jwt.sign({ key: Math.random() }, secret, { expiresIn: '120s' })

describe('Authorization endpoints tests', () => {
    beforeEach(() => {
        process.env.API_KEY = apiKey;
        process.env.JWT_SECRET = secret;
    })

    test('should generate token', async () => {
        const response = await request(app)
            .post('/api/v1/generatetoken')
            .set('x-api-key', `${process.env.API_KEY}`)
            .send();

        expect(response.body.token).toBeDefined();
        expect(response.status).toBe(200);
    });

    test('should return 403 and not generate token when API_KEY is not exist', async () => {
        delete process.env.API_KEY;

        const response = await request(app)
            .post('/api/v1/generatetoken')
            .set('x-api-key', `${process.env.API_KEY}`)
            .send();

        expect(response.status).toBe(403);
    });

    test('should return 403 and not generate token when JWT_SECRET is not exist', async () => {
        delete process.env.JWT_SECRET;

        const response = await request(app)
            .post('/api/v1/generatetoken')
            .set('x-api-key', `${process.env.API_KEY}`)
            .send();

        expect(response.status).toBe(400);
    });

    test('should refresh token', async () => {
        cache.set(validToken, 'true');
        const response = await request(app)
            .post('/api/v1/refreshtoken')
            .set('Authorization', `Bearer ${validToken}`)
            .send();

        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
    });

    test('should return 401 and not refresh token when validToken is not in cache', async () => {
        const response = await request(app)
            .post('/api/v1/refreshtoken')
            .set('Authorization', `Bearer ${validToken}`)
            .send();

        expect(response.status).toBe(401);
    });

    test('should return 401 and not refresh token when token is invalid', async () => {
        cache.set('sometoken', 'true')
        const response = await request(app)
            .post('/api/v1/refreshtoken')
            .set('Authorization', `Bearer sometoken`)
            .send();

        expect(response.status).toBe(401);
    });

    test('should return 401 and not refresh token when token is not provided', async () => {
        const response = await request(app)
            .post('/api/v1/refreshtoken')
            .send();

        expect(response.status).toBe(401);
    });

    test('should return 401 and not refresh token when JWT_SECRET is missing', async () => {
        delete process.env.JWT_SECRET;

        const response = await request(app)
            .post('/api/v1/refreshtoken')
            .set('Authorization', `Bearer ${validToken}`)
            .send();

        expect(response.status).toBe(401);
    });
});