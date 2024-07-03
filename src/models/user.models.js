import mongoose,{Schema} from "mongoose";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const userSchema=new Schema({

    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        index:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    fullname:{
        type:String,
        required:true,
        index:true,
        trim:true
    },
    avatar:{
       type:String, // here i use coudinary for url
       require:true
    },
    coverImage:{
        type:String
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,"password must be required"]
    },
    refreshToken:{
        type:String
    }

},{timestamps:true})

// data save hone se just pahle
userSchema.pre("save", async function(next){
    if(this.isModified("password")) return next()
    
   this.password=bcrypt.hash(this.password,12)
   next()
})

userSchema.methods.isPasswordCorrect=async function(password){
  return await bcrypt.compare(password,this.password)
}

userSchema.methods.genrateAccessToken=function(){
  return jwt.sign(
        // payload
        {
            _id:this._id,
            email:this.email,
            username:this.username
        },
        // seceret key
        process.env.SECRET_KEY,
        // expirydate
        {
            expiresIn:process.env.TOKEN_EXPIRY
        }
    )
}
userSchema.methods.genrateRefreshToken=function(){
    return jwt.sign(
        // payload
        {
            _id:this._id
            
        },
        // seceret key
        process.env.REFRESH_TOKEN_KEY,
        // expirydate
        {
            expiresIn:process.env.REFRESH_EXPIY
        }
    )
}

export const User=mongoose.model("User",userSchema)