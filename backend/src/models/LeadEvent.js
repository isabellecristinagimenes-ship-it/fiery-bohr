module.exports = (sequelize, DataTypes) => {
    const LeadEvent = sequelize.define('LeadEvent', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        type: {
            type: DataTypes.ENUM('CREATED', 'STAGE_CHANGE', 'VISIT'),
            allowNull: false
        },
        metadata: {
            type: DataTypes.JSON, // Store details like { from: 'Novo', to: 'Qualificado' }
            allowNull: true
        },
        agencyId: {
            type: DataTypes.UUID,
            allowNull: false
        }
    }, {});

    LeadEvent.associate = function (models) {
        LeadEvent.belongsTo(models.Lead, { foreignKey: 'leadId', as: 'lead' });
        LeadEvent.belongsTo(models.Agency, { foreignKey: 'agencyId', as: 'agency' });
    };

    return LeadEvent;
};
