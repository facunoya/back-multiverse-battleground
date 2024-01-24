const db = require('../database/models')
const { Op } = require('sequelize');



const updateFighterConfig = async (fighter) => {
    try {
        // Crear el nuevo usuario directamente con el resultado de create
        /*const newUser = await db.Users.create({
            email: decoded.email,
            name: decoded.name,
            google_id: decoded.sub,
            google_picture: decoded.picture,
            money: 100,
            profile: "Player",
            avatar: decoded.picture,
            password: "googleLogin"
        });*/

        // Puedes realizar otras operaciones si es necesario

        // return newUser;
    } catch (error) {
        // Manejar errores, por ejemplo, puedes loggearlos o lanzar una excepción
        console.error("Error al crear el usuario:", error);
        throw error;
    }
}


module.exports = {
    updateFighterConfig
    /*loginUser,
    createUser,
    createUserFighter,
    getAllUserFighters
    // Otras funciones que desees exportar*/
};