import request from 'supertest';
import app from '../src/app';
import { initializeDatabase, sequelize } from '../src/db/dbinit';
import { UUIDV4 } from 'sequelize';
import { chargingStationType1} from './fixtures/db';
import { ChargingStationType } from '../src/models/chargingStationType.model';

const url = '/cstype';
let chargingStationType1Id: string;

beforeEach(async () => {
    await sequelize.sync({ force: true });
    await initializeDatabase();
    const chargingStationType = await ChargingStationType.create(chargingStationType1);
    chargingStationType1Id = chargingStationType.id;
});

afterAll(async () => {
    await sequelize.close();
});

describe('Charging Station Type Router - POST', () => {
    test('should create a new charging station type', async () => {
        const response = await request(app)
            .post(url)
            .send({
                name: 'Type Test',
                plug_count: 2,
                efficiency: 0.9,
                current_type: 'AC'
            });

        expect(response.status).toBe(201);
    });

    test('should not create a new charging station type with duplicated name', async () => {
        const response = await request(app)
            .post(url)
            .send({
                name: 'Type 6',
                plug_count: 2,
                efficiency: 0.9,
                current_type: 'AC'
            });

        expect(response.status).toBe(400);
    });

    test('should not create a new charging station type when any field in body except id is empty', async () => {
        const response = await request(app)
            .post(url)
            .send({
                name: 'Type Test',
                plug_count: 3
            });

        expect(response.status).toBe(400);
    });

    test('should not create a new charging station type when plug_count is type of string', async () => {
        const response = await request(app)
            .post(url)
            .send({
                name: 'Type Test',
                plug_count: 'string',
                efficiency: 0.6,
                current_type: 'AC'
            });

        expect(response.status).toBe(400);
    });

    test('should not create a new charging station type when plug_count is type of float', async () => {
        const response = await request(app)
            .post(url)
            .send({
                name: 'Type Test',
                plug_count: 1.3,
                efficiency: 0.6,
                current_type: 'AC'
            });

        expect(response.status).toBe(400);
    });

    test('should not create a new charging station type when efficiency is type of string', async () => {
        const response = await request(app)
            .post(url)
            .send({
                name: 'Type Test',
                plug_count: 1,
                efficiency: 'string',
                current_type: 'AC'
            });

        expect(response.status).toBe(400);
    });

    test('should not create a new charging station type when current_type value is not \'AC\' or \'DC\'', async () => {
        const response = await request(app)
            .post(url)
            .send({
                name: 'Type Test',
                plug_count: 3,
                efficiency: 0.3,
                current_type: 'AE'
            });

        expect(response.status).toBe(400);
    });

    test('should create a new charging station type when id is provided', async () => {
        const response = await request(app)
            .post(url)
            .send({
                id: UUIDV4,
                name: 'Type Test 2',
                plug_count: 3,
                efficiency: 0.3,
                current_type: 'AC'
            });

        expect(response.status).toBe(201);
    });

    test('should not create a new charging station type when provided id is not type of UUIDV4', async () => {
        const response = await request(app)
            .post(url)
            .send({
                id: 'some-string',
                name: 'Type Test 2',
                plug_count: 3,
                efficiency: 0.3,
                current_type: 'AC'
            });

        expect(response.status).toBe(400);
    });
});

describe('Charging Station Type Router - GET', () => {
    test('should get all charging station types', async () => {
        const response = await request(app)
            .get(url);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBe(6);
    });

    test('should get 4 charging station types with current_type equal to \'AC\'', async () => {
        const response = await request(app)
            .get(`${url}?current_type=AC`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBe(4);
    });

    test('should get 2 charging station types with efficiency is equal to 0.7', async () => {
        const response = await request(app)
            .get(`${url}?efficiency=0.7`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBe(1);
    });

    test('should get 2 charging station types with efficiency between 0.4 and 0.7', async () => {
        const response = await request(app)
            .get(`${url}?minEfficiency=0.4&maxEfficiency=0.7`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBe(2);
    });

    test('should get 2 charging station types with plug_count equals to 3', async () => {
        const response = await request(app)
            .get(`${url}?plug_count=3`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBe(2);
    });

    test('should get 1 charging station types with name equals to \'Type 1\'', async () => {
        const response = await request(app)
            .get(`${url}?name=Type 1`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBe(1);
    });

    test('should get 4 charging station types with offset 2', async () => {
        const response = await request(app)
            .get(`${url}?offset=2`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBe(4);
    });

    test('should get 3 charging station types with limit 3', async () => {
        const response = await request(app)
            .get(`${url}?limit=3`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBe(3);
    });

    test('should get a specific charging station type by id', async () => {
        const response = await request(app)
            .get(`${url}/${chargingStationType1Id}`);
        expect(response.status).toBe(200);
        expect(response.body.id).toBe(chargingStationType1Id);
        expect(response.body.name).toBe(chargingStationType1.name);
        expect(response.body.current_type).toBe(chargingStationType1.current_type);
        expect(response.body.plug_count).toBe(chargingStationType1.plug_count);
        expect(response.body.efficiency).toBe(chargingStationType1.efficiency);
    });

    test('should not get a specific charging station type by id when not exists', async () => {
        const response = await request(app)
            .get(`${url}/cd5fddb1-5a40-4b83-929b-1d00d6361e9e`);
        expect(response.status).toBe(404);
    });

    test('should not get a specific charging station type by id when id format is wrong', async () => {
        const response = await request(app)
            .get(`${url}/cd5fddb1-5a40-4b83-929b`);
        expect(response.status).toBe(404);
    });
})

describe('Charging Station Type Router - PATCH', () => {
    test('should update a specific charging station type by id', async () => {
        const response = await request(app)
            .patch(`${url}/${chargingStationType1Id}`)
            .send({
                name: 'Updated Type Test',
                plug_count: 5,
                efficiency: 0.86,
                current_type: 'AC'
            });

        expect(response.status).toBe(200);
    });

    test('should not update a specific charging station type by id when provided name is not unique', async () => {
        const response = await request(app)
            .patch(`${url}/${chargingStationType1Id}`)
            .send({
                name: 'Type 1'
            });

        expect(response.status).toBe(400);
    });

    test('should not update a specific charging station type by id when id is provided', async () => {
        const response = await request(app)
            .patch(`${url}/${chargingStationType1Id}`)
            .send({
                id: '1e29cddf-d637-48f5-b672-e2634d9395c9'
            });

        expect(response.status).toBe(400);
    });

    test('should not update a specific charging station type by id when not exists', async () => {
        const response = await request(app)
            .patch(`${url}/1e29cddf-d637-48f5-b672-e2634d9395c9`)
            .send({
                name: 'new name'
            });

        expect(response.status).toBe(404);
    });

    test('should not update a specific charging station type by id when plug_count is string', async () => {
        const response = await request(app)
        .patch(`${url}/${chargingStationType1Id}`)
            .send({
                plug_count: 'plug count 1'
            });

        expect(response.status).toBe(400);
    });

    test('should not update a specific charging station type by id when plug_count is string', async () => {
        const response = await request(app)
        .patch(`${url}/${chargingStationType1Id}`)
            .send({
                plug_count: 1.1
            });

        expect(response.status).toBe(400);
    });

    test('should not update a specific charging station type by id when efficiency is string', async () => {
        const response = await request(app)
        .patch(`${url}/${chargingStationType1Id}`)
            .send({
                efficiency: 'plug count 1'
            });

        expect(response.status).toBe(400);
    });

    test('should not update a specific charging station type by id when current_type is not \'AC\' or \'DC\'', async () => {
        const response = await request(app)
        .patch(`${url}/${chargingStationType1Id}`)
            .send({
                current_type: 'AC\\DC'
            });

        expect(response.status).toBe(400);
    });
})