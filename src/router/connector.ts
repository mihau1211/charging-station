import express, { Request, Response } from 'express';
import { auth } from '../middleware/auth';
import { Connector } from '../models/connector.model';
import logger from '../utils/logger';
import { ChargingStation } from '../models/chargingStation.model';
import validator from 'validator';

const router = express.Router();
const connectorName = Connector.name;
const chargingStationName = ChargingStation.name;

const priorityValidation = async (priority: boolean, chargingStationId: string) => {
	if (priority) {
		const priorityConnectors = await Connector.findAll({
			where: { priority: true, charging_station_id: chargingStationId },
		});
		if (priorityConnectors.length > 0) {
			throw new Error(`Only 1 priority connector can be assigned to ${chargingStationName} with id: ${chargingStationId}.`);
		}
	}
};

const plugCountValidation = async (chargingStation: ChargingStation, chargingStationId: string, chargingStationName: string) => {
	const availableConnectorsCount = chargingStation?.charging_station_type.plug_count;
	const connectorsCount = (
		await Connector.findAndCountAll({
			where: { charging_station_id: chargingStationId },
		})
	).count;

	if (connectorsCount >= availableConnectorsCount) {
		throw new Error(`Unable to add more connectors to ${chargingStationName} with id: ${chargingStationId}`);
	}
};

/**
 * @openapi
 * /api/v1/connector:
 *   post:
 *     tags:
 *       - Connectors
 *     summary: Create a new Connector
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Connector A"
 *             priority: false
 *             charging_station_id: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       201:
 *         description: Connector created successfully
 *       400:
 *         description: Bad Request. Invalid input values.
 *       422:
 *         description: Unprocessable Entity. UUID does not exist or charging_station_id is missing.
 */
// POST /connector
router.post('/connector', auth, async (req: Request, res: Response) => {
	try {
		logger.beginLogger('POST', '/connector', req.body);

		if (req.body.id && !validator.isUUID(req.body.id)) {
			throw new Error('Provided id is not a valid UUID v4');
		}

		if (!validator.isUUID(req.body.charging_station_id)) {
			throw new Error('Given UUID is invalid');
		}

		const chargingStationId = req.body.charging_station_id;
		const chargingStation = await ChargingStation.findByPk(chargingStationId, { include: 'charging_station_type' });

		if (!chargingStation) {
			logger.invalidFieldsErrorLogger(`/connector`);
			return res.status(422).send({
				error: 'Given UUID does not exist or charging_station_type is missing',
			});
		}

		await priorityValidation(req.body.priority, chargingStationId);

		await plugCountValidation(chargingStation, chargingStationId, chargingStationName);

		await Connector.create(req.body);

		logger.postSuccessLogger(connectorName);
		res.status(201).send();
	} catch (error: any) {
		logger.postErrorLogger(connectorName, error.message);
		res.status(400).send({ error: error.message });
	}
});

/**
 * @openapi
 * /api/v1/connector:
 *   get:
 *     tags:
 *       - Connectors
 *     summary: Retrieve a list of Connectors
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Limit the number of returned Connectors.
 *         required: false
 *         schema:
 *           type: integer
 *           example: 5
 *       - name: offset
 *         in: query
 *         description: Offset for the list of returned Connectors.
 *         required: false
 *         schema:
 *           type: integer
 *           example: 0
 *       - name: name
 *         in: query
 *         description: Filter by name of the Connector.
 *         required: false
 *         schema:
 *           type: string
 *           example: "Connector A"
 *       - name: priority
 *         in: query
 *         description: Filter by priority of the Connector.
 *         required: false
 *         schema:
 *           type: string
 *           example: "192.168.1.1"
 *       - name: charging_station_id
 *         in: query
 *         description: Filter by Charging Station ID, it should be in UUID v4 format.
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: A JSON array of connectors
 *         content:
 *           application/json:
 *             example:
 *               - id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "Connector1"
 *                 priority: true
 *                 charging_station:
 *                   id: "123e4567-e89b-12d3-a456-426614174000"
 *                   name: "ChargingStation1"
 *                   device_id: "123e4567-e89b-12d3-a456-426614174001"
 *                   ip_address: "192.168.1.1"
 *                   firmware_version: "1.0.0"
 *                   charging_station_type_id: "123e4567-e89b-12d3-a456-426614174001"
 *       400:
 *         description: Bad Request. Error related to provided query parameters.
 */
// GET /connector
router.get('/connector', auth, async (req: Request, res: Response) => {
	try {
		logger.beginLogger('GET', '/connector');
		const limit = parseInt(req.query.limit as string) || undefined;
		const offset = parseInt(req.query.offset as string) || undefined;

		const where: any = {};

		if (req.query.name) where.name = req.query.name;
		if (req.query.priority) where.priority = req.query.priority;
		if (req.query.charging_station_id) where.charging_station_id = req.query.charging_station_id;

		const connectors = await Connector.findAll({
			where,
			limit,
			offset,
			include: 'charging_station',
		});

		if (connectors) {
			const response = connectors.map((connector: any) => {
				const connectorObj = connector.toJSON();
				delete connectorObj.charging_station_id;
				return connectorObj;
			});
			logger.getSuccessLogger(connectorName + 's', where, limit, offset);
			res.json(response);
		}
	} catch (error: any) {
		logger.getErrorLogger(connectorName + 's', error.message);
		res.status(400).send({ error: error.message });
	}
});

/**
 * @openapi
 * /api/v1/connector/{id}:
 *   get:
 *     tags:
 *       - Connectors
 *     summary: Get a Connector by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: A Connector object.
 *         content:
 *           application/json:
 *             example:
 *               id: "123e4567-e89b-12d3-a456-426614174000"
 *               name: "Connector A"
 *               priority: false
 *               charging_station:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "ChargingStation1"
 *                 device_id: "123e4567-e89b-12d3-a456-426614174001"
 *                 ip_address: "192.168.1.1"
 *                 firmware_version: "1.0.0"
 *                 charging_station_type_id: "123e4567-e89b-12d3-a456-426614174001"
 *       404:
 *         description: Not Found. The specified Connector could not be found.
 *       400:
 *         description: Bad Request. The request could not be understood or was missing required parameters.
 */
// GET /connector/:id
router.get('/connector/:id', auth, async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		logger.beginLogger('GET', `/connector/${id}`);

		const connector = await Connector.findByPk(id, {
			include: 'charging_station',
		});

		if (!connector) {
			logger.idNotFoundLogger(connectorName, id);
			return res.status(404).send();
		}

		let response = connector.toJSON();
		delete response.charging_station_id;

		logger.getByIdSuccessLogger(connectorName, id);
		res.json(response);
	} catch (error: any) {
		logger.getErrorLogger(connectorName, error.message);
		res.status(400).send({ error: error.message });
	}
});

/**
 * @openapi
 * /api/v1/connector/{id}:
 *   patch:
 *     tags:
 *       - Connectors
 *     summary: Update a Connector by ID
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
 *             priority: false
 *             charging_station_id: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Connector updated successfully.
 *       400:
 *         description: Bad Request. Invalid input values.
 *       404:
 *         description: Not Found. The specified Connector could not be found.
 *       500:
 *         description: Internal Server Error. There was a problem updating the Connector.
 */
// PATCH /connector/:id
router.patch('/connector/:id', auth, async (req: Request, res: Response) => {
	const { id } = req.params;
	const allowedFields = ['priority', 'charging_station_id'];
	const updateFields = Object.keys(req.body);
	const isUpdateChargingStation = updateFields.includes('charging_station_id');
	const isUpdatePriority = updateFields.includes('priority');

	logger.beginLogger('PATCH', `/connector/${id}`, req.body);

	const isInvalidField = updateFields.some((field) => !allowedFields.includes(field));

	if (isInvalidField) {
		logger.invalidFieldsErrorLogger(`/connector/${id}`);
		return res.status(400).send({ error: 'Given fields are invalid' });
	}

	if (updateFields.includes('charging_station_id') && !validator.isUUID(req.body.charging_station_id)) {
		logger.invalidFieldsErrorLogger(`/cconnector`);
		return res.status(400).send({ error: 'Given UUID is invalid' });
	}

	try {
		if (isUpdateChargingStation || isUpdatePriority) {
			let chargingStationId;
			if (!req.body.charging_station_id) {
				const updatedConnector = await Connector.findByPk(id, {
					include: 'charging_station',
				});
				chargingStationId = updatedConnector?.charging_station.id;
			} else {
				chargingStationId = req.body.charging_station_id;
			}

			await priorityValidation(req.body.priority, chargingStationId);

			if (isUpdateChargingStation) {
				const chargingStation = await ChargingStation.findByPk(chargingStationId, {
					include: 'charging_station_type',
				});

				if (chargingStation) {
					await plugCountValidation(chargingStation, chargingStationId, chargingStationName);
				}
			}
		}

		const updated = await Connector.update(req.body, { where: { id } });

		if (!updated[0]) {
			logger.idNotFoundLogger(connectorName, id);
			return res.status(404).send();
		}

		logger.patchSuccessLogger(connectorName, id);
		res.send();
	} catch (error: any) {
		if (error.name === 'SequelizeValidationError' || error.name === 'Error') {
			logger.error(error.message, 'API');
			return res.status(400).send({ error: error.message });
		}

		logger.patchInternalErrorLogger(connectorName, id, error.message);
		res.status(500).send({ error: 'Internal Server Error' });
	}
});

export default router;
