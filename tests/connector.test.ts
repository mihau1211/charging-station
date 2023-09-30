import request from 'supertest';
import app from '../src/app';
import { initializeDatabase, sequelize } from '../src/db/dbinit';
import { UUIDV4 } from 'sequelize';
import { chargingStationType1, chargingStation1, chargingStation2, connector1, connector2, connector3, connector4 } from './fixtures/db';
import { ChargingStationType } from '../src/models/chargingStationType.model';
import { ChargingStation } from '../src/models/chargingStation.model';
import { Connector } from '../src/models/connector.model';

const url = '/connector';
let chargingStationType1Id: string;
let chargingStation1Id: string;
let connector1Id: string;

beforeEach(async () => {
    await sequelize.sync({ force: true });
    await initializeDatabase();
    const chargingStationType = await ChargingStationType.create(chargingStationType1);
    chargingStationType1Id = chargingStationType.id;
    const chargingStation = await ChargingStation.create({ ...chargingStation1, charging_station_type_id: chargingStationType1Id });
    chargingStation1Id = chargingStation.id;
    const connector = await Connector.create({ ...connector1, charging_station_id: chargingStation1Id })
    connector1Id = connector.id;
    await Connector.create({ ...connector2, charging_station_id: chargingStation1Id });
});

afterAll(async () => {
    await sequelize.close();
});

describe('Connector Router - POST', () => {
    test('should create a new connector', async () => {
        const response = await request(app)
            .post(url)
            .send({
                name: 'Test Charging Station 1',
                priority: false,
                charging_station_id: chargingStation1Id
            });

        expect(response.status).toBe(201);
    });

    test('should create a new connector when id is provided', async () => {
        const response = await request(app)
            .post(url)
            .send({
                id: UUIDV4,
                name: 'Test Charging Station 1',
                priority: false,
                charging_station_id: chargingStation1Id
            });

        expect(response.status).toBe(201);
    });

    test('should not create a new connector when provided id is not type of UUIDV4', async () => {
        const response = await request(app)
            .post(url)
            .send({
                id: 'some id',
                name: 'Test Charging Station 1',
                priority: false,
                charging_station_id: chargingStation1Id
            });

        expect(response.status).toBe(400);
    });

    test('should not create a new connector with non unique name', async () => {
        const response = await request(app)
            .post(url)
            .send({
                name: 'C 1',
                priority: false,
                charging_station_id: chargingStation1Id
            });

        expect(response.status).toBe(400);
    });

    test('should not create a new connector when charging_station_id is invalid', async () => {
        const response = await request(app)
            .post(url)
            .send({
                name: 'Test Charging Station 1',
                priority: false,
                charging_station_id: 'chargingStation1Id'
            });

        expect(response.status).toBe(400);
    });

    test('should not create a new connector when charging_station_id is not exist', async () => {
        const response = await request(app)
            .post(url)
            .send({
                name: 'Test Charging Station 1',
                priority: false,
                charging_station_id: '1b29634d-a62a-4dac-8586-f0946c72e123'
            });

        expect(response.status).toBe(422);
    });

    test('should not create a new connector when priority is not boolean', async () => {
        const response = await request(app)
            .post(url)
            .send({
                name: 'Test Charging Station 1',
                priority: 'not boolean',
                charging_station_id: chargingStation1Id
            });

        expect(response.status).toBe(400);
    });

    test('should not create a new connector when there is already one priority connector on charging station', async () => {
        const response = await request(app)
            .post(url)
            .send({
                name: 'Test Charging Station 1',
                priority: true,
                charging_station_id: chargingStation1Id
            });

        expect(response.status).toBe(400);
    });

    test('should not create a new connector when there is already maximum amount of connectors on charging station', async () => {
        await Connector.create({ ...connector3, charging_station_id: chargingStation1Id });
        const response = await request(app)
            .post(url)
            .send({
                name: 'Test Charging Station 1',
                priority: false,
                charging_station_id: chargingStation1Id
            });

        expect(response.status).toBe(400);
    });
});

describe('Charging Station Router - GET', () => {
    test('should get all connectors', async () => {
        const response = await request(app)
            .get(url);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBe(2);
    });

    test('should get 1 connector with name is equal to \'C 1\'', async () => {
        const response = await request(app)
            .get(`${url}?name=C 1`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBe(1);
    });

    test('should get no connector with name is equal to \'C 4\'', async () => {
        const response = await request(app)
            .get(`${url}?name=C 4`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBe(0);
    });

    // those 2 test cases uses 1/0 instead of true/false, because of how sqlite is storing the boolean values
    // for the postgres DB it is working on true/false strings in query
    test('should get 1 connector with priority is true', async () => {
        const response = await request(app)
            .get(`${url}?priority=1`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBe(1);
    });

    test('should get 1 connector with priority is false', async () => {
        const response = await request(app)
            .get(`${url}?priority=0`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBe(1);
    });

    test('should get 2 connectors with charging_station_id is exist', async () => {
        const response = await request(app)
            .get(`${url}?charging_station_id=${chargingStation1Id}`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBe(2);
    });

    test('should get 0 connectors with charging_station_id is not exist', async () => {
        const response = await request(app)
            .get(`${url}?charging_station_id=d7a1bd10-dbdd-449e-b68d-72939ae3da06`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBe(0);
    });

    test('should get a specific connector by id', async () => {
        const response = await request(app)
            .get(`${url}/${connector1Id}`);
        expect(response.status).toBe(200);
        expect(response.body.id).toBe(connector1Id);
        expect(response.body.name).toBe(connector1.name);
        expect(response.body.priority).toBe(connector1.priority);
    });

    test('should not get a specific conector by id when not exists', async () => {
        const response = await request(app)
            .get(`${url}/1b29634d-a62a-4dac-8586-f0946c72e0aa`);
        expect(response.status).toBe(404);
    });

    test('should not get a specific connector by id when id format is wrong', async () => {
        const response = await request(app)
            .get(`${url}/cd5fddb1-5a40-4b83-929b`);
        expect(response.status).toBe(404);
    });
});

describe('Charging Station Router - GET', () => {
    test('should update a specific connector by id', async () => {
        const response = await request(app)
            .patch(`${url}/${connector1Id}`)
            .send({
                name: 'Updated Connector Test',
                priority: false,
                charging_station_id: chargingStation1Id
            });

        expect(response.status).toBe(200);
    });

    test('should not update a specific connector by id when provided name is not unique', async () => {
        const response = await request(app)
            .patch(`${url}/${connector1Id}`)
            .send({
                name: 'C 2'
            });

        expect(response.status).toBe(400);
    });

    test('should not update a specific connector by id when id is provided', async () => {
        const response = await request(app)
            .patch(`${url}/${connector1Id}`)
            .send({
                id: '1b29634d-a62a-4dac-8586-f0946c72e0aa'
            });

        expect(response.status).toBe(400);
    });

    test('should not update a specific connector by id when id is provided', async () => {
        const response = await request(app)
            .patch(`${url}/${connector1Id}`)
            .send({
                id: '1b29634d-a62a-4dac-8586-f0946c72e0aa'
            });

        expect(response.status).toBe(400);
    });

    test('should not update a specific connector by id when not exists', async () => {
        const response = await request(app)
            .patch(`${url}/1b29634d-a62a-4dac-8586-f0946c72e0aa`)
            .send({
                name: 'new name'
            });

        expect(response.status).toBe(404);
    });

    test('should not update a specific connector by id when priority is not boolean', async () => {
        const response = await request(app)
            .patch(`${url}/${connector1Id}`)
            .send({
                priority: 'test'
            });

        expect(response.status).toBe(400);
    });

    test('should not update a specific connector by id when there is connector with priority set to true in charging station', async () => {
        const response = await request(app)
            .patch(`${url}/${connector1Id}`)
            .send({
                priority: true
            });

        expect(response.status).toBe(400);
    });

    test('should not update a specific connector by id when charging_station_id is invalid', async () => {
        const response = await request(app)
            .patch(`${url}/${connector1Id}`)
            .send({
                charging_station_id: '1b29634d-a62a-4dac-8586'
            });

        expect(response.status).toBe(400);
    });

    test('should not update a specific connector by id when it exceed charging station connector limit', async () => {
        const cstype = await ChargingStationType.findOne({ where: { name: 'Type 2' } });
        const cs = await ChargingStation.create({ ...chargingStation2, charging_station_type_id: cstype?.id });
        await Connector.create({ ...connector3, charging_station_id: chargingStation1Id });
        const connector = await Connector.create({ ...connector4, charging_station_id: cs.id });
        const response = await request(app)
            .patch(`${url}/${connector.id}`)
            .send({
                charging_station_id: chargingStation1Id
            });

        expect(response.status).toBe(400);
    });

    test('should update a specific connector by id when charging_station_id is valid and there is still non exceeded limit on charging station', async () => {
        const cstype = await ChargingStationType.findOne({ where: { name: 'Type 2' } });
        const cs = await ChargingStation.create({ ...chargingStation2, charging_station_type_id: cstype?.id });
        const connector = await Connector.create({ ...connector3, charging_station_id: cs.id });
        const response = await request(app)
            .patch(`${url}/${connector.id}`)
            .send({
                charging_station_id: chargingStation1Id
            });

        expect(response.status).toBe(200);
    });
});