import { Model, DataTypes, Sequelize } from 'sequelize';

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
      chargingStationTypeId: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: 'ChargingStation',
    }
  );
};

export { ChargingStation, initialize };
