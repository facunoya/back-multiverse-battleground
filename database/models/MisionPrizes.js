module.exports = (sequelize, dataTypes) => {
    let alias = "MisionPrizes";

    let cols = {
        misionprizes_id: {
            type: dataTypes.BIGINT(11),
            primaryKey: true,
            autoIncrement: true
        },
        mision_id: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },
        object_id: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },
        value: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        }       
    };
    let config = {
        tableName: "misionprizes",
        timestamps: false
    };

    const MisionPrizes = sequelize.define(alias, cols, config);
    MisionPrizes.associate = function (models) {
        // Moves.belongsTo(models.SubCategories, {
        //     as: "SubCategories",
        //     foreignKey: "subcategory_id"
        // }) //esta podria ser para la tabla de moves
        MisionPrizes.belongsTo(models.Misions, {
            as: "misions",
            foreignKey: "mision_id"
        })
        MisionPrizes.belongsTo(models.Objects, {
            as: "objects",
            foreignKey: "object_id"
        })
    }
    return MisionPrizes
}
