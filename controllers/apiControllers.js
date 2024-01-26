const db = require('../database/models')
const { Op } = require('sequelize');
const { jwtDecode } = require('jwt-decode');
const userController = require('./userController');
const configController = require('./configController');

const apiControllers = {
    getAllUsers: async (req, res) => {
        try {
            // Verificar si se proporciona el user_id en la solicitud
            const user_id = req.params.user_id ? req.params.user_id : null;

            // Construir la condición de búsqueda
            const whereCondition = user_id ? { user_id: user_id } : {};

            // Realizar la consulta a la base de datos
            const users = await db.Users.findAll({
                include: [
                    { association: "userfighters", where: whereCondition, include: [{ model: db.Fighters, as: 'fighters' }] },
                    { association: "userobjects", where: whereCondition, include: [{ model: db.Objects, as: 'objects', attributes: ['name', 'description'] }] },
                ],
            });
            // Mapear los resultados a la estructura deseada
            const mappedUsers = users.map((user) => {
                // Mapear userobjects a la estructura deseada utilizando el spread operator
                const mappedUserObjects = user.userobjects.map((userObject) => ({
                    ...userObject.toJSON(),  // Utiliza el spread operator para copiar todas las propiedades
                    name: userObject.objects.name,
                    description: userObject.objects.description
                    // Otros campos que desees incluir...
                }));
                const mappedUserFighters = user.userfighters.map((userFighter) => ({
                    ...userFighter.toJSON(),  // Utiliza el spread operator para copiar todas las propiedades
                    img_front: userFighter.fighters.img_front,
                    img_back: userFighter.fighters.img_back,
                    // Otros campos que desees incluir...
                }));
                // Construir el objeto resultante
                return {
                    ...user.toJSON(),  // Utiliza el spread operator para copiar todas las propiedades
                    userobjects: mappedUserObjects,
                    userfighters: mappedUserFighters
                };
            });
            // Enviar los datos como respuesta
            res.send(mappedUsers);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al obtener usuarios.');
        }
    },
    getAllFighters: async (req, res) => {
        await db.Fighters.findAll({
            include: [
                {
                    model: db.Moves, // Modelo asociado a 'moves'
                    as: 'moves', // Alias de la asociación 'moves'
                    include: [
                        {
                            model: db.MoveActions, // Modelo asociado a 'moveactions' a través de 'moves'
                            as: 'actionmoves' // Alias de la asociación 'actionmoves'
                        }
                    ]
                }
            ]
        })
            .then((fighters) => {
                return res.send(fighters)
            })
    },
    getFighter: async (req, res) => {
        const fighter_id = req.params.fighter_id
        await db.Fighters.findOne({
            where: { fighter_id }
        })
            .then((fighters) => {
                return res.send(fighters)
            })
    },
    getFighterMoves: async (req, res) => {
        const fighter_id = req.params.fighter_id
        await db.Moves.findAll({
            where: { fighter_id }
        })
            .then((moves) => {
                return res.send(moves)
            })
    },
    updateFighterConfig: async (req, res) => {
        let fighterData = req.body[0]
        const newFighter = await configController.updateFighterConfig(fighterData)
        return res.send(newFighter)
    },
    updateMoveConfig: async (req, res) => {
        let moveData = req.body
        const newMove = await configController.updateMoveConfig(moveData)
        return res.send(newMove)
    },
    getAllFightersInitialLevel: async (req, res) => {
        const query = `
        SELECT fighterlevels.*, fighters.*
        FROM bza3ei2wxiisdvotlfcc.fighterlevels
        INNER JOIN fighters ON fighterlevels.fighter_id = fighters.fighter_id
        WHERE fighterlevels.level = 1;
      `;
        // Ejecuta la consulta SQL personalizada usando sequelize.query
        const result = await db.sequelize.query(query, {
            type: db.sequelize.QueryTypes.SELECT,
        });

        res.json(result)

    },
    getAllObjects: async (req, res) => {
        await db.Objects.findAll()
            .then((objects) => {
                return res.send(objects)
            })
    },
    userLogin: async (req, res) => {
        let parametros = req.body[0]
        let token = parametros.credentials.credential
        const decoded = jwtDecode(token);
        console.log(decoded)
        const user = await db.Users.findOne({
            where: { google_id: decoded.sub }
        })
        if (user) {
            //console.log(user)
            return res.send(user)
        } else {
            const newUser = await userController.createUser(decoded);
            await userController.createUserFighter(1, newUser.user_id, "register");
            await db.UserObjects.create({
                object_id: 7,
                user_id: newUser.user_id,
                quantity: 150
            });
            return res.send(newUser)
        }
    },
    getAllUserFighters: async (req, res) => {
        const user_id = req.params.user_id ? req.params.user_id : null;
        // Construir la condición de búsqueda
        const userFighters = await userController.getAllUserFighters(user_id)
        return res.send(userFighters)
    },
    getAllUserObjects: async (req, res) => {
        const user_id = req.params.user_id;
        await db.UserObjects.findAll({ include: [{ association: "objects", include: [{ association: "actionobjects" }] }], where: { user_id: user_id }, })
            .then((userObjects) => {
                const mappedUserObjects = userObjects.map((userObject) => ({
                    ...userObject.toJSON(),  // Utiliza el spread operator para copiar todas las propiedades
                    name: userObject.objects.name,
                    description: userObject.objects.description,
                    img: userObject.objects.img,
                    // Otros campos que desees incluir...
                }));
                return res.send(mappedUserObjects)
            })
    },
    getAllMisions: async (req, res) => {
        await db.Missions.findAll({
            include: [
                { association: "missionlevels" },
                {
                    association: "missionprizes",
                    include: [{ association: "objects" }]
                }]
        })
            .then((missions) => {
                return res.send(missions)
            })
    },
    upadateUserObjects: async (req, res) => {
        let parametros = req.body[0]
        let objects = parametros.objects
        objects.forEach(async (object) => {
            let quantity = object.quantity
            let user_object_id = object.user_object_id
            const updateObject = await db.UserObjects.findOne({
                where: { user_object_id }
            })
            if (quantity > 0 && updateObject.object_id !== 7) {
                updateObject.quantity = quantity
                await db.UserObjects.update({ ...updateObject, quantity: quantity }, { where: { user_object_id } })//esperar a que este resuelto
            } else {
                if (updateObject.object_id !== 7) {
                    await db.UserObjects.destroy({ where: { user_object_id } })
                }
            }
        })
        return res.send('ok')
    },
    completeMission: async (req, res) => {
        let parametros = req.body[0]
        let user_id = parametros.user_id
        let missionprizes = parametros.missionprizes
        missionprizes.forEach(async (missionPrize) => {
            let object_id = missionPrize.object_id
            let value = missionPrize.value
            const userObject = await db.UserObjects.findOne({
                where: { user_id, object_id },
            });
            if (userObject) {
                // Si existe, actualizar la cantidad
                userObject.quantity += value;
                await userObject.save(); // Guardar los cambios en la base de datos
            } else {
                // Si no existe, crear un nuevo UserObject
                await db.UserObjects.create({
                    object_id,
                    user_id,
                    quantity: value,
                });
            }
        })
        return res.send('ok')
    },
    getAllFighterLevels: async (req, res) => {
        const fighter_id = req.params.fighter_id ? req.params.fighter_id : null;
        // Construir la condición de búsqueda
        const whereCondition = fighter_id ? { fighter_id: fighter_id } : {};
        await db.FighterLevels.findAll({where:whereCondition, include: [{ association: "fighters" }] })
            .then((fighterLevel) => {
                return res.send(fighterLevel)
            })
    },
    getAllMoves: async (req, res) => {
        await db.Moves.findAll({ include: [{ association: "fighters" }, { association: "actionmoves" }] })
            .then((moves) => {
                return res.send(moves)
            })
    },
    getAllFighterMoves: async (req, res) => {
        await db.UserFighterMoves.findAll({ include: [{ association: "userfighters" }, { association: "moves" }] })
            .then((moves) => {
                return res.send(moves)
            })
    },
    buyObject: async (req, res) => {
        const user_id = req.body[0].user_id
        const object_id = req.body[0].object_id
        const quantity = req.body[0].quantity
        const object = await db.Objects.findOne({ where: { object_id } })
        const userMoney = await db.UserObjects.findOne({
            where: { object_id: 7, user_id } //7 es Money
        });
        if (userMoney.quantity >= (object.price * quantity)) {
            userMoney.quantity -= object.price * quantity //poner el precio del objeto comprado
            await userMoney.save();
            const userObject = await db.UserObjects.findOne({
                where: { user_id, object_id },
            });
            /*falta ver si en esta funcion restamos la plata tabmién o si se hace por otro lado*/
            if (userObject) {
                // Si existe, actualizar la cantidad
                userObject.quantity += quantity;
                await userObject.save(); // Guardar los cambios en la base de datos
            } else {
                // Si no existe, crear un nuevo UserObject
                await db.UserObjects.create({
                    object_id,
                    user_id,
                    quantity
                });
            }
        } else {
            return res.send("no money")
        }
        return res.send("ok")
    },
    buyFighter: async (req, res) => {
        const user_id = req.body[0].user_id
        const fighter_id = req.body[0].fighter_id
        const fighter = await db.Fighters.findOne({ where: { fighter_id } })
        const userMoney = await db.UserObjects.findOne({
            where: { object_id: 7, user_id } //7 es Money
        });
        if (userMoney.quantity > fighter.price) {
            userMoney.quantity -= fighter.price //poner el precio del objeto comprado
            await userMoney.save();
            await userController.createUserFighter(fighter_id, user_id, "buy")
        } else {
            return res.send("no money")
        }
        return res.send("ok")
    },
    addToParty: async (req, res) => {
        const user_fighter_id = req.body[0].user_fighter_id
        const userFighter = await db.UserFighters.findOne({
            where: { user_fighter_id }
        });
        userFighter.in_party = "true"
        userFighter.save()
        return res.send("ok")
    },
    addMove: async (req, res) => {
        const user_fighter_move_id = req.body[0].user_fighter_move_id
        const userFighterMove = await db.UserFighterMoves.findOne({
            where: { user_fighter_move_id }
        });
        userFighterMove.selected = 1
        userFighterMove.save()
        return res.send("ok")
    },
    removeMove: async (req, res) => {
        const user_fighter_move_id = req.body[0].user_fighter_move_id
        const userFighterMove = await db.UserFighterMoves.findOne({
            where: { user_fighter_move_id }
        });
        userFighterMove.selected = 0
        userFighterMove.save()
        return res.send("ok")
    },
    updateFighter: async (req, res) => {
        const newFighter = req.body[0].newFighter
        const current_xp = req.body[0].current_xp
        const userFighter = await db.UserFighters.findOne({
            where: { user_fighter_id: newFighter.user_fighter_id }
        });
        // Updates fighter Level and current_xp
        userFighter.level = newFighter.level
        userFighter.current_xp = newFighter.current_xp
        userFighter.save()
        // Updates moves Levels
        const moves = await db.UserFighterMoves.findAll({
            where: { user_fighter_id: newFighter.user_fighter_id, selected: 1 }
        })
        const moveLevels = await db.MoveLevels.findAll()
        moves.forEach((move) => {
            move.current_xp += current_xp / moves.length
            moveLevels.forEach((moveLevel) => {
                if (moveLevel.move_id === move.move_id && moveLevel.min_xp < move.current_xp) {
                    move.level = moveLevel.level
                    move.movelevel_id = moveLevel.movelevel_id
                }
            })
            move.save()
        })
        const fighterMoves = await db.Moves.findAll({
            where: {
                fighter_id: userFighter.fighter_id, min_level: {
                    [Op.lt]: userFighter.level
                }
            }
        })
        for (const move of fighterMoves) {
            let movelevel_id
            let move_id
            const moveLevels = await db.MoveLevels.findAll()
            moveLevels.forEach((moveLevel) => {
                if (move.move_id === moveLevel.move_id && moveLevel.level === 1) {
                    movelevel_id = moveLevel.movelevel_id
                    move_id = move.move_id
                }
            })
            const alreadyHasTheMove = await db.UserFighterMoves.findOne({
                where: {
                    user_fighter_id: newFighter.user_fighter_id,
                    move_id
                }
            })
            if (!alreadyHasTheMove) {
                await db.UserFighterMoves.create({
                    move_id: move.move_id,
                    level: 1,
                    current_xp: 1,
                    user_fighter_id: newFighter.user_fighter_id,
                    movelevel_id,
                    selected: 0
                })
            }
        }
        return res.send("ok")
    },
    updateUserMoney: async (req, res) => {
        const quantity = req.body[0].quantity
        const user_id = req.body[0].user_id
        const userObjects = await db.UserObjects.findOne({
            where: { user_id, object_id: 7 } //7 es Money
        });
        userObjects.quantity += quantity
        await userObjects.save()
        return res.send("ok")
    },
    removeFromParty: async (req, res) => {
        const user_fighter_id = req.body[0].user_fighter_id
        const user_id = req.body[0].user_id
        const userFighter = await db.UserFighters.findOne({
            where: { user_fighter_id }
        });
        userFighter.in_party = "false"
        let setNewFirst = userFighter.active === "true"
        userFighter.active = "false"
        await userFighter.save()
        if (setNewFirst) {
            let firstSetted = false
            const userFighters = await db.UserFighters.findAll({
                where: { user_id, in_party: "true" }
            });
            for (const fighter of userFighters) {
                if (!firstSetted) {
                    fighter.active = "true";
                    firstSetted = true;
                    await fighter.save();
                }
            }
        }
        res.send('ok')
    },
    setFirstFighter: async (req, res) => {
        const user_fighter_id = req.body[0].user_fighter_id
        const user_id = req.body[0].user_id
        const userFighters = await db.UserFighters.findAll({
            where: {
                user_id, in_party: "true"
            }
        });
        if (userFighters) {
            userFighters.forEach(async (fighter) => {
                fighter.active = "false"
                await fighter.save()
            })
        }
        const userFighter = await db.UserFighters.findOne({
            where: { user_fighter_id }
        });
        userFighter.active = "true"
        await userFighter.save()
        res.send('ok')
    },
    /* createUser: async (req, res) => {
         const newUser = await { ...req.body }
         await db.Users.create({ ...newUser })
         db.Users.findAll()
             .then((users) => {
 
                 return res.send(users)
             })
         console.log({ ...newUser })
         return res.status(200).json(newUser)
         // const newUser = await { ...req.body }
         // console.log(req.body)
         // return res.status(200).json(newUser)
 
     },*/
    userToUpdate: async (req, res) => {
        const idUserToUpdate = 9
        const userToUpdate = await db.Users.findOne({
            where: {
                user_id: idUserToUpdate
            }
        })
        if (userToUpdate) {
            return res.json(userToUpdate)
        }
        return res.send('No se encontro el usuario')
    },
    /*createFighterLevels: async (req, res) => {
        await db.FighterLevels.create({
            "name": "Ameo",
            "email": "ameo@gmail.com",
            "password": "123456",
            "avatar": "Ameo.jpg",
            "profile": "Admin",
            "money": 5000,
        })
        db.Users.findAll()
            .then((users) => {
                return res.send(users)
            })
    },*/
    updateUserConfig: async (req, res) => {
        const parameters = req.body[0]
        const bg = parameters.bg
        const sound = parameters.sound
        const sfx = parameters.sfx
        const user_id = parameters.user_id
        await db.Users.findOne()
        const updateUser = await db.Users.findOne({
            where: { user_id }
        });
        await db.Users.update({ ...updateUser, bg_volume: bg, sfx_volume: sfx, sound_volume: sound }, { where: { user_id } })
        res.send('ok')
    }
}

module.exports = apiControllers