import express, { Request, Response } from 'express';
import { auth } from '../middleware/auth';
import { Connector } from '../models/connector.model';
import logger from '../utils/logger';
import { ChargingStation } from '../models/chargingStation.model';
import validator from 'validator';

const router = express.Router();
const connectorName = Connector.name;
const chargingStationName = ChargingStation.name;

const priorityValidation = async (
	priority: boolean,
	chargingStationId: string,
) => {
	if (priority) {
		const priorityConnectors = await Connector.findAll({
			where: { priority: true, charging_station_id: chargingStationId },
		});
		if (priorityConnectors.length > 0) {
			throw new Error(
				`Only 1 priority connector can be assigned to ${chargingStationName} with id: ${chargingStationId}.`,
			);
		}
	}
};

const plugCountValidation = async (
	chargingStation: ChargingStation,
	chargingStationId: string,
	chargingStationName: string,
) => {
	const availableConnectorsCount =
		chargingStation?.charging_station_type.plug_count;
	const connectorsCount = (
		await Connector.findAndCountAll({
			where: { charging_station_id: chargingStationId },
		})
	).count;

	if (connectorsCount >= availableConnectorsCount) {
		throw new Error(
			`Unable to add more connectors to ${chargingStationName} with id: ${chargingStationId}`,
		);
	}
};

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
		const chargingStation = await ChargingStation.findByPk(
			chargingStationId,
			{ include: 'charging_station_type' },
		);

		if (!chargingStation) {
			logger.invalidFieldsErrorLogger(`/connector`);
			return res
				.status(422)
				.send({
					error: 'Given UUID does not exist or charging_station_type is missing',
				});
		}

		await priorityValidation(req.body.priority, chargingStationId);

		await plugCountValidation(
			chargingStation,
			chargingStationId,
			chargingStationName,
		);

		await Connector.create(req.body);

		logger.postSuccessLogger(connectorName);
		res.status(201).send();
	} catch (error: any) {
		logger.postErrorLogger(connectorName, error.message);
		res.status(400).send({ error: error.message });
	}
});

// GET /connector
router.get('/connector', auth, async (req: Request, res: Response) => {
	try {
		logger.beginLogger('GET', '/connector');
		const limit = parseInt(req.query.limit as string) || undefined;
		const offset = parseInt(req.query.offset as string) || undefined;

		const where: any = {};

		console.log(typeof req.query.priority);

		if (req.query.name) where.name = req.query.name;
		if (req.query.priority) where.priority = req.query.priority;
		if (req.query.charging_station_id)
			where.charging_station_id = req.query.charging_station_id;

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

// PATCH /connector/:id
router.patch('/connector/:id', auth, async (req: Request, res: Response) => {
	const { id } = req.params;
	const allowedFields = ['priority', 'charging_station_id'];
	const updateFields = Object.keys(req.body);
	const isUpdateChargingStation = updateFields.includes(
		'charging_station_id',
	);
	const isUpdatePriority = updateFields.includes('priority');

	logger.beginLogger('PATCH', `/connector/${id}`, req.body);

	const isInvalidField = updateFields.some(
		(field) => !allowedFields.includes(field),
	);

	if (isInvalidField) {
		logger.invalidFieldsErrorLogger(`/connector/${id}`);
		return res.status(400).send({ error: 'Given fields are invalid' });
	}

	if (
		updateFields.includes('charging_station_id') &&
		!validator.isUUID(req.body.charging_station_id)
	) {
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
				const chargingStation = await ChargingStation.findByPk(
					chargingStationId,
					{ include: 'charging_station_type' },
				);

				if (chargingStation) {
					await plugCountValidation(
						chargingStation,
						chargingStationId,
						chargingStationName,
					);
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
		if (
			error.name === 'SequelizeValidationError' ||
			error.name === 'Error'
		) {
			logger.error(error.message, 'API');
			return res.status(400).send({ error: error.message });
		}

		logger.patchInternalErrorLogger(connectorName, id, error.message);
		res.status(500).send({ error: 'Internal Server Error' });
	}
});

export default router;
