module.exports = (sequelize, dataTypes) => {
    let alias = "UserFighters";

    let cols = {
        userFighterId: {
            type: dataTypes.BIGINT(11),
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },
        fighterId: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },


    };
    let config = {
        tableName: "userfighters",
        timestamps: false
    };

    const UserFighters = sequelize.define(alias, cols, config);

    UserFighters.associate = function (models) {
        UserFighters.belongsTo(models.Fighters, {
            as: "fighters",
            foreignKey: "fighterId"
        })
        UserFighters.belongsTo(models.Users, {
            as: "users",
            foreignKey: "userId"
        })
    }


    return UserFighters
}
