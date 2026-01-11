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
        },
        spreadsheetId: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'ID da planilha Google associada a esta agência'
        }
    }, {});

    Agency.associate = function (models) {
        Agency.hasMany(models.User, { foreignKey: 'agencyId', as: 'users' });
        Agency.hasMany(models.Lead, { foreignKey: 'agencyId', as: 'leads' });
    };

    return Agency;
};
