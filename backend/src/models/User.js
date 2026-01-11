module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('owner', 'broker'),
            defaultValue: 'broker'
        },
        agencyId: {
            type: DataTypes.UUID,
            allowNull: true, // Nullable for super-admins or initial setup
            references: {
                model: 'Agencies',
                key: 'id'
            }
        }
    }, {});

    User.associate = function (models) {
        User.belongsTo(models.Agency, { foreignKey: 'agencyId', as: 'agency' });
    };

    return User;
};
