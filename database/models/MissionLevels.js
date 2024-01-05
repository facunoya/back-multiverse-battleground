module.exports = (sequelize, dataTypes) => {
    let alias = "MissionLevels";

    let cols = {
        missionlevels_id: {
            type: dataTypes.BIGINT(11),
            primaryKey: true,
            autoIncrement: true
        },
        order: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },
        mission_id: {
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
        tableName: "missionlevels",
        timestamps: false
    };

    const MissionLevels = sequelize.define(alias, cols, config);
    MissionLevels.associate = function (models) {
        // Moves.belongsTo(models.SubCategories, {
        //     as: "SubCategories",
        //     foreignKey: "subcategory_id"
        // }) //esta podria ser para la tabla de moves
        MissionLevels.belongsTo(models.Missions, {
            as: "missions",
            foreignKey: "mission_id"
        })
        MissionLevels.belongsTo(models.Fighters, {
            as: "fighters",
            foreignKey: "fighter_id"
        })
    }
    return MissionLevels
}
