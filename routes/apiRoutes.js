const express = require('express')
const router = express.Router()
const apiControllers = require('../controllers/apiControllers')

router.get('/allusers', apiControllers.getAllUsers)
router.get('/allfighters', apiControllers.getAllFighters)
router.get('/alluserfighters', apiControllers.getAllUserFighters)

module.exports = router