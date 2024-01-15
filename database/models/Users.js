module.exports = (sequelize, dataTypes) => {
    let alias = "Users";

    let cols = {
        user_id: {
            type: dataTypes.BIGINT(11),
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: dataTypes.STRING(50),
            allowNull: false
        },
        password: {
            type: dataTypes.STRING(50),
            allowNull: false
        },
        name: {
            type: dataTypes.STRING(50),
            allowNull: false
        },
        money: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },
        avatar: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        google_id: {
            type: dataTypes.STRING(256),
            allowNull: false
        },
        google_picture: {
            type: dataTypes.STRING(256),
            allowNull: false
        },
        profile: {
            type: dataTypes.STRING(50),
            allowNull: false

        },
        bg_volume: {
            type: dataTypes.BIGINT(11),
            primaryKey: false,
            autoIncrement: false
        },
        sound_volume: {
            type: dataTypes.BIGINT(11),
            primaryKey: false,
            autoIncrement: false
        },
        sfx_volume: {
            type: dataTypes.BIGINT(11),
            primaryKey: false,
            autoIncrement: false
        }
    };
    let config = {
        tableName: "users",
        timestamps: false
    };

    const Users = sequelize.define(alias, cols, config);
    Users.associate = function (models) {
        Users.hasMany(models.UserFighters, {
            as: "userfighters",
            foreignKey: "user_id"
        })
        Users.hasMany(models.UserObjects, {
            as: "userobjects",
            foreignKey: "user_id"
        })
    }

    return Users
}
