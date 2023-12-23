const fs = require('fs');
const path = require('path');
const db = require('../database/models')
const sequelize = db.sequelize
const { Op } = require('sequelize')


const apiControllers = {
    getAllUsers: async (req, res) => {
        await db.Users.findAll({ include: [{ association: "userFighters" }] })
            .then((users) => {
                return res.send(users)
            })
    },
    getAllFighters: async (req, res) => {
        await db.Fighters.findAll()
            .then((fighters) => {
                return res.send(fighters)
            })
    },
    getAllUserFighters: async (req, res) => {
        await db.UserFighters.findAll({ include: [{ association: "users" }, { association: "fighters" }] })
            .then((userFighters) => {
                return res.send(userFighters)
            })
    }
}

module.exports = apiControllers