const express =require('express')
const mongoose=require("mongoose")
const dotenv=require("dotenv/config")
const app= express()
const morgan=require("morgan")
const userRoutes=require('./api/routes/user')
const reviewRoutes=require('./api/routes/review')

mongoose.connect(process.env.DB_CONNECTION,()=>console.log("connected to DB"))

app.use(morgan('dev'))
app.use(express.urlencoded({extended:false}))
app.use(express.json())

app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*')
    res.header('Access-Control-Allow-Headers','Origin,X-Requested-With,Content-Type,Accept,Authorization')
    if(req.method==='OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT,POST,GET,PATCH,DELETE')
        return res.status(200).json({});
    }
    next()
})

//Routes
app.use('/api/user',userRoutes)
app.use('/api/reviews',reviewRoutes)
//error handling
app.use((req,res,next)=>{
    const error=new Error('Not found')
    error.status=404
    next(error)
})

app.use((error,req,res,next)=>{
    res.status(error.status||500)
    res.json({
        error:{
            message:error.message
        }
    })
})


module.exports=app;