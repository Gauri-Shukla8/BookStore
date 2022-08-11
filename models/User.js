const { getConnection } = require('../utils')
const uniqid = require('uniqid')

class User {

    constructor(userInput){
        this.userid = userInput.userid ? userInput.userid :  uniqid('user-')
        this.firstname = userInput.firstname
        this.lastname = userInput.lastname
        this.email = userInput.email
        this.password = userInput.password
    }


    // Find a user by userid
    static findById(userid){

        return new Promise( (resolve, reject) => {

            getConnection().then( conn => {

                const sqlQuery = `SELECT * FROM Users WHERE userid='${userid}'`
                conn.query(sqlQuery, (err, results, fields) => {
                    if(err)
                        reject(err)

                    if(results && results.length > 0)
                        return resolve(new User({...results[0]}))
                    resolve(null)
                })
                conn.end()
            }).catch(err => reject(err))
        })
    }

    // Find a user by email
    static findByEmail(email){
                
        return new Promise((resolve, reject) => {

            getConnection().then(conn => {

                const sqlQuery = `SELECT * FROM Users WHERE email='${email}'`
                conn.query(sqlQuery, (err, results, fields) => {

                    if(err)
                        return reject(err)

                    if(results && results.length > 0)
                        return resolve(new User({...results[0]}))
                    resolve(null)
                })
                conn.end()
            }).catch(err => reject(err))
        })
    }

   save(){
        // Connect to database and save details
        //console.log(this.firstName, this.lastname, this.email, this.password)
        return new Promise((resolve, reject) => {

            getConnection().then( conn => {

                    const values = `('${this.userid}','${this.firstname}','${this.lastname}', '${this.email}', '${this.password}')`
                    const createUserQuery = "INSERT INTO Users (userid,firstname, lastname, email, password) values "+values
                    
                    conn.query(createUserQuery, (err) => {
                        if(err)
                            reject(err)
                        resolve(this)
                    })
                    conn.end()
                }).catch(err => reject(err))
        })
    }
}

module.exports = User