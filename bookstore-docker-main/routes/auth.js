var express = require('express')
var router = express.Router()

const authController = require('../controllers/authController')


router.post('/signup',authController.signUpUser)

router.post('/login',authController.loginUser)



module.exports = router