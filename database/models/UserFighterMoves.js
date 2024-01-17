module.exports = (sequelize, dataTypes) => {
    let alias = "UserFighterMoves";

    let cols = {
        user_fighter_move_id: {
            type: dataTypes.BIGINT(11),
            primaryKey: true,
            autoIncrement: true
        },
        move_id: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },
        user_fighter_id: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },
        current_xp: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },
        level: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },
        movelevel_id: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },
        selected: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        }
    };
    let config = {
        tableName: "userfightermoves",
        timestamps: false
    };

    const UserFighterMoves = sequelize.define(alias, cols, config);
    UserFighterMoves.associate = function (models) {
        // Moves.belongsTo(models.SubCategories, {
        //     as: "SubCategories",
        //     foreignKey: "subcategory_id"
        // }) //esta podria ser para la tabla de moves
        UserFighterMoves.belongsTo(models.MoveLevels, {
            as: "movelevels",
            foreignKey: 'movelevel_id',
            targetKey: 'movelevel_id'
        })
        UserFighterMoves.belongsTo(models.UserFighters, {
            as: "userfighters",
            foreignKey: "user_fighter_id"
        })
    }
    return UserFighterMoves
}
