const RequestBook = require('../models/RequestBook')


exports.sellBook = (req, res, next) => {
    
    let imageUrl = "default.jpg"
    if(req.file){
        imageUrl = req.file.path
        imageUrl = imageUrl.substring(7)
    }
    
    const requestBook = new RequestBook({
        
        title:req.body.title,
        description:req.body.description,
        isbn:req.body.isbn,
        author:req.body.author,
        price:req.body.price,
        image:imageUrl,
        sellerid:req.body.sellerid
    })

    requestBook.save().then((book) => {
        res.status(200).json(book)
    }).catch((err) => {
        err.statusCode = 500
        next(err)
    })
}




