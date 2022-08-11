const express = require('express')
const router = express.Router()

const chatController = require('../controllers/chatController')

router.post('/messages', chatController.getMessages)

router.post('/users', chatController.getChatUsers)

module.exports = router
