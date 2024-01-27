const express = require("express")
const router = express.Router()
const apiControllers = require("../controllers/apiControllers")

router.get("/allusers", apiControllers.getAllUsers)
router.get("/allusers/:user_id", apiControllers.getAllUsers)
router.get("/allfighters", apiControllers.getAllFighters)
router.get("/fighter/:fighter_id", apiControllers.getFighter)
router.get("/alluserfighters", apiControllers.getAllUserFighters)
router.get("/alluserfighters/:user_id", apiControllers.getAllUserFighters)
router.get("/allobjects", apiControllers.getAllObjects)
router.get("/allobjects/:object_id", apiControllers.getAllObjects)
router.get("/objectactions/:object_id", apiControllers.getObjectActions)
router.get("/alluserobjects/:user_id", apiControllers.getAllUserObjects)
router.get("/allfighterlevels/:fighter_id", apiControllers.getAllFighterLevels)
router.get("/allfighterlevels", apiControllers.getAllFighterLevels)
router.get("/allmoves", apiControllers.getAllMoves)
router.get("/moveactions/:move_id", apiControllers.getMoveActions)
router.get("/allfightermoves", apiControllers.getAllFighterMoves)
router.get(
  "/allfightersinitiallevel",
  apiControllers.getAllFightersInitialLevel
)
router.get("/moves/:fighter_id", apiControllers.getFighterMoves)
//router.get('/createfighterlevels', apiControllers.createFighterLevels)
router.get("/usertoupdate", apiControllers.userToUpdate)
router.get("/allmissions", apiControllers.getAllMisions)
router.post("/udpateuserobjectsbattle", apiControllers.upadateUserObjects) //Este tiene que ser un POST y recibir los parametros del
router.post("/login", apiControllers.userLogin)
router.post("/completemission", apiControllers.completeMission)
router.post("/buyObject", apiControllers.buyObject)
router.post("/buyFighter", apiControllers.buyFighter)
router.post("/addtoparty", apiControllers.addToParty)
router.post("/addMove", apiControllers.addMove)
router.post("/removeMove", apiControllers.removeMove)
router.post("/updatefighter", apiControllers.updateFighter)
router.post("/updateusermoney", apiControllers.updateUserMoney)
router.post("/removefromparty", apiControllers.removeFromParty)
router.post("/setfirstfighter", apiControllers.setFirstFighter)
router.post("/updateuserconfig", apiControllers.updateUserConfig)
router.post("/updatefighterconfig", apiControllers.updateFighterConfig)
router.post("/updateobjectconfig", apiControllers.updateObjectConfig)
router.post(
  "/updateobjectactionconfig",
  apiControllers.updateObjectActionConfig
)
router.post("/updatemoveactionconfig", apiControllers.updateMoveActionConfig)
router.post("/updatemove", apiControllers.updateMoveConfig)
router.get("/", (req, res) => {
  res.send("running app..")
})

//router.post('/crearuno', apiControllers.createUser)

module.exports = router
