module.exports = (sequelize, dataTypes) => {
    let alias = "ObjectActions";

    let cols = {
        action_object_id: {
            type: dataTypes.BIGINT(11),
            primaryKey: true,
            autoIncrement: true
        },
        object_id: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        },
        field: {
            type: dataTypes.STRING(50),
            allowNull: false
        },
        inflicted_on: {
            type: dataTypes.STRING(50),
            allowNull: false
        },
        value: {
            type: dataTypes.BIGINT(11),
            allowNull: false
        }
    };
    let config = {
        tableName: "actionobjects",
        timestamps: false
    };

    const ObjectActions = sequelize.define(alias, cols, config);
    ObjectActions.associate = function (models) {
        // Moves.belongsTo(models.SubCategories, {
        //     as: "SubCategories",
        //     foreignKey: "subcategory_id"
        // }) //esta podria ser para la tabla de moves
        ObjectActions.belongsTo(models.Objects, {
            as: "objects",
            foreignKey: "object_id"
        })
    }
    return ObjectActions
}
