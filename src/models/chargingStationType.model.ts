import { Model, DataTypes, Sequelize, UUIDV4 } from 'sequelize';

class ChargingStationType extends Model {
	public id!: string;
	public name!: string;
	public plug_count!: number;
	public efficiency!: number;
	public current_type!: 'AC' | 'DC';
}

const initialize = async (sequelize: Sequelize) => {
	ChargingStationType.init(
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: UUIDV4,
				allowNull: false,
				primaryKey: true,
			},
			name: {
				type: DataTypes.STRING,
				unique: true,
				allowNull: false,
			},
			plug_count: {
				type: DataTypes.INTEGER,
				allowNull: false,
				validate: {
					isInt: { msg: 'plug_count must be an integer' },
				},
			},
			efficiency: {
				type: DataTypes.FLOAT,
				allowNull: false,
				validate: {
					isFloat: {
						msg: 'efficiency must be a floating point number',
					},
				},
			},
			current_type: {
				type: DataTypes.ENUM('AC', 'DC'),
				allowNull: false,
				validate: {
					isIn: {
						args: [['AC', 'DC']],
						msg: 'current_type must be one of: AC, DC',
					},
				},
			},
		},
		{
			sequelize,
			modelName: 'ChargingStationType',
			timestamps: false,
		},
	);
};

export { ChargingStationType, initialize };
