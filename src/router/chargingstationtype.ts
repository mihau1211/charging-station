import express, { Request, Response} from 'express';
import { ChargingStationType } from '../models/chargingStationType.model';
import { Op } from 'sequelize';
import logger from '../utils/logger';

const router = express.Router()

// POST /cstype
router.post('/cstype', async (req: Request, res: Response) => {
    try {
        logger.info(`POST request received at /cstype with body: ${JSON.stringify(req.body)}`);

        await ChargingStationType.create(req.body);

        logger.info(`ChargingStationType successfully created.`);
        res.status(201).send();        
    } catch (error: any) {
        logger.error(`Error occurred while creating ChargingStationType: ${error.message}`);
        res.status(400).send({error: error.message})
    }
})

// GET /cstype
router.get('/cstype', async (req: Request, res: Response) => {
    try {
        logger.info(`GET request received at /cstype`);
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = parseInt(req.query.offset as string) || 0;

        const where: any = {};
        
        if (req.query.name) where.name = req.query.name;
        if (req.query.plug_count) where.plug_count = req.query.plug_count;
        if (req.query.efficiency) where.efficiency = req.query.efficiency;
        if (req.query.current_type) where.current_type = req.query.current_type;

        if (req.query.minEfficiency && req.query.maxEfficiency) {
            where.efficiency = { [Op.between]: [req.query.minEfficiency, req.query.maxEfficiency] };
        }

        logger.info(`Fetching ChargingStationTypes with conditions: ${JSON.stringify(where)}, limit: ${limit}, offset: ${offset}`);
        const csTypes = await ChargingStationType.findAll({ where, limit, offset });
        res.json(csTypes);
    } catch (error: any) {
        logger.error(`Error occurred while fetching ChargingStationTypes: ${error.message}`);
        res.status(400).send({ error: error.message });
    }
})

// GET /cstype/:id
router.get('/cstype/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        logger.info(`GET request received at /cstype/${id}`);

        const csType = await ChargingStationType.findByPk(id);
        if (!csType) {
            logger.warn(`ChargingStationType not found for ID: ${id}`);
            return res.status(404).send()
        }
        res.json(csType);
    } catch (error: any) {
        logger.error(`Error occurred while fetching : ${error.message}`);
        res.status(400).send({ error: error.message });
    }
});

// PATCH /cstype/:id
router.patch('/cstype/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const allowedFields = ['name', 'plug_count', 'efficiency', 'current_type'];
    const updateFields = Object.keys(req.body);

    logger.info(`PATCH request received at /cstype/${id} with body: ${JSON.stringify(req.body)}`);

    const isInvalidField = updateFields.some(field => !allowedFields.includes(field));
    if (isInvalidField) {
        logger.error(`Invalid fields in request to /cstype/${id}`);
        return res.status(400).send({ error: 'Given fields are invalid' })
    }
    try {
        const updated = await ChargingStationType.update(req.body, { where: { id } })
        if (!updated[0]) {
            logger.error(`ChargingStationType not found for id: ${id}`);
            res.status(404).send();
        }
        logger.info(`ChargingStationType with id: ${id} successfully updated`);
        res.send();
    } catch (error: any) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            logger.error(`Unique constraint violation updating ChargingStationType with id: ${id} - ${error.message}`);
            res.status(400).send({ error: 'Unique constraint violation.' })
        }
        logger.error(`Internal Server Error updating ChargingStationType with id: ${id} - ${error.message}`);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});



export default router;