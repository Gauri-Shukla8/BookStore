const express = require('express')
const router = express.Router()

const sellBookController = require('../controllers/sellBookController')


router.post('/',sellBookController.sellBook)

module.exports = router
