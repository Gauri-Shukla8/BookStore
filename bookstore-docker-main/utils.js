const mysql = require('mysql')
const fs = require('fs')
const path = require('path')
const uniqid = require('uniqid')

// Bootstrap
function database_bootstrap() {
  const createAdminTable = `CREATE TABLE IF NOT EXISTS Admins (
                                    userid VARCHAR(30) PRIMARY KEY )`

  const createUserTable = `CREATE TABLE IF NOT EXISTS Users (
                                    userid VARCHAR(30) PRIMARY KEY,
                                    firstname VARCHAR(50),
                                    lastname VARCHAR(50),
                                    email VARCHAR(50),
                                    password TEXT(257))`

  const createBranchTable = `CREATE TABLE IF NOT EXISTS Branches(
                                  branchid VARCHAR(30) PRIMARY KEY,
                                  branchname VARCHAR(20),
                                  branchdetails VARCHAR(255),
                                  classes VARCHAR(20),
                                  colour VARCHAR(10))`

  const createBookTable = `CREATE TABLE IF NOT EXISTS Books(
                                    bookid VARCHAR(30) PRIMARY KEY,
                                    isbn VARCHAR(30),
                                    title VARCHAR(30),
                                    description VARCHAR(100),
                                    image VARCHAR(50),
                                    price FLOAT(6,2),
                                    author VARCHAR(30),
                                    branchid VARCHAR(30),
                                    sellerid VARCHAR(30))`

  const createRequestBookTable = `CREATE TABLE IF NOT EXISTS RequestBooks(
                                    requestid VARCHAR(30) PRIMARY KEY,
                                    isbn VARCHAR(30),
                                    title VARCHAR(30),
                                    description VARCHAR(100),
                                    image VARCHAR(50),
                                    price FLOAT(6,2),
                                    author VARCHAR(30),
                                    sellerid VARCHAR(30))`

  const createChatTable = `CREATE TABLE IF NOT EXISTS Chats(
                                        chatid VARCHAR(30) PRIMARY KEY,
                                        bookid VARCHAR(30),
                                        userid VARCHAR(30),
                                        sellerid VARCHAR(30),
                                        message VARCHAR(100),
                                        sentby VARCHAR(30),
                                        timestamp DATETIME)`

  const createCartTable = `CREATE TABLE IF NOT EXISTS Carts(
                                    userid VARCHAR(30),
                                    bookid VARCHAR(30))`

  return new Promise((resolve, reject) => {
    getConnection().then((conn) => {
      conn.beginTransaction((err) => {
        if (err) reject(err)
        // Create the Users table
        conn.query(createUserTable, (err) => {
          if (err) conn.rollback(() => reject(err))
          console.log('Table: Users ')

          conn.query(createChatTable, (err) => {
            if (err) conn.rollback(() => reject(err))
            console.log('Table: Chats ')

            conn.query(createBranchTable, (err) => {
              if (err) conn.rollback(() => reject(err))
              console.log('Table: Branches ')

              conn.query(createBookTable, (err) => {
                if (err) conn.rollback(() => reject(err))
                console.log('Table: Books')

                conn.query(createCartTable, (err) => {
                  if (err) conn.rollback(() => reject(err))
                  console.log('Table: Carts')

                  conn.query(createRequestBookTable, (err) => {
                    if (err) conn.rollback(() => reject(err))

                    console.log('Table: RequestBooks')

                    conn.query(createAdminTable, (err) => {
                      if (err) conn.rollback(() => reject(err))
                      console.log('Table: Admin')
                      conn.commit((err) => {
                        if (err) conn.rollback(() => reject(err))
                        console.log('All Done!')
                        conn.end()
                        resolve('Success')
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })
}

// Get the connection Object
function getConnection() {
  return new Promise((resolve, reject) => {
    const conn = mysql.createConnection({
      insecureAuth:true,
      host: process.env.HOST_NAME,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE || 'bookstore',
    })

    conn.connect(function (err) {
      if (err) reject(err)
      console.log('Connection Started ', conn.threadId)
      resolve(conn)
    })
  })
}

function createDatabase(dbname) {
  return new Promise((resolve, reject) => {
    const conn = mysql.createConnection({
      insecureAuth:true,
      host: process.env.HOST_NAME,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
    })

    conn.connect(function (err) {
      if (err) reject(err)
      conn.query(
        'CREATE DATABASE IF NOT EXISTS ' + dbname,
        function (err, result) {
          if (err) reject(err)
          resolve(dbname)
        }
      )
      conn.end()
    })
  })
}

function deleteImage(imageName) {
  return new Promise((resolve, reject) => {
    if (imageName === 'default.jpg') return resolve(imageName)
    const imgPath = path.join(__dirname, 'images', imageName)
    fs.unlink(imgPath, (err) => {
      if (err) reject(err)
      resolve(imgPath)
    })
  })
}

function deleteBranchTrigger() {
  return new Promise((resolve, reject) => {
    const dropTrigg = `drop trigger if exists delete_branch`

    const query = `create trigger delete_branch
                       before delete
                       on Branches 
                       for each row 
                       begin 
                            delete from Carts where bookid in (select bookid from Books where branchid=OLD.branchid); 
                            delete from Books where branchid=OLD.branchid; 
                       end;`

    getConnection().then((conn) => {
      conn.query(dropTrigg, (err) => {
        if (err) reject(err)
        conn.query(query, (err) => {
          if (err) reject(err)
          console.log('Trigger Installed : delete_branch')
          resolve(true)
        })
        conn.end()
      })
    })
  })
}

function createAdminProcedure(adminData) {
  //const adminid = adminData.adminid || uniqid('user-')
  //const fName = adminData.firstname || process.env.ADMIN_FIRSTNAME
  //const lName = adminData.lastname || process.env.ADMIN_LASTNAME
  //const email = adminData.email || process.env.ADMIN_EMAIL
  //const password = adminData.password || process.env.ADMIN_PASSWORD

  return new Promise((resolve, reject) => {
    const query = `create procedure CREATE_ADMIN(
                        adminid varchar(30), 
                        fname varchar(50), 
                        lname varchar(50), 
                        email varchar(50), 
                        passwd text)
                        begin
                        insert into Users(userid, firstname, lastname, email, password) values
                        (adminid, fname, lname, email, passwd);
                        insert into Admins(userid) values(adminid);
                        end;`

    const delQuery = `drop procedure if exists CREATE_ADMIN`

    getConnection().then((conn) => {
      conn.query(delQuery, (err) => {
        if (err) reject(err)

        conn.query(query, (err) => {
          if (err) reject(err)
          console.log('Procedure Added : CREATE_ADMIN_PROCEDURE')
          resolve(true)
        })
        conn.end()
      })
    })
  })
}

function createAdmin(hashedPassword) {
  return new Promise((resolve, reject) => {
    const findAdmin = `Select userid from Users where email='${process.env.ADMIN_EMAIL}'`
    const id = uniqid('user-')
    const createAdmin = `CALL CREATE_ADMIN(
        '${id}',
        '${process.env.ADMIN_FIRSTNAME}',
        '${process.env.ADMIN_LASTNAME}',
        '${process.env.ADMIN_EMAIL}',
        '${hashedPassword}')`

    getConnection().then((conn) => {
      conn.query(findAdmin, (err, results) => {
        if (err) reject(err)
        if (results && results.length > 0) return resolve('Admin Exists')

        conn.query(createAdmin, (err) => {
          if (err) reject(err)
          resolve(id)
        })
        conn.end()
      })
    })
  })
}

module.exports = {
  getConnection,
  database_bootstrap,
  deleteImage,
  createDatabase,
  deleteBranchTrigger,
  createAdminProcedure,
  createAdmin,
}
