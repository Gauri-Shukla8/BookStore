const Cart = require('../models/Cart')
const Book = require('../models/Book')

exports.getCart = async(req, res, next) => {

    const userid = req.userId
    if(!userid)
        return next(new Error('Unauthenticated access'))
    try{

        const cart = await Cart.findAll({userid:userid})
        const transformedCart = await cart.map( async(cartItem) => {
            const book = await Book.findById(cartItem.bookid)
            //console.log('--')
            return {
                ...cartItem,
                title: book.title,
                price: book.price
            }
        })
         //console.log('--')
        Promise.all(transformedCart).then((data) => {
            console.log(data)
            res.status(200).json(data)
        })
    }catch(err){
        err.statusCode = 500
        next(err)
    }
}


exports.addItemToCart = (req, res, next) => {

    const userid = req.body.userid
    const bookid = req.body.bookid

    if(req.userId !== userid)
      return next(new Error('Unauthenticated access'))

    const newCart  = new Cart({
        userid:userid,
        bookid:bookid
    })

    newCart.save().then( _ => {
        res.status(200).json(newCart)
    }).catch(err => {
        err.statusCode = 500
        next(err)
    })
}



exports.deleteCartItem = (req, res, next) => {

    const userid = req.body.userid
    const bookid = req.body.bookid

    let cartItem = null
    if(userid !== req.userId)
      return next(new Error('Unauthenticated access'))
    
    Cart.findById(userid, bookid).then((cartitem) => {
        cartItem = cartitem
        return Cart.deleteOne(userid,bookid)
    }).then(( result ) => {
        res.status(200).json(cartItem)
    }).catch(err => {
        err.statusCode = 500
        next(err)
    })

}
