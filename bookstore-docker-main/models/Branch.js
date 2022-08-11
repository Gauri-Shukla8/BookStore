const {  getConnection }  = require('../utils')
const uniqid = require('uniqid')
const Book = require('../models/Book')

class Branch {

    constructor(branchInput){
        this.branchid = branchInput.branchid || uniqid('br')
        this.branchname = branchInput.branchname
        this.branchdetails = branchInput.branchdetails
        this.classes = branchInput.classes || "bullseye"
        this.colour = branchInput.colour || "tomato"
    }


    static findByName(branchname){

         return new Promise( (resolve, reject) => {

            getConnection().then( conn => {

                const sqlQuery = `SELECT * FROM Branches WHERE branchname='${branchname}'`
                conn.query(sqlQuery, (err, results, fields) => {
                    if(err)
                        reject(err)

                    if(results && results.length > 0)
                        return resolve(new Branch({...results[0]}))
                    resolve(null)
                })
                conn.end()
            }).catch(err => reject(err))
        })
    }



    static findById(branchid){

        return new Promise( (resolve, reject) => {

            getConnection().then( conn => {

                const sqlQuery = `SELECT * FROM Branches WHERE branchid='${branchid}'`
                conn.query(sqlQuery, (err, results, fields) => {
                    if(err)
                        reject(err)

                    if(results && results.length > 0)
                        return resolve(new Branch({...results[0]}))
                    resolve(null)
                })
                conn.end()
            }).catch(err => reject(err))
        })
    }


    static findAll(){

        return new Promise((resolve, reject) => {

            getConnection().then( conn => {

                const branchQuery = "SELECT * FROM Branches"
                conn.query(branchQuery, (err, results, fields) => {
                    if(err)
                        reject(err)
                    if(results && results.length > 0){
                        const transformedResults  = results.map((branch) => {
                            return new Branch({...branch})
                        })
                        resolve(transformedResults)
                    }
                    resolve([])
                })
                conn.end()    
            }).catch(err => reject(err))
        })
    }


    static deleteOne(branchid){

        const  branchQuery = `DELETE FROM Branches WHERE branchid='${branchid}'`
        return new Promise( (resolve, reject) => {
            getConnection().then( conn => {

                conn.query(branchQuery, (err, result) => {
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

                    const values = `('${this.branchid}',
                                     '${this.branchname}',
                                     '${this.branchdetails}',
                                     '${this.classes}',
                                     '${this.colour}')`

                    const query = `INSERT INTO Branches (branchid,branchname, branchdetails, classes, colour) values `+values
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


module.exports = Branch