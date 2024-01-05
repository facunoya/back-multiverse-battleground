module.exports = (sequelize, dataTypes) => {
    let alias = "Misions";

    let cols = {
        mision_id: {
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
        tableName: "misions",
        timestamps: false
    };

    const Misions = sequelize.define(alias, cols, config);
   /* Objects.associate = function (models) {
        Objects.hasMany(models.UserObjects, {
            as: "userobjects",
            foreignKey: "user_object_id"
        })
    }*/
    Misions.associate = function (models) {
        Misions.hasMany(models.MisionLevels, {
            as: "misionlevels",
            foreignKey: "misionlevels_id"
        })
        Misions.hasMany(models.MisionPrizes, {
            as: "misionprizes",
            foreignKey: "misionprizes_id"
        })
    }
    return Misions
}
