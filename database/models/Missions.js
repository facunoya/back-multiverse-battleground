module.exports = (sequelize, dataTypes) => {
    let alias = "Missions";

    let cols = {
        mission_id: {
            type: dataTypes.BIGINT(11),
            primaryKey: true,
            autoIncrement: true
        },
        description: {
            type: dataTypes.STRING(50),
            allowNull: false
        }
        // createdDate: {
        //     type: dataTypes.DATE,
        //      allowNull: false

        // },

    };
    let config = {
        tableName: "missions",
        timestamps: false
    };

    const Missions = sequelize.define(alias, cols, config);
   /* Objects.associate = function (models) {
        Objects.hasMany(models.UserObjects, {
            as: "userobjects",
            foreignKey: "user_object_id"
        })
    }*/
    Missions.associate = function (models) {
        Missions.hasMany(models.MissionLevels, {
            as: "missionlevels",
            foreignKey: "missionlevels_id"
        })
        Missions.hasMany(models.MissionPrizes, {
            as: "missionprizes",
            foreignKey: "missionprizes_id"
        })
    }
    return Missions
}
