import express, { urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

 const app=express()
 app.use(cors({
    origin:process.env.CORS_ORG,
    credentials:true
 }))
// cookies-parser->jo user hoga useke broweser per cookies ke regarding crud operation perform karne ke liye 
// like cookies set karna ,remove karna,create karna
 app.use(cookieParser())
 // json format data ko allow karta hai
 app.use(express.json({limit:"20kb"}))
 //extended -> object ke ander object bhej sakte ho means nestend object
 // urlencoded->jo url me data or spaces or spacial character hota hai usse encode karta hai
 app.use(express.urlencoded({extended:true,limit:"20kb"}))

 app.use(express.static("public"))

 // importing route 
 import userRoute from './routes/user.routes.js'

 app.use("/api/v1/users",userRoute)

 // look like->http://localhost:3000/user/*
 export {app}