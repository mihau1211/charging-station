import request from 'supertest';
import app from '../src/app';
import { initializeDatabase, sequelize } from '../src/db/dbinit';
import { UUIDV4 } from 'sequelize';
import { chargingStationType1, chargingStationType2, chargingStation1, chargingStation2, chargingStation3 } from './fixtures/db';
import { ChargingStationType } from '../src/models/chargingStationType.model';
import { ChargingStation } from '../src/models/chargingStation.model';

const url = '/cs';
let chargingStationType1Id: string;
let chargingStationType2Id: string;
let chargingStation1Id: string;

jest.mock('../src/middleware/auth', () => ({
    auth: jest.fn((req, res, next) => next()),
    refreshTokenAuth: jest.fn((req, res, next) => next()),
    generateTokenAuth: jest.fn((req, res, next) => next()),
}));

beforeEach(async () => {
    await sequelize.sync({ force: true });
    await initializeDatabase();
    let chargingStationType = await ChargingStationType.create(chargingStationType1);
    chargingStationType1Id = chargingStationType.id;
    chargingStationType = await ChargingStationType.create(chargingStationType2);
    chargingStationType2Id = chargingStationType.id;
    const chargingStation = await ChargingStation.create({ ...chargingStation1, charging_station_type_id: chargingStationType1Id });
    chargingStation1Id = chargingStation.id;
    await ChargingStation.create({ ...chargingStation2, charging_station_type_id: chargingStationType1Id });
    await ChargingStation.create({ ...chargingStation3, charging_station_type_id: chargingStationType1Id });
});

afterAll(async () => {
    await sequelize.close();
});

describe('Charging Station Router - POST', () => {
    test('should create a new charging station', async () => {
        const response = await request(app)
            .post(url)
            .send({
                name: 'Test Charging Station 1',
                device_id: '1b29634d-a62a-4dac-8586-f0946c72e0aa',
                ip_address: '10.10.10.10',
                firmware_version: 'V1',
                charging_station_type_id: chargingStationType1Id
            });

        expect(response.status).toBe(201);
    });

    test('should not create a new charging station when name is not unique', async () => {
        const response = await request(app)
            .post(url)
            .send({
                name: 'CS 1',
                device_id: '1b29634d-a62a-4dac-8586-f0946c72e0aa',
                ip_address: '10.10.10.10',
                firmware_version: 'V1',
                charging_station_type_id: chargingStationType1Id
            });

        expect(response.status).toBe(400);
    });

    test('should not create a new charging station when charging_station_type_id is invalid', async () => {
        const response = await request(app)
            .post(url)
            .send({
                name: 'CS 1',
                device_id: '1b29634d-a62a-4dac-8586-f0946c72e0aa',
                ip_address: '10.10.10.10',
                firmware_version: 'V1',
                charging_station_type_id: 'chargingStationType1Id'
            });

        expect(response.status).toBe(400);
    });

    test('should not create a new charging station when charging_station_type_id is not exist', async () => {
        const response = await request(app)
            .post(url)
            .send({
                name: 'CS 1',
                device_id: '1b29634d-a62a-4dac-8586-f0946c72e0aa',
                ip_address: '10.10.10.10',
                firmware_version: 'V1',
                charging_station_type_id: '1b29634d-a62a-4dac-8586-f0946c72e123'
            });

        expect(response.status).toBe(422);
    });

    test('should not create a new charging station when ip_address is invalid', async () => {
        const response = await request(app)
            .post(url)
            .send({
                name: 'CS 1',
                device_id: '1b29634d-a62a-4dac-8586-f0946c72e0aa',
                ip_address: '10.10.',
                firmware_version: 'V1',
                charging_station_type_id: chargingStationType1Id
            });

        expect(response.status).toBe(400);
    });


    test('should not create a new charging station when device_id is invalid', async () => {
        const response = await request(app)
            .post(url)
            .send({
                name: 'Test Charging Station 1',
                device_id: '1b29634d-a62a-4dac-8586-f0946c72',
                ip_address: '10.10.10.10',
                firmware_version: 'V1',
                charging_station_type_id: chargingStationType1Id
            });

        expect(response.status).toBe(400);
    });

    test('should not create a new charging station when not provide required fields', async () => {
        const response = await request(app)
            .post(url)
            .send({
                name: 'CS 1',
                device_id: '1b29634d-a62a-4dac-8586-f0946c72e0aa',
                charging_station_type_id: chargingStationType1Id
            });

        expect(response.status).toBe(400);
    });

    test('should create a new charging station when id is provided', async () => {
        const response = await request(app)
            .post(url)
            .send({
                id: UUIDV4,
                name: 'Test Charging Station 1',
                device_id: '1b29634d-a62a-4dac-8586-f0946c72e0aa',
                ip_address: '10.10.10.10',
                firmware_version: 'V1',
                charging_station_type_id: chargingStationType1Id
            });

        expect(response.status).toBe(201);
    });

    test('should not create a new charging station when provided id is not type of UUIDV4', async () => {
        const response = await request(app)
            .post(url)
            .send({
                id: 'some-string',
                name: 'Test Charging Station 1',
                device_id: '1b29634d-a62a-4dac-8586-f0946c72e0aa',
                ip_address: '10.10.10.10',
                firmware_version: 'V1',
                charging_station_type_id: chargingStationType1Id
            });

        expect(response.status).toBe(400);
    });

    test('should not create a new charging station when provided id is not unique', async () => {
        const response = await request(app)
            .post(url)
            .send({
                id: chargingStation1Id,
                name: 'Test Charging Station 1',
                device_id: '1b29634d-a62a-4dac-8586-f0946c72e0aa',
                ip_address: '10.10.10.10',
                firmware_version: 'V1',
                charging_station_type_id: chargingStationType1Id
            });

        expect(response.status).toBe(400);
    });
});

describe('Charging Station Router - GET', () => {
    test('should get all charging stations', async () => {
        const response = await request(app)
            .get(url);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBe(3);
    });

    test('should get 1 charging station with name is equal to \'CS 1\'', async () => {
        const response = await request(app)
            .get(`${url}/?name=CS 1`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBe(1);
    });

    test('should get 3 charging stations with device_id is equal to \'1b29634d-a62a-4dac-8586-f0946c72e0aa\'', async () => {
        const response = await request(app)
            .get(`${url}/?device_id=1b29634d-a62a-4dac-8586-f0946c72e0aa`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBe(3);
    });

    test('should get 1 charging station with ip_address is equal to \'10.10.10.10\'', async () => {
        const response = await request(app)
            .get(`${url}/?ip_address=10.10.10.10`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBe(1);
    });

    test('should get 3 charging stations with firmware_version is equal to \'V1\'', async () => {
        const response = await request(app)
            .get(`${url}/?firmware_version=V1`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBe(3);
    });

    test(`should get 3 charging stations with charging_station_type_id is equal to \'${chargingStationType1Id}\'`, async () => {
        const response = await request(app)
            .get(`${url}/?charging_station_type_id=${chargingStationType1Id}`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBe(3);
    });

    test('should get a specific charging station by id', async () => {
        const response = await request(app)
            .get(`${url}/${chargingStation1Id}`);
        expect(response.status).toBe(200);
        expect(response.body.id).toBe(chargingStation1Id);
        expect(response.body.name).toBe(chargingStation1.name);
        expect(response.body.device_id).toBe(chargingStation1.device_id);
        expect(response.body.ip_address).toBe(chargingStation1.ip_address);
        expect(response.body.firmware_version).toBe(chargingStation1.firmware_version);
    });

    test('should not get a specific charging station by id when not exists', async () => {
        const response = await request(app)
            .get(`${url}/1b29634d-a62a-4dac-8586-f0946c72e0aa`);
        expect(response.status).toBe(404);
    });

    test('should not get a specific charging station by id when id format is wrong', async () => {
        const response = await request(app)
            .get(`${url}/cd5fddb1-5a40-4b83-929b`);
        expect(response.status).toBe(404);
    });
});

describe('Charging Station Router - PATCH', () => {
    test('should update a specific charging station by id', async () => {
        const response = await request(app)
            .patch(`${url}/${chargingStation1Id}`)
            .send({
                device_id: '1b29634d-a62a-4dac-8586-f0946c72e0a1',
                ip_address: '127.0.0.1',
                firmware_version: 'V2',
                charging_station_type_id: chargingStationType2Id
            });

        expect(response.status).toBe(200);
    });

    test('should not update a specific charging station by id when id is provided', async () => {
        const response = await request(app)
            .patch(`${url}/${chargingStation1Id}`)
            .send({
                id: '1e29cddf-d637-48f5-b672-e2634d9395c9'
            });

        expect(response.status).toBe(400);
    });

    test('should not update a specific charging station by id when not exists', async () => {
        const response = await request(app)
            .patch(`${url}/1e29cddf-d637-48f5-b672-e2634d9395c9`)
            .send({
                firmware_version: 'V3'
            });

        expect(response.status).toBe(404);
    });

    test('should not update a specific charging station by id when ip_address is not valid', async () => {
        const response = await request(app)
            .patch(`${url}/${chargingStation1Id}`)
            .send({
                ip_address: 'not ip at all'
            });

        expect(response.status).toBe(400);
    });

    test('should not update a specific charging station by id when ip_address is not string', async () => {
        const response = await request(app)
            .patch(`${url}/${chargingStation1Id}`)
            .send({
                ip_address: 1
            });

        expect(response.status).toBe(400);
    });

    test('should not update a specific charging station by id when device_id is not valid', async () => {
        const response = await request(app)
            .patch(`${url}/${chargingStation1Id}`)
            .send({
                device_id: '1e29cddf-d637-48f5-b672'
            });

        expect(response.status).toBe(400);
    });

    test('should not update a specific charging station by id when charging_station_type_id is not valid', async () => {
        const response = await request(app)
            .patch(`${url}/${chargingStation1Id}`)
            .send({
                charging_station_type_id: '1e29cddf-d637-48f5-b672'
            });

        expect(response.status).toBe(400);
    });
});