module.exports = (sequelize, DataTypes) => {
    const Lead = sequelize.define('Lead', {
        nome_do_lead: DataTypes.STRING,
        telefone: DataTypes.STRING,
        etapa_atual: DataTypes.STRING,
        imovel: DataTypes.STRING,
        valor_do_imovel: DataTypes.STRING,
        corretor: DataTypes.STRING,
        origem: DataTypes.STRING
    }, {});

    return Lead;
};
