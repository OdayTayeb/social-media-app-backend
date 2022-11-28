const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const app = express()

const postRoute = require('./routes/posts')
const userRoute = require('./routes/auth')
const statusRoute = require('./routes/status')


// file uploading
const multer = require('multer')
const fileStorage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'images')
    },
    filename: (req,file,cb)=>{
        cb(null,new Date().toISOString().replace(/:/g, '-')+'-'+file.originalname)
    }
})
const fileFilter = (req,file,cb)=>{
    if (file.mimetype === 'image/jpg' ||file.mimetype === 'image/png'||file.mimetype==='image/jpeg'){
        cb(null,true)
    }
    else cb(null,false)
}

app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*')
    res.setHeader('Access-Control-Allow-Methods','*')
    res.setHeader('Access-Control-Allow-Headers','*')
    next()
})
app.use(bodyParser.json())
app.use(multer({storage:fileStorage,fileFilter:fileFilter}).single('image'))
app.use('/images',express.static(path.join(__dirname,'images')))

app.use('/feed',postRoute)
app.use('/auth',userRoute)
app.use('/status',statusRoute)
app.use((err,req,res,next)=>{
    console.log(err)
    let statusCode= err.statusCode
    const message = err.message
    if (!statusCode) statusCode =500
    res.status(statusCode).json({
        message: message,
    })
})

app.listen(8080)
