const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Lead = sequelize.define('Lead', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome_do_lead: {
        type: DataTypes.STRING,
        allowNull: false
    },
    telefone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    etapa_atual: {
        type: DataTypes.STRING,
        defaultValue: 'Novo Lead'
    },
    imovel: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tipo_de_imovel: {
        type: DataTypes.STRING,
        allowNull: true
    },
    valor_do_imovel: {
        type: DataTypes.STRING, // Changed to STRING to support ranges (e.g. "100k - 200k")
        allowNull: true
    },
    corretor: {
        type: DataTypes.STRING,
        allowNull: true
    },
    origem: {
        type: DataTypes.STRING,
        allowNull: true
    },
    data_entrada: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'leads',
    timestamps: true // Adds createdAt and updatedAt
});

module.exports = Lead;
