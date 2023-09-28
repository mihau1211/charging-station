<<<<<<< HEAD
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
=======
import { Model, DataTypes, Sequelize, UUIDV4 } from 'sequelize';

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
                defaultValue: UUIDV4,
                allowNull: false,
                primaryKey: true
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
>>>>>>> df78d89503281ad55945c25cbf76b9dcc8ef8b35
};

export { ChargingStationType, initialize };
