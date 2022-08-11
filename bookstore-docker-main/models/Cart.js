const { getConnection } = require('../utils')

class Cart {

    constructor(cartInput){
        this.bookid = cartInput.bookid
        this.userid = cartInput.userid
        this.cartid = this.userid+this.bookid
    }


    static findById(userid, bookid){

        return new Promise( (resolve, reject) => {

            getConnection().then( conn => {

                const sqlQuery = `SELECT * FROM Carts WHERE userid='${userid}' AND bookid='${bookid}'`
                conn.query(sqlQuery, (err, results, fields) => {
                    if(err)
                        reject(err)
                    if(results && results.length > 0)
                        return resolve(new Cart({...results[0]}))
                    resolve(null)
                })
                conn.end()
            }).catch(err => reject(err))
        })   
    }



    static findAll(filter){

        const key = Object.keys(filter)[0]
        console.log(key)

        return new Promise( (resolve, reject) => {

            getConnection().then( conn => {

                const sqlQuery = `SELECT * FROM Carts WHERE ${key}='${filter[key]}'`
                console.log(sqlQuery)
                conn.query(sqlQuery, (err, results, fields) => {
                    if(err)
                        reject(err)
                    if(results && results.length > 0){
                        const transformedResults  = results.map((cartItems) => {
                            return new Cart({...cartItems})
                        })
                        resolve(transformedResults)
                    }
                    resolve([])
                })
                conn.end()
            }).catch(err => reject(err))
        })        
    }


    static deleteOne(userid,bookid){


        let sqlQuery = `DELETE FROM Carts WHERE userid='${userid}' AND bookid='${bookid}'`
        if(!userid)
            sqlQuery = `DELETE FROM Carts WHERE bookid='${bookid}'`

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

        return new Promise((resolve, reject) => {

            getConnection().then( conn => {

                    const values = `('${this.userid}','${this.bookid}')`

                    const query = `INSERT INTO Carts (userid, bookid) values `+values
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






module.exports = Cart