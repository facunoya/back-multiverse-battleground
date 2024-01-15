const db = require('../database/models')
const { Op } = require('sequelize');

const loginUser = async (req, res) => {

}
/**
 * Crea un nuevo usuario a partir de la información proporcionada.
 *
 * param {Object} userInfo - Información del usuario.
 * param {string} userInfo.sub - Valor de sub(clave google_id).
 * param {string} userInfo.email - Correo electrónico del usuario.
 * param {string} userInfo.name - Nombre completo del usuario.
 * param {string} userInfo.picture - URL de la imagen del usuario.
 * @returns {Promise<Object>} - Promesa que se resuelve con el objeto del nuevo usuario creado.
 */
const createUser = async (decoded) => {
    try {
        // Crear el nuevo usuario directamente con el resultado de create
        const newUser = await db.Users.create({
            email: decoded.email,
            name: decoded.name,
            google_id: decoded.sub,
            google_picture: decoded.picture,
            money: 100,
            profile: "Player",
            avatar: decoded.picture,
            password: "googleLogin"
        });

        // Puedes realizar otras operaciones si es necesario

        return newUser;
    } catch (error) {
        // Manejar errores, por ejemplo, puedes loggearlos o lanzar una excepción
        console.error("Error al crear el usuario:", error);
        throw error;
    }
}

const createUserFighter = async (fighter_id, user_id, origin) => {
    try {
        // Crear el nuevo luchador de usuario
        let active = origin === "register"
        let in_party = origin === "register"
        const newUserFighter = await db.UserFighters.create({
            fighter_id,
            user_id,
            active,
            in_party,
            extra_accuracy: 0,
            extra_max_hp: 0,
            extra_attack: 0,
            extra_special_attack: 0,
            extra_defense: 0,
            extra_special_defense: 0,
            attack_multiplier: 1,
            special_attack_multiplier: 1,
            defense_multiplier: 1,
            special_defense_multiplier: 1,
            current_xp: 0,
            level: 1
        });

        // Asignar movimientos en userfightermoves
        const user_fighter_id = newUserFighter.user_fighter_id;
        const fighterMoves = await db.Moves.findAll({ where: { fighter_id, min_level: 1 } });

        for (const move of fighterMoves) {
            const moveLevel = await db.MoveLevels.findOne({
                where: { move_id: move.move_id, level: 1 }
            });

            if (moveLevel) {
                await db.UserFighterMoves.create({
                    move_id: move.move_id,
                    level: 1,
                    current_xp: 1,
                    user_fighter_id,
                    movelevel_id: moveLevel.movelevel_id,
                    selected: 1
                });
            }
        }

        return newUserFighter;
    } catch (error) {
        // Manejar errores, por ejemplo, puedes loggearlos o lanzar una excepción
        console.error("Error al crear el luchador de usuario:", error);
        throw error;
    }
};
const assignMovesToUserFighter = async (user_fighter_id) => {
    // Código para asignar movimientos a un luchador de usuario aquí
}

const getAllUserFighters = async (user_id) => {
    let mappedUserFighters
    await db.UserFighters.findAll({ where: { user_id }, include: [{ association: "fighters" }] })
        .then(async (userFighters) => {
            mappedUserFighters = userFighters.map((userFighter) => ({
                ...userFighter.toJSON(),  // Utiliza el spread operator para copiar todas las propiedades
                name: userFighter.fighters.name,
                img_back: userFighter.fighters.img_back,
                img_front: userFighter.fighters.img_front,
                // Otros campos que desees incluir...
            }));
            for (let fighter of mappedUserFighters) {
                const fighterLevel = await db.FighterLevels.findOne({ where: { fighter_id: fighter.fighter_id, level: fighter.level } })
                fighter.attack = fighterLevel.attack
                fighter.special_attack = fighterLevel.special_attack
                fighter.defense = fighterLevel.defense
                fighter.special_defense = fighterLevel.special_defense
                fighter.accuracy = fighterLevel.accuracy
                fighter.max_hp = fighterLevel.max_hp
                fighter.current_hp = fighterLevel.max_hp
                let moves = await db.UserFighterMoves.findAll({
                    where: { user_fighter_id: fighter.user_fighter_id },
                    include: [
                        {
                            model: db.MoveLevels,
                            as: 'movelevels',
                            include: [
                                {
                                    model: db.Moves,
                                    as: "moves"
                                },
                                {
                                    model: db.MoveActions,
                                    as: "moveactions"
                                }
                            ]
                        },
                    ],
                });
                moves = moves.map(move => {
                    const restructuredMove = {
                        user_fighter_move_id: move.user_fighter_move_id,
                        move_id: move.move_id,
                        user_fighter_id: move.user_fighter_id,
                        current_xp: move.current_xp,
                        level: move.level,
                        movelevel_id: move.movelevel_id,
                        img: move.movelevels.moves.img,
                        name: move.movelevels.moves.name,
                        sfx: move.movelevels.moves.sfx,
                        mp: move.movelevels.moves.mp,
                        actionmoves: move.movelevels.moveactions.map(action => ({
                            action_move_id: action.action_move_id,
                            move_id: action.move_id,
                            attack_type: action.attack_type,
                            field: action.field,
                            inflicted_on: action.inflicted_on,
                            value: action.value,
                            level: action.level,
                            movelevel_id: action.movelevel_id
                        }))
                    };
                    return restructuredMove;
                });
                fighter.moves = moves
            }
        })
    return mappedUserFighters
}
const createUserObject = async (newUser) => {
    // Código para crear un nuevo objeto de usuario aquí
}

module.exports = {
    loginUser,
    createUser,
    createUserFighter,
    getAllUserFighters
    // Otras funciones que desees exportar
};