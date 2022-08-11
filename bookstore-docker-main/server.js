const express = require('express')
const path = require('path')
const bcrypt = require('bcryptjs')
const bodyParser = require('body-parser')
const socketio = require('socket.io')
const http = require('http')

const {
  database_bootstrap,
  createDatabase,
  deleteBranchTrigger,
  createAdminProcedure,
  createAdmin,
} = require('./utils')
const isAuth = require('./middlewares/is-auth')
const multer = require('multer')

require('dotenv').config({ path: __dirname + '/.env' })

// const User = require('./models/User')

const authRoutes = require('./routes/auth')
const buybookRoutes = require('./routes/buyBook')
const myCartRoutes = require('./routes/myCart')
const sellbookRoutes = require('./routes/sellBook')
const adminRoutes = require('./routes/admin')
const chatRoutes = require('./routes/chat')
const Chat = require('./models/Chat')
const { send } = require('process')

const app = express()

const server = http.createServer(app)
io = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    // allowedHeaders: [''],
    credentials: true,
  },
})

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    console.log('--multer--', file)
    cb(
      null,
      new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname
    )
  },
})

const fileFilter = (req, file, cb) => {
  console.log(file)
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

const socketMap = {}

io.on('connection', (socket) => {
  console.log(socket.id)

  socket.on('hello', ({ fromto }, callback) => {
    console.log(fromto)
    socketMap[fromto] = socket.id
    console.log(socketMap)
    callback('hello')
  })

  socket.on(
    'sendMessage',
    ({ sellerid, userid, message, bookid, sentby }, callback) => {
      new Chat({
        sellerid,
        userid,
        message,
        bookid,
        sentby,
      })
        .save()
        .then((newChat) => {
          callback({ chat: { ...newChat } })
          const sendTo = ((sentby === sellerid ? userid : sellerid)) + sentby
          console.log(sendTo)

          if (socketMap[sendTo])
            socket
              .to(socketMap[sendTo])
              .emit('recieveMessage', { chat: { ...newChat } })
        })
    }
  )

  socket.on('disconnect', () => {
    const k = Object.keys(socketMap).find((k) => socketMap[k] === socket.id)
    socketMap[k] = null
    console.log('disconnected ' + socket.id)
  })
})

app.use(bodyParser.json())

//app.use(multer({storage:fileStorage, fileFilter: fileFilter}).single('image'))
const upload = multer({ storage: fileStorage, fileFilter: fileFilter }).single(
  'image'
)

// Serve the frontend statically
app.use('/images', express.static(path.join(__dirname, 'images')))

// Resolve CORS error
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'POST, GET, PUT, PATCH, DELETE, OPTIONS'
  )
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})


// Frontend
app.use('/', express.static(path.join(__dirname, 'client')))


//Admin routes
app.use('/bookstore/admin', upload, adminRoutes)

//Auth Routes
app.use('/bookstore/auth/', authRoutes)

//BuyBook Routes
app.use('/bookstore/buybook/', isAuth, buybookRoutes)

//Sell Book
app.use('/bookstore/sellbook/', isAuth, upload, sellbookRoutes)

//Cart Routes
app.use('/bookstore/cart', isAuth, myCartRoutes)

// Chat routes
app.use('/bookstore/chat', isAuth, chatRoutes)

app.use(errorHandler)

function errorHandler(err, req, res, next) {
  console.log(err)
  res.status(500)
  res.json({ error: new Error(err).message })
}

let hashedPassword = null
createDatabase(process.env.MYSQL_DATABASE)
  .then((dbname) => {
    console.log('Database : ' + dbname)
    return database_bootstrap()
  })
  .then((_) => {
    return deleteBranchTrigger()
  })
  .then((_) => {
    return createAdminProcedure()
  })
  .then((_) => {
    return bcrypt.hash(process.env.ADMIN_PASSWORD, 12)
  })
  .then((hashedPwd) => {
    hashedPassword = hashedPwd
    return createAdmin(hashedPassword)
  })
  .then((result) => {
    if (result === 'Admin Exists') console.log(result)
    else console.log('Admin Created : ' + result)
    server.listen(process.env.PORT)
  })
  .catch((err) => {
    console.log(err)
  })

/*createDatabase(process.env.DB_NAME).then(dbname => {
    console.log("Database : "+dbname)
    return database_bootstrap()
})
.then(_ => {
    return deleteBranchTrigger()
})
.then( _ => {
    return User.findByEmail(process.env.ADMIN_EMAIL)
})
.then(adminUser => {
    console.log(adminUser)
    if(adminUser)
        throw new Error('Admin Exists')
    return bcrypt.hash(process.env.ADMIN_PASSWD,12)
}).then(hashedPassword => {
    console.log(hashedPassword)
    const newAdmin = new User({
        firstname:process.env.ADMIN_FIRSTNAME,
        lastname:process.env.ADMIN_LASTNAME,
        email:process.env.ADMIN_EMAIL,
        password:hashedPassword,
    })
    return newAdmin.save()
}).then(admin => {
    console.log(admin)
    adminId = admin.userid
    return getConnection()
}).then(conn => {
    conn.query(`INSERT INTO Admins(userid) VALUES ('${adminId}')`, err => {
        if(err)
            throw err
        app.listen(5000)
    })
}).catch(err => {
   
    if(err.message === "Admin Exists"){
        return app.listen(5000)
    }
     console.log(err)
})*/
