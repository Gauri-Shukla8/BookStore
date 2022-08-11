const { getConnection } = require('../utils')
const uniqid = require('uniqid')

class RequestBook {

    constructor(requestInput){
        this.requestid = requestInput.requestid || uniqid('reqbook')
        this.isbn = requestInput.isbn
        this.title = requestInput.title
        this.price = requestInput.price
        this.description = requestInput.description
        this.image = requestInput.image || "default.jpg"
        this.author = requestInput.author
        this.sellerid = requestInput.sellerid
    }


    static findById(requestid){

        return new Promise( (resolve, reject) => {

            getConnection().then( conn => {

                const sqlQuery = `SELECT * FROM RequestBooks WHERE requestid='${requestid}'`
                conn.query(sqlQuery, (err, results, fields) => {
                    if(err)
                        reject(err)

                    if(results && results.length > 0)
                        return resolve(new RequestBook({...results[0]}))
                    resolve(null)
                })
                conn.end()
            }).catch(err => reject(err))
        })
    }


    static findAll(){

        let query = "SELECT * FROM RequestBooks"

         return new Promise((resolve, reject) => {

            getConnection().then( conn => {

                conn.query(query, (err, results, fields) => {
                    if(err)
                        reject(err)
                    if(results && results.length > 0){
                        const transformedResults  = results.map((book) => {
                            return new RequestBook({...book})
                        })
                        resolve(transformedResults)
                    }
                    resolve([])
                })
                conn.end()    
            }).catch(err => reject(err))
        })
    }


    static deleteOne(requestid){

        return new Promise( (resolve, reject) => {

            getConnection().then( conn => {

                const sqlQuery = `DELETE FROM RequestBooks WHERE requestid='${requestid}'`
                conn.query(sqlQuery, (err, results) => {
                    if(err)
                        reject(err)
                    resolve(results.affectedRows)
                })
                conn.end()
            }).catch(err => reject(err))
        })
    }


    save(){

        // Connect to database and save details
        return new Promise((resolve, reject) => {

            getConnection().then( conn => {

                    let values = `('${this.requestid}',
                                    '${this.isbn}',
                                     '${this.title}',
                                     '${this.description}',
                                     '${this.image}',
                                     '${this.price}',
                                     '${this.author}',
                                     '${this.sellerid}')`

                    let query = `INSERT INTO RequestBooks (requestid,isbn,title,description,image,price,author,sellerid) values `+values
                                    
                    conn.query(query, (err) => {
                        if(err)
                            reject(err)
                        resolve(this)
                    })
                    conn.end()
                }).catch(err => reject(err))
        })
    }
}


module.exports = RequestBook