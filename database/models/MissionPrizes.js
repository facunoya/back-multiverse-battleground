module.exports = (sequelize, dataTypes) => {
    let alias = "MissionPrizes";

    let cols = {
        missionprizes_id: {
            type: dataTypes.BIGINT(11),
            primaryKey: true,
            autoIncrement: true
        },
        mission_id: {
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
        tableName: "missionprizes",
        timestamps: false
    };

    const MissionPrizes = sequelize.define(alias, cols, config);
    MissionPrizes.associate = function (models) {
        // Moves.belongsTo(models.SubCategories, {
        //     as: "SubCategories",
        //     foreignKey: "subcategory_id"
        // }) //esta podria ser para la tabla de moves
        MissionPrizes.belongsTo(models.Missions, {
            as: "missions",
            foreignKey: "mission_id"
        })
        MissionPrizes.belongsTo(models.Objects, {
            as: "objects",
            foreignKey: "object_id"
        })
    }
    return MissionPrizes
}
