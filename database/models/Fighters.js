module.exports = (sequelize, dataTypes) => {
    let alias = "Fighters";

    let cols = {
        fighterId: {
            type: dataTypes.BIGINT(11),
            primaryKey: true,
            autoIncrement: true
        },
        accuracy: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },
        active: {
            type: dataTypes.STRING(50),
            allowNull: false
        },
        attack: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },

        currentHp: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },
        currentXp: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },
        defense: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },
        imgBack: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        imgFront: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        inParty: {
            type: dataTypes.STRING(50),
            allowNull: false
        },
        level: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },
        maxHp: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },
        name: {
            type: dataTypes.STRING(50),
            allowNull: false
        },
        price: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },
        specialAttack: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },
        specialDefense: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },
        // createdDate: {
        //     type: dataTypes.DATE,
        //      allowNull: false

        // },

    };
    let config = {
        tableName: "fighters",
        timestamps: false
    };

    const Fighters = sequelize.define(alias, cols, config);
    Fighters.associate = function (models) {
        // Fighters.belongsTo(models.SubCategories, {
        //     as: "SubCategories",
        //     foreignKey: "subcategory_id"
        // }) //esta podria ser para la tabla de moves
        Fighters.hasMany(models.UserFighters, {
            as: "UserFighters",
            foreignKey: "userFighterId"
        })
    }


    return Fighters
}
