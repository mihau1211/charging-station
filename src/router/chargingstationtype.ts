import express, { Request, Response } from 'express';
import { auth } from '../middleware/auth';
import { ChargingStationType } from '../models/chargingStationType.model';
import { Op } from 'sequelize';
import logger from '../utils/logger';
import validator from 'validator';

const router = express.Router();
const chargingStationTypeName = ChargingStationType.name;

/**
 * @openapi
 * /api/v1/cstype:
 *   post:
 *     tags:
 *       - Charging Station Types
 *     summary: Create a new Charging Station Types
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Type A"
 *             plug_count: 4
 *             efficiency: 0.88
 *             current_type: "AC"
 *     responses:
 *       201:
 *         description: Charging Station Type created successfully.
 *       400:
 *         description: Bad Request. Invalid input values.
 */
// POST /cstype
router.post('/cstype', auth, async (req: Request, res: Response) => {
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
		res.status(400).send({ error: error.message });
	}
});

/**
 * @openapi
 * /api/v1/cstype:
 *   get:
 *     tags:
 *       - Charging Station Types
 *     summary: Retrieve a list of Charging Station Types
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Limit the number of returned Charging Station Types.
 *         required: false
 *         schema:
 *           type: integer
 *           example: 5
 *       - name: offset
 *         in: query
 *         description: Offset for the list of returned Charging Station Types.
 *         required: false
 *         schema:
 *           type: integer
 *           example: 0
 *       - name: name
 *         in: query
 *         description: Filter by name of the Charging Station Type.
 *         required: false
 *         schema:
 *           type: string
 *           example: "Station A"
 *       - name: plug_count
 *         in: query
 *         description: Filter by plug count of the Charging Station Type, it should be int.
 *         required: false
 *         schema:
 *           type: int
 *           example: 4
 *       - name: efficiency
 *         in: query
 *         description: Filter by efficiency of the Charging Station Type.
 *         required: false
 *         schema:
 *           type: float
 *           example: 0.88
 *       - name: minEfficiency
 *         in: query
 *         description: Filter by minEfficiency of the Charging Station Type.
 *         required: false
 *         schema:
 *           type: float
 *           example: 0.58
 *       - name: maxEfficiency
 *         in: query
 *         description: Filter by maxEfficiency of the Charging Station Type.
 *         required: false
 *         schema:
 *           type: float
 *           example: 0.9
 *     responses:
 *       200:
 *         description: Successfully retrieved list of Charging Station Types.
 *         content:
 *           application/json:
 *             example: 
 *               - id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "Type A"
 *                 plug_count: 2
 *                 efficiency: 0.9
 *                 current_type: "DC"
 *       400:
 *         description: Bad Request. Error related to provided query parameters.
 */
// GET /cstype
router.get('/cstype', auth, async (req: Request, res: Response) => {
	try {
		logger.beginLogger('GET', '/cstype');
		const limit = parseInt(req.query.limit as string) || undefined;
		const offset = parseInt(req.query.offset as string) || undefined;

		const where: any = {};

		if (req.query.name) where.name = req.query.name;
		if (req.query.plug_count) where.plug_count = req.query.plug_count;
		if (req.query.efficiency) where.efficiency = req.query.efficiency;
		if (req.query.current_type) where.current_type = req.query.current_type;

		if (req.query.minEfficiency && req.query.maxEfficiency) {
			where.efficiency = {
				[Op.between]: [req.query.minEfficiency, req.query.maxEfficiency],
			};
		}

		const chargingStationTypes = await ChargingStationType.findAll({
			where,
			limit,
			offset,
		});
		logger.getSuccessLogger(chargingStationTypeName + 's', where, limit, offset);
		res.json(chargingStationTypes);
	} catch (error: any) {
		logger.getErrorLogger(chargingStationTypeName + 's', error.message);
		res.status(400).send({ error: error.message });
	}
});

/**
 * @openapi
 * /api/v1/cstype/{id}:
 *   get:
 *     tags:
 *       - Charging Station Types
 *     summary: Retrieve a Charging Station Type by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: A Charging Station Type object.
 *         content:
 *           application/json:
 *             example: 
 *               id: "123e4567-e89b-12d3-a456-426614174000"
 *               name: "Type A"
 *               plug_count: 2
 *               efficiency: 0.9
 *               current_type: "DC"
 *       404:
 *         description: Not Found. The specified Charging Station Type could not be found.
 *       400:
 *         description: Bad Request. The request could not be understood or was missing required parameters.
 */
// GET /cstype/:id
router.get('/cstype/:id', auth, async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		logger.beginLogger('GET', `/cstype/${id}`);

		const chargingStationType = await ChargingStationType.findByPk(id);

		if (!chargingStationType) {
			logger.idNotFoundLogger(chargingStationTypeName, id);
			return res.status(404).send();
		}

		logger.getByIdSuccessLogger(chargingStationTypeName, id);
		res.json(chargingStationType);
	} catch (error: any) {
		logger.getErrorLogger(chargingStationTypeName, error.message);
		res.status(400).send({ error: error.message });
	}
});

/**
 * @openapi
 * /api/v1/cstype/{id}:
 *   patch:
 *     tags:
 *       - Charging Station Types
 *     summary: Update an existing Charging Station Type by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Type A"
 *             plug_count: 2
 *             efficiency: 0.9
 *             current_type: "DC"
 *     responses:
 *       200:
 *         description: Charging Station Type updated successfully.
 *       400:
 *         description: Bad Request. Invalid input values.
 *       404:
 *         description: Not Found. The specified Charging Station Type could not be found.
 *       500:
 *         description: Internal Server Error. There was a problem updating the Charging Station Type.
 */
// PATCH /cstype/:id
router.patch('/cstype/:id', auth, async (req: Request, res: Response) => {
	const { id } = req.params;
	const allowedFields = ['plug_count', 'efficiency', 'current_type'];
	const updateFields = Object.keys(req.body);

	logger.beginLogger('PATCH', `/cstype/${id}`, req.body);

	const isInvalidField = updateFields.some((field) => !allowedFields.includes(field));

	if (isInvalidField) {
		logger.invalidFieldsErrorLogger(`/cstype/${id}`);
		return res.status(400).send({ error: 'Given fields are invalid' });
	}

	try {
		const updated = await ChargingStationType.update(req.body, {
			where: { id },
		});

		if (!updated[0]) {
			logger.idNotFoundLogger(chargingStationTypeName, id);
			return res.status(404).send();
		}

		logger.patchSuccessLogger(chargingStationTypeName, id);
		res.send();
	} catch (error: any) {
		if (error.name === 'SequelizeValidationError') {
			logger.error(error.message, 'API');
			return res.status(400).send({ error: error.message });
		}

		logger.patchInternalErrorLogger(chargingStationTypeName, id, error.message);
		res.status(500).send({ error: 'Internal Server Error' });
	}
});

export default router;
