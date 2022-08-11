const Admin = require('../models/Admin')
const Book = require('../models/Book')
const Branch = require('../models/Branch')
const User = require('../models/User')
const Cart = require('../models/Cart')
const RequestBook = require('../models/RequestBook')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { deleteImage } = require('../utils')


// LOGIN
exports.login = async(req, res, next) => {

    const email = req.body.email
    const password = req.body.password
    let admin = null
    try{
         admin = await Admin.find(email)
    }catch(err){
        return next(err)
    }

    console.log(admin)

    if(!admin)
       return next(new Error('Admin does not exists'))

    bcrypt.compare(password, admin.password)
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Wrong password!')
        error.statusCode = 401
        throw error
      }

      const token = jwt.sign(
        {
          email: admin.email,
          userId: admin.userid,
          isAdmin:true
        },
        'somesupersecretsecret',
        { expiresIn: '1h' }
      )
      res.status(200).json({ token: token, userid: admin.userid, firstname:admin.firstname, isAdmin:true})
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}


/***************************************************************************************/


// Add Branch
exports.addBranch = (req, res, next) => {

    console.log(req.body)
    const { branchname, branchdetails, colour, classes} =  req.body
  
    Branch.findByName(branchname).then((branch) => {
        if(branch)
            return next(new Error('Branch already exists'))
        
        const newBranch = new Branch({
            branchname,
            branchdetails,
            colour,
            classes
        })
        return newBranch.save()
    }).then((branch) => {
        res.status(200).json(branch)
    }).catch(err => {
        err.statusCode = 500
        next(err)
    })
}


// Delete Branch
/*exports.deleteBranch = async(req, res, next) => {

    const branchid = req.params.branchId
    try{
        const books = await Book.findAll(branchid)
        if(books.length > 0){

            const taskDeleteCart = books.map((book) => {
                return Cart.deleteOne(null,book.bookid)
            })
            await Promise.all(taskDeleteCart)

            const taskDeleteBookImages = books.map((book) => {
                return deleteImage(book.image)
            })
            await Promise.all(taskDeleteBookImages)

            const taskDeleteBooks = books.map((book) => {
                return Book.deleteOne(book.bookid)
            })
            await Promise.all(taskDeleteBooks)
        }
        await Branch.deleteOne(branchid)
        res.status(200).json({branchid:branchid})
    }catch(err){
        err.statusCode = 500
        next(err)
    }
}*/

// With Trigger
exports.deleteBranch = (req, res, next) => {

    const branchid = req.params.branchId
    Branch.deleteOne(branchid).then(_ => {
        res.status(200).json({branchid: branchid})
    })
    .catch(err => {
        err.statusCode = 500
        next(err)
    })
}



/***************************************************************************************/

// Add Book
exports.addBook = (req,res, next) => {

    const {title, isbn, author, description, price, branchid, sellerid } = req.body
    
    console.log(branchid)

    let imageUrl = "default.jpg"
    if(req.file){
        imageUrl = req.file.path
        imageUrl = imageUrl.substring(7)
    }
    console.log(imageUrl)

    const newBook = new Book({
        title, isbn, author, description, price, branchid, image:imageUrl, sellerid
    })

    newBook.save().then((book) => {
        res.status(200).json(book)
    }).catch((err) => {
        err.statusCode = 500
        next(err)
    })
}


exports.removeBook = (req, res, next) =>{

    const bookid = req.params.bookId
    Cart.deleteOne(null, bookid).then(_ => {
       return Book.findById(bookid) 
    })
    .then(book => {
        return deleteImage(book.image)
    })
    .then( _ => {
        return Book.deleteOne(bookid)
    })
    .then(_ => {
         res.status(200).json({success:true, rows:_})
    })
    .catch(err =>{
        err.statusCode = 500
        next(err)
    })

}


/***************************************************************************************/


exports.getRequests = (req, res, next) => {

    RequestBook.findAll().then(requests => {
        console.log(requests)
        let tranformedReq = requests.map((request) => {
            console.log(request.sellerid)
            return User.findById(request.sellerid).then(user =>{
                return {
                    title:request.title,
                    seller:user.firstname,
                    requestid:request.requestid,
                }
            })
        })
        Promise.all(tranformedReq).then( requests => {
            console.log(requests)
            res.status(200).json(requests)
        }).catch(err => {
            err.statusCode = 500
            next(err)
        })
    }).catch(err => {
        err.statusCode = 500
        next(err)
    }) 
}



exports.getRequest = (req, res, next) => {

    const requestid = req.params.requestId
    console.log(requestid)

    RequestBook.findById(requestid).then(request => {
        console.log(request)
        if(!request){
            return res.status(200).json(request)
        }
        console.log(request)
        res.status(200).json(request)
    }).catch(err => {
        err.statusCode = 500
        next(err)
    }) 
}


exports.approveRequest = (req, res, next) => {

    const {branchid, requestid} = req.body 

    let createdBook = null
    RequestBook.findById(requestid).then(request =>{
        if(!request)
            return res.status(200).json(request)

        const newBook = new Book({
            ...request,
            branchid:branchid
        })    
        return newBook.save()
    })
    .then((book) => {
        createdBook = book
        return RequestBook.deleteOne(requestid)
    })
    .then(_ => {
        res.status(200).json(createdBook)
    })
    .catch(err => {
        err.statusCode = 500
        next(err)
    })
}


exports.declineRequest = (req,res,next) => {

    const requestid = req.params.requestId
      console.log(requestid)

    RequestBook.findById(requestid).then(request => {
        return deleteImage(request.image)
    })
    .then(_ => {
        return  RequestBook.deleteOne(requestid)
    })
    .then((rows) => {
        res.status(200).json({deleted:true, rows:rows, requestid:requestid})
    }).catch(err => {
        err.statusCode = 500
        next(err)
    })
}

/***************************************************************************************/
