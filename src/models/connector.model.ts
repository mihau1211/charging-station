import { Model, DataTypes, Sequelize } from 'sequelize';
import { ChargingStation } from './chargingStation.model';

class Connector extends Model {
    public id!: string;
    public name!: string;
    public priority!: boolean;
    public chargingStationId!: string;
}

const initialize = (sequelize: Sequelize) => {
    Connector.init(
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
            },
            name: DataTypes.STRING,
            priority: DataTypes.BOOLEAN,
            chargingStationId: {
                type: DataTypes.UUID,
                references: { model: ChargingStation, key: 'id' }
            }
        },
        {
            sequelize,
            modelName: 'Connector',
        }
    );

    Connector.belongsTo(ChargingStation, {
        foreignKey: 'chargingStationId',
        as: 'chargingStation',
    });
};

export { Connector, initialize };
