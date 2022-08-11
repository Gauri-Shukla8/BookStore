const { getConnection } = require('../utils')
const uniqid = require('uniqid')

class Book {

    constructor(bookInput){
        this.bookid = bookInput.bookid || uniqid('book')
        this.isbn = bookInput.isbn
        this.title = bookInput.title
        this.price = bookInput.price
        this.description = bookInput.description
        this.image = bookInput.image || "default.jpg"
        this.author = bookInput.author
        this.branchid = bookInput.branchid
        this.sellerid = bookInput.sellerid
    }


    static findById(bookid){

        return new Promise( (resolve, reject) => {

            getConnection().then( conn => {

                const sqlQuery = `SELECT * FROM Books WHERE bookid='${bookid}'`
                conn.query(sqlQuery, (err, results, fields) => {
                    if(err)
                        reject(err)

                    if(results && results.length > 0)
                        return resolve(new Book({...results[0]}))
                    resolve(null)
                })
                conn.end()
            }).catch(err => reject(err))
        })
    }


    static findAll(branchid){

        let query = "SELECT * FROM Books"

        if(branchid)
            query = query+` WHERE branchid='${branchid}'`

         return new Promise((resolve, reject) => {

            getConnection().then( conn => {

                conn.query(query, (err, results, fields) => {
                    if(err)
                        reject(err)
                    if(results && results.length > 0){
                        const transformedResults  = results.map((book) => {
                            return new Book({...book})
                        })
                        resolve(transformedResults)
                    }
                    resolve([])
                })
                conn.end()    
            }).catch(err => reject(err))
        })
    }


    static deleteOne(bookid){

        const sqlQuery = `DELETE FROM Books WHERE bookid='${bookid}'`

        return new Promise( (resolve, reject) => {
            getConnection().then( conn => {

                conn.query(sqlQuery, (err, result) => {
                    if(err)
                        reject(err)
                    resolve(result.affectedRows)
                })
                conn.end()
            }).catch(err => reject(err))
        })   
    }


    save(){

        // Connect to database and save details
        return new Promise((resolve, reject) => {

            getConnection().then( conn => {

                    let values = `('${this.bookid}',
                                    '${this.isbn}',
                                     '${this.title}',
                                     '${this.description}',
                                     '${this.image}',
                                     '${this.price}',
                                     '${this.author}',
                                     '${this.branchid}',
                                     '${this.sellerid}')`

                    let query = `INSERT INTO Books (bookid,isbn,title,description,image,price,author,branchid,sellerid) values `+values
                                    
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


module.exports = Book