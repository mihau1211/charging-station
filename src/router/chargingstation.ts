import express, { Request, Response } from 'express';
import { ChargingStation } from '../models/chargingStation.model';
import logger from '../utils/logger';
import { ChargingStationType } from '../models/chargingStationType.model';
import validator from 'validator';

const router = express.Router();
const chargingStationName = ChargingStation.name;

// POST /cs
router.post('/cs', async (req: Request, res: Response) => {
    try {
        logger.beginLogger('POST', '/cs', req.body);

        if (!validator.isIP(req.body.ip_address)) {
            logger.invalidFieldsErrorLogger(`/cs`);
            return res.status(400).send({ error: 'Given ip_address is invalid' })
        }

        const csTypeId = req.body.charging_station_type_id;
        const csType = await ChargingStationType.findByPk(csTypeId);

        if (!csType) {
            logger.invalidFieldsErrorLogger(`/cs`);
            return res.status(422).send({ error: 'Given UUID is not exist' })
        }

        await ChargingStation.create(req.body);

        logger.postSuccessLogger(chargingStationName);
        res.status(201).send();
    } catch (error: any) {
        logger.postErrorLogger(chargingStationName, error.message);
        res.status(400).send({ error: error.message })
    }
})

// GET /cs
router.get('/cs', async (req: Request, res: Response) => {
    try {
        logger.beginLogger('GET', '/cs');
        const limit = parseInt(req.query.limit as string) || undefined;
        const offset = parseInt(req.query.offset as string) || undefined;

        const where: any = {};

        if (req.query.name) where.name = req.query.name;
        if (req.query.device_id) where.device_id = req.query.device_id;
        if (req.query.ip_address) where.ip_address = req.query.ip_address;
        if (req.query.firmware_version) where.firmware_version = req.query.firmware_version;
        if (req.query.charging_station_type_id) where.charging_station_type_id = req.query.charging_station_type_id;

        const chargingStations = await ChargingStation.findAll({ where, limit, offset, include: 'charging_station_type' });

        if (chargingStations) {
            const response = chargingStations.map((station: any) => {
                const stationObj = station.toJSON();
                delete stationObj.charging_station_type_id;
                return stationObj;
            })
            logger.getSuccessLogger(chargingStationName + 's', where, limit, offset)
            res.json(response);
        }
    } catch (error: any) {
        logger.getErrorLogger(chargingStationName + 's', error.message);
        res.status(400).send({ error: error.message });
    }
})

// GET /cs/:id
router.get('/cs/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        logger.beginLogger('GET', `/cs/${id}`);

        const chargingStation = await ChargingStation.findByPk(id, {include: 'charging_station_type'});

        if (!chargingStation) {
            logger.idNotFoundLogger(chargingStationName, id);
            return res.status(404).send()
        }

        let response = chargingStation.toJSON();
        delete response.charging_station_type_id;

        logger.getByIdSuccessLogger(chargingStationName, id);
        res.json(response);
    } catch (error: any) {
        logger.getErrorLogger(chargingStationName, error.message);
        res.status(400).send({ error: error.message });
    }
});

// PATCH /cs/:id
router.patch('/cs/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const allowedFields = ['name', 'device_id', 'ip_address', 'firmware_version', 'charging_station_type_id'];
    const updateFields = Object.keys(req.body);

    logger.beginLogger('PATCH', `/cs/${id}`, req.body);

    if (updateFields.includes('ip_address') && !validator.isIP(req.body.ip_address)) {
        logger.invalidFieldsErrorLogger(`/cs`);
        return res.status(400).send({ error: 'Given ip_address is invalid' })
    }

    const isInvalidField = updateFields.some(field => !allowedFields.includes(field));

    if (isInvalidField) {
        logger.invalidFieldsErrorLogger(`/cs/${id}`);
        return res.status(400).send({ error: 'Given fields are invalid' })
    }

    try {
        const updated = await ChargingStation.update(req.body, { where: { id } })

        if (!updated[0]) {
            logger.idNotFoundLogger(chargingStationName, id)
            return res.status(404).send();
        }

        logger.patchSuccessLogger(chargingStationName, id);
        res.send();
    } catch (error: any) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            logger.constraintViolationErrorLogger(chargingStationName, id, error.message);
            return res.status(400).send({ error: 'Unique constraint violation.' })
        }
        
        if (error.name === 'SequelizeValidationError') {
            logger.error(error.message, 'API');
            return res.status(400).send({ error: error.message })
        }

        logger.patchInternalErrorLogger(chargingStationName, id, error.message);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

export default router;