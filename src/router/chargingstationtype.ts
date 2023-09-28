import express, { Request, Response} from 'express';
import { ChargingStationType } from '../models/chargingStationType.model';
import { Op } from 'sequelize';
import logger from '../utils/logger';

const router = express.Router();
const modelName = 'ChargingStationType';

// POST /cstype
router.post('/cstype', async (req: Request, res: Response) => {
    try {
        logger.beginLogger('POST', '/cstype', req.body);
        await ChargingStationType.create(req.body);

        logger.postSuccessLogger(modelName);
        res.status(201).send();        
    } catch (error: any) {
        logger.postErrorLogger(modelName, error.message);
        res.status(400).send({error: error.message})
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

        logger.getSuccessLogger(modelName + 's', where, limit, offset)
        const csTypes = await ChargingStationType.findAll({ where, limit, offset });
        res.json(csTypes);
    } catch (error: any) {
        logger.getErrorLogger(modelName + 's', error.message);
        res.status(400).send({ error: error.message });
    }
})

// GET /cstype/:id
router.get('/cstype/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        logger.beginLogger('GET', `/cstype/${id}`);

        const csType = await ChargingStationType.findByPk(id);
        if (!csType) {
            logger.idNotFoundLogger(modelName, id);
            return res.status(404).send()
        }
        res.json(csType);
    } catch (error: any) {
        logger.getErrorLogger(modelName, error.message);
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
            logger.idNotFoundLogger(modelName, id)
            return res.status(404).send();
        }
        logger.patchSuccessLogger(modelName, id);
        res.send();
    } catch (error: any) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            logger.constraintViolationErrorLogger(modelName, id, error.message);
            return res.status(400).send({ error: 'Unique constraint violation.' })
        }
        logger.patchInternalErrorLogger(modelName, id, error.message);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});



export default router;