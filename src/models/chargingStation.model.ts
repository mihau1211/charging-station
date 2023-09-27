import { Model, DataTypes, Sequelize } from 'sequelize';
import { ChargingStationType } from './chargingStationType.model';

class ChargingStation extends Model {
    public id!: string;
    public name!: string;
    public device_id!: string;
    public ip_address!: string;
    public firmware_version!: string;
    public chargingStationTypeId!: string;
}

const initialize = (sequelize: Sequelize) => {
    ChargingStation.init(
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
            },
            name: DataTypes.STRING,
            device_id: DataTypes.UUID,
            ip_address: DataTypes.STRING,
            firmware_version: DataTypes.STRING,
            chargingStationTypeId: {
                type: DataTypes.UUID,
                references: { model: ChargingStationType, key: 'id' }
            }
        },
        {
            sequelize,
            modelName: 'ChargingStation',
        }
    );

    ChargingStation.belongsTo(ChargingStation, {
        foreignKey: 'chargingStationTypeId',
        as: 'chargingStationType',
    });
};

export { ChargingStation, initialize };
