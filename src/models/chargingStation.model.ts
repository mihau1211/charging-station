import { Model, DataTypes, Sequelize, UUIDV4 } from 'sequelize';
import { ChargingStationType } from './chargingStationType.model';

class ChargingStation extends Model {
	public id!: string;
	public name!: string;
	public device_id!: string;
	public ip_address!: string;
	public firmware_version!: string;
	public charging_station_type!: ChargingStationType;
}

const initialize = (sequelize: Sequelize) => {
	ChargingStation.init(
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING,
				unique: true,
				allowNull: false,
			},
			device_id: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			ip_address: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			firmware_version: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			charging_station_type_id: {
				type: DataTypes.UUID,
				allowNull: false,
				references: { model: ChargingStationType, key: 'id' },
			},
		},
		{
			sequelize,
			modelName: 'ChargingStation',
			timestamps: false,
		},
	);

	ChargingStation.belongsTo(ChargingStationType, {
		foreignKey: 'charging_station_type_id',
		as: 'charging_station_type',
	});
};

export { ChargingStation, initialize };
