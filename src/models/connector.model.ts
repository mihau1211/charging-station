import { Model, DataTypes, Sequelize, UUIDV4 } from 'sequelize';
import { ChargingStation } from './chargingStation.model';

class Connector extends Model {
    public id!: string;
    public name!: string;
    public priority!: boolean;
    public charging_station!: ChargingStation;
}

const initialize = (sequelize: Sequelize) => {
    Connector.init(
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
                allowNull: false
            },
            priority: {
                type: DataTypes.BOOLEAN,
                allowNull: false
            },
            charging_station_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: { model: ChargingStation, key: 'id' }
            }
        },
        {
            sequelize,
            modelName: 'Connector',
            timestamps: false
        }
    );

    Connector.belongsTo(ChargingStation, {
        foreignKey: 'charging_station_id',
        as: 'charging_station',
    });
};

export { Connector, initialize };
