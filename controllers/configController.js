const db = require('../database/models')
const { Op } = require('sequelize');



const updateFighterConfig = async (fighterData) => {
    try {
        const fighter =  await db.Fighters.findOne({
            where: { fighter_id:fighterData.fighter_id },
        })
        fighter.name=fighterData.name
        fighter.img_front=fighterData.img_front
        fighter.img_back=fighterData.img_back
        fighter.price=fighterData.price
        await fighter.save()
        return fighter
    } catch (error) {
        // Manejar errores, por ejemplo, puedes loggearlos o lanzar una excepción
        console.error("Error al crear el usuario:", error);
        throw error;
    }
}
const updateMoveConfig = async (moveData) => {
    try {
        const move =  await db.Moves.findOne({
            where: { move_id:moveData.move_id },
        })
        move.name=moveData.name
        move.img=moveData.img
        move.sfx=moveData.sfx
        move.mp=moveData.mp
        move.min_level=moveData.min_level
        await move.save()
        return move
    } catch (error) {
        // Manejar errores, por ejemplo, puedes loggearlos o lanzar una excepción
        console.error("Error al crear el usuario:", error);
        throw error;
    }
}


module.exports = {
    updateFighterConfig,
    updateMoveConfig
    /*loginUser,
    createUser,
    createUserFighter,
    getAllUserFighters
    // Otras funciones que desees exportar*/
};