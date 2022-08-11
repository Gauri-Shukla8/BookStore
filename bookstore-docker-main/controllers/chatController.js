const Chat = require('../models/Chat')
const User = require('../models/User')

exports.getMessages = async (req, res, next) => {
  const { bookid, sellerid, userid } = req.body

  if (req.userId !== userid && req.userId !== sellerid)
    return next(new Error('Unauthenticated access'))

  const user = await User.findById(req.userId === userid ? sellerid : userid)

  Chat.findAll({ bookid, sellerid, userid })
    .then((chats) => {
      res
        .status(200)
        .json({ name: `${user.firstname} ${user.lastname}`, chats })
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}

exports.getChatUsers = (req, res, next) => {
  const { bookid, sellerid } = req.body
  if (sellerid !== req.userId) return next(new Error('Unauthenticated access'))

  Chat.findAll({ bookid, sellerid, table: 'userid' })
    .then((users) => {
      const chatUsers = users.map((userid) => {
        return new Promise((resolve, reject) => {
          User.findById(userid)
            .then((user) =>
              resolve({
                userid: userid,
                name: `${user.firstname} ${user.lastname}`,
              })
            )
            .catch((err) => reject(err))
        })
      })
      return Promise.all(chatUsers)
    })
    .then((results) => {
      res.status(200).json(results)
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}
