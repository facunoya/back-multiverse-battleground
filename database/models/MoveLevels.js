module.exports = (sequelize, dataTypes) => {
    let alias = "MoveLevels";

    let cols = {
        movelevel_id: {
            type: dataTypes.BIGINT(11),
            primaryKey: true,
            autoIncrement: true
        },
        move_id: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },
        min_xp: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },
        level: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        }
        // createdDate: {
        //     type: dataTypes.DATE,
        //      allowNull: false

        // },

    };
    let config = {
        tableName: "movelevels",
        timestamps: false
    };

    const MoveLevels = sequelize.define(alias, cols, config);
    MoveLevels.associate = function (models) {
        // Moves.belongsTo(models.SubCategories, {
        //     as: "SubCategories",
        //     foreignKey: "subcategory_id"
        // }) //esta podria ser para la tabla de moves
        MoveLevels.belongsTo(models.Moves, {
            as: "moves",
            foreignKey: "move_id"
        })
        MoveLevels.hasMany(models.UserFighterMoves, {
            as: "userfightermoves",
            foreignKey: "movelevel_id"
        })
        MoveLevels.hasMany(models.MoveActions, {
            as: "moveactions",
            foreignKey: "movelevel_id"
        })
    }
    return MoveLevels
}
