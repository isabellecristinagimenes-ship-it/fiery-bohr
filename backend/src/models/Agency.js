module.exports = (sequelize, DataTypes) => {
    const Agency = sequelize.define('Agency', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        plan: {
            type: DataTypes.ENUM('free', 'premium', 'enterprise'),
            defaultValue: 'free'
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {});

    Agency.associate = function (models) {
        Agency.hasMany(models.User, { foreignKey: 'agencyId', as: 'users' });
        Agency.hasMany(models.Lead, { foreignKey: 'agencyId', as: 'leads' });
    };

    return Agency;
};
