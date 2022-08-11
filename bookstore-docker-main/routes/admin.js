var express = require('express')
var router = express.Router()

const adminController = require('../controllers/adminController')
const adminAuth = require('../middlewares/is-admin-auth')


router.post('/login',adminController.login)

// Branch

// 2. Delete Branch
router.delete('/branch/:branchId',adminAuth, adminController.deleteBranch)


// 1. Add Branch
router.post('/branch',adminController.addBranch)


// Remove Book
router.delete('/book/:bookId',adminAuth, adminController.removeBook)

// 3. Add Book
router.post('/book',adminAuth, adminController.addBook)


// Requests
router.post('/requests/approve/',adminAuth, adminController.approveRequest)

router.delete('/requests/decline/:requestId',adminAuth, adminController.declineRequest)

router.get('/requests/:requestId',adminAuth,adminController.getRequest)

router.get('/requests',adminAuth, adminController.getRequests)




module.exports = router