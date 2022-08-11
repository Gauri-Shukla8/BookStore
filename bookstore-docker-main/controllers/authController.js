const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.signUpUser = async(req, res, next) => {

  const email = req.body.email
  const firstname = req.body.firstname
  const lastname = req.body.lastname
  const password = req.body.password

 let loadedUser = null

    try{
        loadedUser = await User.findByEmail(email)
    }catch(err){
        console.log(err)
        return next(err)
    }
    
  bcrypt
    .hash(password, 12)
    .then(hashedPw => {
        
        // Save to database
        console.log(email,firstname,lastname,password)
        const user =  new User({
            firstname:firstname,
            lastname:lastname,
            email:email,
            password:hashedPw
        })
        return user.save()
    })
    .then(result => {
      console.log(result)
      res.status(201).json({ message: 'User created!', userId: result.userid })
    })
    .catch(err => {
      console.log(err)
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}


exports.loginUser = async(req, res, next) => {
  const email = req.body.email
  const password = req.body.password
 
    let loadedUser = null

    try{
        loadedUser = await User.findByEmail(email)
    }catch(err){
        console.log(err)
        return next(err)
    }
    
    if(!loadedUser)
        return next(new Error('User does not exists'))

    bcrypt.compare(password, loadedUser.password)
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Wrong password!')
        error.statusCode = 401
        throw error
      }

      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser.userid
        },
        'somesupersecretsecret',
        { expiresIn: '1h' }
      )
      
      res.status(200).json({ token: token, userid: loadedUser.userid, firstname:loadedUser.firstname})
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}