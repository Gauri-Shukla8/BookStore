const { getConnection }   = require('../utils')
const User = require('../models/User')


class Admin {

    static find(email){

        return new Promise( (resolve, reject) => {

            User.findByEmail(email).then((user) =>{ 

                if(!user)
                    return resolve(null)

                const userId = user.userid
                getConnection().then( conn => {

                    const sqlQuery = `SELECT * FROM Admins WHERE userid='${userId}'`
                    conn.query(sqlQuery, (err, results, fields) => {
                        if(err)
                            reject(err)

                        if(results && results.length > 0)
                            return resolve(user)
                        resolve(null)
                    })
                    conn.end()
                }).catch(err => reject(err))
            })
        })
    }
}

module.exports = Admin