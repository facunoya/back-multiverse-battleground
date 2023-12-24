module.exports = (sequelize, dataTypes) => {
    let alias = "UserFighters";

    let cols = {
        user_fighter_id: {
            type: dataTypes.BIGINT(11),
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },
        fighter_id: {
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
            foreignKey: "fighter_id"
        })
        UserFighters.belongsTo(models.Users, {
            as: "users",
            foreignKey: "user_id"
        })
    }


    return UserFighters
}
