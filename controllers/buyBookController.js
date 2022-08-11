const Branch = require('../models/Branch')
const Book = require('../models/Book')
const Cart = require('../models/Cart')


exports.getBranches = (req,res, next) => {

    Branch.findAll().then( branches => {
        res.status(200).json(branches)
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500
        }
      next(err)
    })
}



exports.getBranch = (req,res,next) => {

    const branchId = req.params.branchId
    Branch.findById(branchId).then( branch => {
        res.status(200).json(branch)
    }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })
}


exports.getBooksByBranch = (req, res, next) => {

    const branchId = req.params.branchId
    Book.findAll(branchId).then( books => {

        const transformedBook = books.map((book) => {
            return { bookid:book.bookid , image: book.image, title:book.title }
        })
        res.status(200).json(transformedBook)

    }).catch(err => {
        err.statusCode = 500
        next(err)
    }) 
}


exports.getBook = (req, res, next) => {

    const bookid = req.params.bookId
    const userid = req.userId
    let book = null
    Book.findById(bookid).then( loadedbook => {
        if(loadedbook){
            book = loadedbook
            return Cart.findById(userid,bookid)
        }
        return res.status(200).json({})
    }).then((cartItem) => {
        console.log(cartItem)
        if(cartItem)
            return res.status(200).json({...book, inCart:true })        
        res.status(200).json({...book, inCart:false})
    })
    .catch(err => {
        err.statusCode = 500
        next(err)
    })
}
