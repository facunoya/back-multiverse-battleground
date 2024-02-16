const db = require("../database/models")
const { Op } = require("sequelize")
const { jwtDecode } = require("jwt-decode")


const managementControllers = {
    getAllUsers: async (req, res) => {
        const query = `
        SELECT * FROM users;
      `
        const result = await db.sequelize.query(query, {
            type: db.sequelize.QueryTypes.SELECT,
        })

        res.json(result)
    },
    getOneUser: async (req, res) => {
        const id = 7
        const query = `
        SELECT * FROM users WHERE users.user_id = ${id};
      `
        try {
            const result = await db.sequelize.query(query, {
                type: db.sequelize.QueryTypes.SELECT,
            })
            if (result.length > 0) {

                return res.status(200).json(result)
            }
            return res.status(404).send('No se encontro el usuario')
        }
        catch (error) {
            console.log('Error: ', error)
            return res.status(500).json({ error: 'Internal server error' })
        }
    },
    modifyUser: async (req, res) => {
        try {
            const user = await managementControllers.getOneUser(req, res)
            await user
            return user
        } catch (error) {
            console.log('Error: ', error)
            return res.status(500).json({ error: 'Internal server error' })
        }

    }
}

module.exports = managementControllers