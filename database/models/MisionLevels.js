module.exports = (sequelize, dataTypes) => {
    let alias = "MisionLevels";

    let cols = {
        misionlevels_id: {
            type: dataTypes.BIGINT(11),
            primaryKey: true,
            autoIncrement: true
        },
        order: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },
        mision_id: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },
        fighter_id: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },
        level: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        }       
    };
    let config = {
        tableName: "misionlevels",
        timestamps: false
    };

    const MisionLevels = sequelize.define(alias, cols, config);
    MisionLevels.associate = function (models) {
        // Moves.belongsTo(models.SubCategories, {
        //     as: "SubCategories",
        //     foreignKey: "subcategory_id"
        // }) //esta podria ser para la tabla de moves
        MisionLevels.belongsTo(models.Misions, {
            as: "misions",
            foreignKey: "mision_id"
        })
        MisionLevels.belongsTo(models.Fighters, {
            as: "fighters",
            foreignKey: "fighter_id"
        })
    }
    return MisionLevels
}
