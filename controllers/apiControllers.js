const fs = require('fs');
const path = require('path');
const db = require('../database/models')
const sequelize = db.sequelize
const { Op, Sequelize } = require('sequelize')


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
    getAllObjects: async (req, res) => {
        await db.Objects.findAll()
            .then((objects) => {
                return res.send(objects)
            })
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
                                model: db.Moves,
                                as: 'moves',
                                where: {
                                    move_id: db.Sequelize.col('UserFighterMoves.move_id'),
                                },
                                include: [{ model: db.MoveActions, as: "actionmoves", where: { move_id: db.Sequelize.col('UserFighterMoves.move_id') } }]
                            },
                        ],
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
        const object = await db.Objects.findOne({ where: { object_id } })
        const userMoney = await db.UserObjects.findOne({
            where: { object_id: 7 } //7 es Money
        });
        if (userMoney.quantity > object.price) {
            userMoney.quantity -= object.price //poner el precio del objeto comprado
            await userMoney.save();
            const userObject = await db.UserObjects.findOne({
                where: { user_id, object_id },
            });
            /*falta ver si en esta funcion restamos la plata tabmién o si se hace por otro lado*/
            if (userObject) {
                // Si existe, actualizar la cantidad
                userObject.quantity += 1;
                await userObject.save(); // Guardar los cambios en la base de datos
            } else {
                // Si no existe, crear un nuevo UserObject
                await db.UserObjects.create({
                    object_id,
                    user_id,
                    quantity: 1,
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
            where: { object_id: 7 } //7 es Money
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
                current_xp: 0,
                level: 1
            });
            /* le asigno movimientos en userfightermoves */
            const user_fighter_id = newUserFighter.user_fighter_id
            const fighterMoves = await db.Moves.findAll({ where: { fighter_id } })
            for (const move of fighterMoves) {
                await db.UserFighterMoves.create({
                    move_id: move.move_id,
                    level: 1,
                    current_xp: 1,
                    user_fighter_id
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
        const userFighter = await db.UserFighters.findOne({
            where: { user_fighter_id: newFighter.user_fighter_id }
        });
        userFighter.level = newFighter.level
        userFighter.current_xp = newFighter.current_xp
        userFighter.save()
        return res.send("ok")
    },
    updateUserMoney: async (req, res) => {
        const quantity = req.body[0].quantity
        const user_id = req.body[0].user_id
        const userObjects = await db.UserObjects.findOne({
            where: { user_id, object_id: 7 } //7 es Money
        });
        userObjects.quantity += quantity
        userObjects.save()
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
        const userFighter = await db.UserFighters.findOne({
            where: { user_fighter_id }
        });
        userFighter.active = "true"
        await userFighter.save()
        const userFighters = await db.UserFighters.findOne({
            where: {
                user_id, in_party: "true", user_fighter_id: {
                    [db.Sequelize.Op.ne]: user_fighter_id,
                }
            }
        });
        if (userFighters) {
            userFighters.active = "false"
            await userFighters.save()
        }
        res.send('ok')
    },
    createUser: async (req, res) => {
        await db.Users.create({
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
    }
}

module.exports = apiControllers