import express, { Request, Response } from 'express';
import { auth } from '../middleware/auth';
import { ChargingStation } from '../models/chargingStation.model';
import logger from '../utils/logger';
import { ChargingStationType } from '../models/chargingStationType.model';
import validator from 'validator';

const router = express.Router();
const chargingStationName = ChargingStation.name;

/**
 * @openapi
 * /cs:
 *   post:
 *     tags:
 *       - Charging Stations
 *     summary: Create a new Charging Station
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Station A"
 *             device_id: "123e4567-e89b-12d3-a456-426614174000"
 *             ip_address: "192.168.1.1"
 *             firmware_version: "1.0.0"
 *             charging_station_type_id: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       201:
 *         description: Charging Station created successfully.
 *       400:
 *         description: Bad Request. Invalid input values.
 *       422:
 *         description: Unprocessable Entity. Given UUID for charging_station_type_id does not exist.
 */
// POST /cs
router.post('/cs', auth, async (req: Request, res: Response) => {
	try {
		logger.beginLogger('POST', '/cs', req.body);

		if (req.body.id && !validator.isUUID(req.body.id)) {
			throw new Error('Provided id is not a valid UUID v4');
		}

		if (!validator.isIP(req.body.ip_address)) {
			throw new Error('Given ip_address is invalid');
		}

		if (!validator.isUUID(req.body.device_id) || !validator.isUUID(req.body.charging_station_type_id)) {
			throw new Error('Given UUID is invalid');
		}

		const csTypeId = req.body.charging_station_type_id;
		const csType = await ChargingStationType.findByPk(csTypeId);

		if (!csType) {
			logger.invalidFieldsErrorLogger(`/cs`);
			return res.status(422).send({ error: 'Given UUID is not exist' });
		}

		await ChargingStation.create(req.body);

		logger.postSuccessLogger(chargingStationName);
		res.status(201).send();
	} catch (error: any) {
		logger.postErrorLogger(chargingStationName, error.message);
		res.status(400).send({ error: error.message });
	}
});

/**
 * @openapi
 * /cs:
 *   get:
 *     tags:
 *       - Charging Stations
 *     summary: Retrieve a list of Charging Stations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Limit the number of returned Charging Stations.
 *         required: false
 *         schema:
 *           type: integer
 *           example: 5
 *       - name: offset
 *         in: query
 *         description: Offset for the list of returned Charging Stations.
 *         required: false
 *         schema:
 *           type: integer
 *           example: 0
 *       - name: name
 *         in: query
 *         description: Filter by name of the Charging Station.
 *         required: false
 *         schema:
 *           type: string
 *           example: "Station A"
 *       - name: device_id
 *         in: query
 *         description: Filter by device ID of the Charging Station, it should be in UUID v4 format.
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *       - name: ip_address
 *         in: query
 *         description: Filter by IP address of the Charging Station.
 *         required: false
 *         schema:
 *           type: string
 *           example: "192.168.1.1"
 *       - name: firmware_version
 *         in: query
 *         description: Filter by firmware version of the Charging Station.
 *         required: false
 *         schema:
 *           type: string
 *           example: "1.0.0"
 *       - name: charging_station_type_id
 *         in: query
 *         description: Filter by Charging Station Type ID, it should be in UUID v4 format.
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: Successfully retrieved list of Charging Stations.
 *         content:
 *           application/json:
 *             example: 
 *               - id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "ChargingStation1"
 *                 device_id: "123e4567-e89b-12d3-a456-426614174001"
 *                 ip_address: "192.168.1.1"
 *                 firmware_version: "1.0.0"
 *                 charging_station_type: 
 *                   id: "123e4567-e89b-12d3-a456-426614174000"
 *                   name: "Type A"
 *                   plug_count: 2
 *                   efficiency: 0.9
 *                   current_type: "DC"
 *       400:
 *         description: Bad Request. Error related to provided query parameters.
 */
// GET /cs
router.get('/cs', auth, async (req: Request, res: Response) => {
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

		const chargingStations = await ChargingStation.findAll({
			where,
			limit,
			offset,
			include: 'charging_station_type',
		});

		if (chargingStations) {
			const response = chargingStations.map((station: any) => {
				const stationObj = station.toJSON();
				delete stationObj.charging_station_type_id;
				return stationObj;
			});
			logger.getSuccessLogger(chargingStationName + 's', where, limit, offset);
			res.json(response);
		}
	} catch (error: any) {
		logger.getErrorLogger(chargingStationName + 's', error.message);
		res.status(400).send({ error: error.message });
	}
});

/**
 * @openapi
 * /cs/{id}:
 *   get:
 *     tags:
 *       - Charging Stations
 *     summary: Retrieve a Charging Station by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: A Charging Station object.
 *         content:
 *           application/json:
 *             example: 
 *               id: "123e4567-e89b-12d3-a456-426614174000"
 *               name: "Station A"
 *               device_id: "123e4567-e89b-12d3-a456-426614174000"
 *               ip_address: "192.168.1.1"
 *               firmware_version: "1.0.0"
 *               charging_station_type: 
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "Type A"
 *                 plug_count: 2
 *                 efficiency: 0.9
 *                 current_type: "DC"
 *       404:
 *         description: Not Found. The specified Charging Station could not be found.
 *       400:
 *         description: Bad Request. The request could not be understood or was missing required parameters.
 */
// GET /cs/:id
router.get('/cs/:id', auth, async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		logger.beginLogger('GET', `/cs/${id}`);

		const chargingStation = await ChargingStation.findByPk(id, {
			include: 'charging_station_type',
		});

		if (!chargingStation) {
			logger.idNotFoundLogger(chargingStationName, id);
			return res.status(404).send();
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

/**
 * @openapi
 * /cs/{id}:
 *   patch:
 *     tags:
 *       - Charging Stations
 *     summary: Update an existing Charging Station by ID
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
 *             device_id: "123e4567-e89b-12d3-a456-426614174000"
 *             ip_address: "192.168.1.1"
 *             firmware_version: "1.0.0"
 *             charging_station_type_id: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Charging Station updated successfully.
 *       400:
 *         description: Bad Request. Invalid input values.
 *       404:
 *         description: Not Found. The specified Charging Station could not be found.
 *       500:
 *         description: Internal Server Error. There was a problem updating the Charging Station.
 */
// PATCH /cs/:id
router.patch('/cs/:id', auth, async (req: Request, res: Response) => {
	const { id } = req.params;
	const allowedFields = ['device_id', 'ip_address', 'firmware_version', 'charging_station_type_id'];
	const updateFields = Object.keys(req.body);

	logger.beginLogger('PATCH', `/cs/${id}`, req.body);

	if (updateFields.includes('ip_address') && (typeof req.body.ip_address !== 'string' || !validator.isIP(req.body.ip_address))) {
		logger.invalidFieldsErrorLogger(`/cs`);
		return res.status(400).send({ error: 'Given ip_address is invalid' });
	}

	if (
		(updateFields.includes('device_id') && !validator.isUUID(req.body.device_id)) ||
		(updateFields.includes('charging_station_type_id') && !validator.isUUID(req.body.charging_station_type_id))
	) {
		logger.invalidFieldsErrorLogger(`/cs`);
		return res.status(400).send({ error: 'Given UUID is invalid' });
	}

	const isInvalidField = updateFields.some((field) => !allowedFields.includes(field));

	if (isInvalidField) {
		logger.invalidFieldsErrorLogger(`/cs/${id}`);
		return res.status(400).send({ error: 'Given fields are invalid' });
	}

	try {
		const updated = await ChargingStation.update(req.body, {
			where: { id },
		});

		if (!updated[0]) {
			logger.idNotFoundLogger(chargingStationName, id);
			return res.status(404).send();
		}

		logger.patchSuccessLogger(chargingStationName, id);
		res.send();
	} catch (error: any) {
		if (error.name === 'SequelizeValidationError') {
			logger.error(error.message, 'API');
			return res.status(400).send({ error: error.message });
		}

		logger.patchInternalErrorLogger(chargingStationName, id, error.message);
		res.status(500).send({ error: 'Internal Server Error' });
	}
});

export default router;
