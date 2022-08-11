const { getConnection } = require('../utils')
const uniqid = require('uniqid')

class Chat {
  constructor(chatInput) {
    this.chatid = chatInput.chatid || uniqid('chat')
    this.bookid = chatInput.bookid
    this.userid = chatInput.userid
    this.sellerid = chatInput.sellerid
    this.message = chatInput.message
    this.sentby = chatInput.sentby
    this.timestamp =
      chatInput.timestamp ||
      new Date().toISOString().slice(0, 19).replace('T', ' ')
  }

  static findById(chatid) {
    return new Promise((resolve, reject) => {
      getConnection()
        .then((conn) => {
          const sqlQuery = `SELECT * FROM Chats WHERE chatid='${chatid}'`
          conn.query(sqlQuery, (err, results, fields) => {
            if (err) reject(err)

            if (results && results.length > 0)
              return resolve(new Chat({ ...results[0] }))
            resolve(null)
          })
          conn.end()
        })
        .catch((err) => reject(err))
    })
  }

  static findAll({ bookid, sellerid, userid, order = 'ASC', table = '*' }) {
    let query = 'SELECT '
    query += table
    query += ' FROM Chats'

    query = query + ` WHERE bookid='${bookid}'`

    if (sellerid) {
      query = query + ` AND  sellerid='${sellerid}'`
    }

    if (userid) {
      query = query + ` AND userid='${userid}'`
    }

    query = query + ` ORDER BY timestamp ${order}`

    console.log(query)

    return new Promise((resolve, reject) => {
      getConnection()
        .then((conn) => {
          conn.query(query, (err, results, fields) => {
            if (err) reject(err)
            if (results && results.length > 0) {
              const transformedResults = results.map((chat) => {
                // console.log(chat)
                if (table === '*') return new Chat({ ...chat })
                return chat[table]
              })
              return resolve(Array.from(new Set(transformedResults)))
            }
            resolve([])
          })
          conn.end()
        })
        .catch((err) => reject(err))
    })
  }

  static deleteOne(chatid) {
    const sqlQuery = `DELETE FROM Chats WHERE chatid='${chatid}'`

    return new Promise((resolve, reject) => {
      getConnection()
        .then((conn) => {
          conn.query(sqlQuery, (err, result) => {
            if (err) reject(err)
            resolve(result.affectedRows)
          })
          conn.end()
        })
        .catch((err) => reject(err))
    })
  }

  save() {
    // Connect to database and save details
    return new Promise((resolve, reject) => {
      getConnection()
        .then((conn) => {
          let values = `('${this.chatid}',
                                    '${this.bookid}',
                                     '${this.userid}',
                                     '${this.sellerid}',
                                     '${this.message}',
                                     '${this.sentby}',
                                     '${this.timestamp}')`

          let query =
            `INSERT INTO Chats (chatid,bookid,userid,sellerid,message,sentby,timestamp) values ` +
            values

          conn.query(query, (err) => {
            if (err) reject(err)
            resolve(this)
          })
          conn.end()
        })
        .catch((err) => reject(err))
    })
  }
}

module.exports = Chat
