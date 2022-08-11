const express = require('express')
const router = express.Router()

const cartController = require('../controllers/cartController')


router.get('/', cartController.getCart)

router.post('/',cartController.addItemToCart)

router.delete('/', cartController.deleteCartItem)

module.exports = router

