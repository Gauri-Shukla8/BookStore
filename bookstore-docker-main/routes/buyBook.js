const express = require('express')
const router = express.Router()

const buyBookController = require('../controllers/buyBookController')


router.get('/books/:branchId', buyBookController.getBooksByBranch)

router.get('/bookdetails/:bookId',buyBookController.getBook)

router.get('/branches/:branchId',buyBookController.getBranch)

router.get('/branches',buyBookController.getBranches)

module.exports = router
