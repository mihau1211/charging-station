import { Model, DataTypes, Sequelize } from 'sequelize';

class ChargingStationType extends Model {
  public id!: string;
  public name!: string;
  public plug_count!: number;
  public efficiency!: number;
  public current_type!: 'AC' | 'DC';
}

const initialize = (sequelize: Sequelize) => {
  ChargingStationType.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      plug_count: DataTypes.INTEGER,
      efficiency: DataTypes.FLOAT,
      current_type: DataTypes.ENUM('AC', 'DC'),
    },
    {
      sequelize,
      modelName: 'ChargingStationType',
    }
  );
};

export { ChargingStationType, initialize };
