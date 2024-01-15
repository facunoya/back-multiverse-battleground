const db = require('../database/models')
const { Op } = require('sequelize');
const { jwtDecode } = require('jwt-decode');

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
        const user = await db.Users.findOne({
            where: { google_id: decoded.sub }
        })
        if (user) {
            console.log(user)
            return res.send(user)
        } else {
            await db.Users.create({
                email: decoded.email,
                name: decoded.name,
                google_id: decoded.sub,
                google_picture: decoded.picture,
                money: 100,
                profile: "Player",
                avatar: decoded.picture,
                password: "googleLogin"
            })
            let newUser
            await db.Users.findOne({
                where: { google_id: decoded.sub }
            })
                .then((user) => {
                    newUser = user
                })
            const newUserFighter = await db.UserFighters.create({
                fighter_id: 1,
                user_id: newUser.user_id,
                active: "true",
                in_party: "true",
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
            /* le asigno movimientos en userfightermoves */
            const user_fighter_id = newUserFighter.user_fighter_id
            const fighterMoves = await db.Moves.findAll({ where: { fighter_id: 1, min_level: 1 } })
            for (const move of fighterMoves) {
                let movelevel_id
                const moveLevels = await db.MoveLevels.findAll()
                moveLevels.forEach((moveLevel) => {
                    if (move.move_id === moveLevel.move_id && moveLevel.level === 1) {
                        movelevel_id = moveLevel.movelevel_id
                    }
                })
                await db.UserFighterMoves.create({
                    move_id: move.move_id,
                    level: 1,
                    current_xp: 1,
                    user_fighter_id,
                    movelevel_id,
                    selected: 1
                })
            }
            await db.UserObjects.create({
                object_id: 7,
                user_id: newUser.user_id,
                quantity: 150
            });
            return res.send(newUser)
        }
        /*await db.Objects.findAll()
            .then((objects) => {
                return res.send(objects)
            })*/
    },
    getAllUserFighters: async (req, res) => {
        const user_id = req.params.user_id ? req.params.user_id : null;
        // Construir la condición de búsqueda
        const whereCondition = user_id ? { user_id: user_id } : {};
        await db.UserFighters.findAll({ where: whereCondition, include: [{ association: "fighters" }] })
            .then(async (userFighters) => {
                let mappedUserFighters = userFighters.map((userFighter) => ({
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
                return res.send(mappedUserFighters)
            })
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
        await db.FighterLevels.findAll({ include: [{ association: "fighters" }] })
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
            const newUserFighter = await db.UserFighters.create({
                fighter_id,
                user_id,
                active: "false",
                in_party: "false",
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
            /* le asigno movimientos en userfightermoves */
            const user_fighter_id = newUserFighter.user_fighter_id
            const fighterMoves = await db.Moves.findAll({ where: { fighter_id, min_level: 1 } })
            for (const move of fighterMoves) {
                let movelevel_id
                const moveLevels = await db.MoveLevels.findAll()
                moveLevels.forEach((moveLevel) => {
                    if (move.move_id === moveLevel.move_id && moveLevel.level === 1) {
                        movelevel_id = moveLevel.movelevel_id
                    }
                })
                await db.UserFighterMoves.create({
                    move_id: move.move_id,
                    level: 1,
                    current_xp: 1,
                    user_fighter_id,
                    movelevel_id,
                    selected: 1
                })
            }
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
    createUser: async (req, res) => {
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

    },
    createFighterLevels: async (req, res) => {
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
    },
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