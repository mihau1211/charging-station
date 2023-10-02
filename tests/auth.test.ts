import * as authMiddleware from '../src/middleware/auth';
import jwt from 'jsonwebtoken';
import cache from '../src/utils/cache';

const { auth, generateTokenAuth, refreshTokenAuth } = authMiddleware;

const secret = 'secret';
const apiKey = 'key';

let mockRequest: any;
let mockResponse: any;
let nextFunction = jest.fn();

beforeEach(() => {
    process.env.JWT_SECRET = secret;
    process.env.API_KEY = apiKey;

    mockRequest = {
        header: jest.fn()
    };
    mockResponse = {
        status: jest.fn(() => mockResponse),
        send: jest.fn()
    };
    nextFunction.mockReset();
});

describe('generateTokenAuth Middleware Unit Test', () => {
    test('should return 403 if no API key is set in the environment', async () => {
        delete process.env.API_KEY;

        await generateTokenAuth(mockRequest, mockResponse, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.send).toHaveBeenCalledWith({ error: 'No valid API key is set in the environment' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 403 if no API key is provided in the request', async () => {
        await generateTokenAuth(mockRequest, mockResponse, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.send).toHaveBeenCalledWith({ error: 'Invalid API Key' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 403 if an incorrect API key is provided in the request', async () => {
        const invalidApiKey = 'invalidKey';
        mockRequest.header.mockReturnValue(invalidApiKey);

        await generateTokenAuth(mockRequest, mockResponse, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.send).toHaveBeenCalledWith({ error: 'Invalid API Key' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should call next() if a valid API key is provided in the request', async () => {
        mockRequest.header.mockReturnValue(apiKey);

        await generateTokenAuth(mockRequest, mockResponse, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.send).not.toHaveBeenCalled();
    });
});

describe('auth Middleware Unit Test', () => {
    test('should return 401 if no JWT_SECRET is set in the environment', async () => {
        delete process.env.JWT_SECRET;

        await auth(mockRequest, mockResponse, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.send).toHaveBeenCalledWith({ error: 'JWT Secret is missing' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 401 if no header is set to request', async () => {
        await auth(mockRequest, mockResponse, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.send).toHaveBeenCalledWith({ error: 'Missing header' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token verification fails because of not be in cache', async () => {
        mockRequest.header.mockReturnValue(`Bearer someToken`);

        await auth(mockRequest, mockResponse, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.send).toHaveBeenCalledWith({ error: 'Token is invalid' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token verification fails because of invalid secret in token', async () => {
        const token = jwt.sign({ key: process.env.KEY }, 'invalid', { expiresIn: '20s' });
        cache.set(token, 'true');
        mockRequest.header.mockReturnValue(`Bearer ${token}`);

        await auth(mockRequest, mockResponse, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.send).toHaveBeenCalledWith({ error: 'invalid signature' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token verification fails because of token expired', async () => {
        const token = jwt.sign({ key: process.env.KEY }, secret, { expiresIn: '0s' });
        cache.set(token, 'true');
        mockRequest.header.mockReturnValue(`Bearer ${token}`);

        await auth(mockRequest, mockResponse, nextFunction);
        
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.send).toHaveBeenCalledWith({ error: 'jwt expired' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should invoke next if token verification succeed', async () => {
        const token = jwt.sign({ key: process.env.KEY }, secret, { expiresIn: '20s' });
        cache.set(token, 'true');
        mockRequest.header.mockReturnValue(`Bearer ${token}`);

        await auth(mockRequest, mockResponse, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(mockResponse.send).not.toHaveBeenCalledWith();
        expect(mockResponse.status).not.toHaveBeenCalledWith();
    });
});

describe('refreshTokenAuth Middleware Unit Test', () => {
    test('should return 401 if no JWT_SECRET is set in the environment', async () => {
        delete process.env.JWT_SECRET;

        await refreshTokenAuth(mockRequest, mockResponse, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.send).toHaveBeenCalledWith({ error: 'JWT Secret is missing' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 401 if no header is set to request', async () => {
        await refreshTokenAuth(mockRequest, mockResponse, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.send).toHaveBeenCalledWith({ error: 'Missing header' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token verification fails because of not be in cache', async () => {
        mockRequest.header.mockReturnValue(`Bearer someToken`);

        await refreshTokenAuth(mockRequest, mockResponse, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.send).toHaveBeenCalledWith({ error: 'Token is invalid' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token verification fails because of invalid secret in token', async () => {
        const token = jwt.sign({ key: process.env.KEY }, 'invalid', { expiresIn: '20s' });
        cache.set(token, 'true');
        mockRequest.header.mockReturnValue(`Bearer ${token}`);

        await refreshTokenAuth(mockRequest, mockResponse, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.send).toHaveBeenCalledWith({ error: 'invalid signature' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should invoke next if token verification succeed', async () => {
        const token = jwt.sign({ key: process.env.KEY }, secret, { expiresIn: '20s' });
        cache.set(token, 'true');
        mockRequest.header.mockReturnValue(`Bearer ${token}`);

        await refreshTokenAuth(mockRequest, mockResponse, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(mockResponse.send).not.toHaveBeenCalledWith();
        expect(mockResponse.status).not.toHaveBeenCalledWith();
    });
});