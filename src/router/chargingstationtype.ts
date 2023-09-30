import express, { Request, Response } from 'express';
import { ChargingStationType } from '../models/chargingStationType.model';
import { Op } from 'sequelize';
import logger from '../utils/logger';
import validator from 'validator';

const router = express.Router();
const chargingStationTypeName = ChargingStationType.name;

// POST /cstype
router.post('/cstype', async (req: Request, res: Response) => {
    try {
        logger.beginLogger('POST', '/cstype', req.body);
        if (req.body.id && !validator.isUUID(req.body.id)) {
            throw new Error('Provided id is not a valid UUID v4');
        }
        await ChargingStationType.create(req.body);

        logger.postSuccessLogger(chargingStationTypeName);
        res.status(201).send();
    } catch (error: any) {
        logger.postErrorLogger(chargingStationTypeName, error.message);
        res.status(400).send({ error: error.message })
    }
})

// GET /cstype
router.get('/cstype', async (req: Request, res: Response) => {
    try {
        logger.beginLogger('GET', '/cstype')
        const limit = parseInt(req.query.limit as string) || undefined;
        const offset = parseInt(req.query.offset as string) || undefined;

        const where: any = {};

        if (req.query.name) where.name = req.query.name;
        if (req.query.plug_count) where.plug_count = req.query.plug_count;
        if (req.query.efficiency) where.efficiency = req.query.efficiency;
        if (req.query.current_type) where.current_type = req.query.current_type;

        if (req.query.minEfficiency && req.query.maxEfficiency) {
            where.efficiency = { [Op.between]: [req.query.minEfficiency, req.query.maxEfficiency] };
        }

        const chargingStationTypes = await ChargingStationType.findAll({ where, limit, offset });
        logger.getSuccessLogger(chargingStationTypeName + 's', where, limit, offset)
        res.json(chargingStationTypes);
    } catch (error: any) {
        logger.getErrorLogger(chargingStationTypeName + 's', error.message);
        res.status(400).send({ error: error.message });
    }
})

// GET /cstype/:id
router.get('/cstype/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        logger.beginLogger('GET', `/cstype/${id}`);

        const chargingStationType = await ChargingStationType.findByPk(id);

        if (!chargingStationType) {
            logger.idNotFoundLogger(chargingStationTypeName, id);
            return res.status(404).send()
        }

        logger.getByIdSuccessLogger(chargingStationTypeName, id);
        res.json(chargingStationType);
    } catch (error: any) {
        logger.getErrorLogger(chargingStationTypeName, error.message);
        res.status(400).send({ error: error.message });
    }
});

// PATCH /cstype/:id
router.patch('/cstype/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const allowedFields = ['name', 'plug_count', 'efficiency', 'current_type'];
    const updateFields = Object.keys(req.body);

    logger.beginLogger('PATCH', `/cstype/${id}`, req.body);

    const isInvalidField = updateFields.some(field => !allowedFields.includes(field));

    if (isInvalidField) {
        logger.invalidFieldsErrorLogger(`/cstype/${id}`);
        return res.status(400).send({ error: 'Given fields are invalid' })
    }

    try {
        const updated = await ChargingStationType.update(req.body, { where: { id } })

        if (!updated[0]) {
            logger.idNotFoundLogger(chargingStationTypeName, id)
            return res.status(404).send();
        }

        logger.patchSuccessLogger(chargingStationTypeName, id);
        res.send();
    } catch (error: any) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            logger.constraintViolationErrorLogger(chargingStationTypeName, id, error.message);
            return res.status(400).send({ error: 'Unique constraint violation.' })
        }
        
        if (error.name === 'SequelizeValidationError') {
            logger.error(error.message, 'API');
            return res.status(400).send({ error: error.message })
        }

        logger.patchInternalErrorLogger(chargingStationTypeName, id, error.message);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

export default router;