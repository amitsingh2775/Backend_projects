import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import { User } from '../models/user.models.js'
import { upoloadOnCloudnariy } from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/apiResponse.js'
import jwt from 'jsonwebtoken'

// method to genrate access and resfresh token
const generateAcessAndResfreshToken=async(userId)=>{
     try {
        const user=await User.findById(userId);
      //  console.log(`before store refreshtoken ${user}`);
        const accesToken=user.generateAccessToken()
       // console.log(accesToken);
        const refreshToken=user.generateRefreshToken()
      //  console.log(`accessToken is->${accesToken}`);
       // console.log(`refresh token ->${refreshToken}`);
        // assign refresh token to user object
        user.refreshToken=refreshToken;
        
       // console.log(user);
        user.save({validateBeforeSave:false})


        return({refreshToken,accesToken})

     } catch (error) {
        throw new ApiError(500,error)
     }
}

const userRegister = asyncHandler(async (req, res) => {
    // step1.get user details from frontend
    // step2.apply validation like user filled details or not
    // step3 check user already exits or not
    // step4 check for images , check for avtar
    // step5 upload them to cloudinqry
    // step5 get user form upload respone
    // after all create user object and create entry in db
    // remove refresh token and password field from response
    // chek user created or not and send response

    const { username, fullname, email, password } = req.body

    if ([username, fullname, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "all fields are required")
    }

    // if username and email exists then throw error
    const userExist = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (userExist) {
        throw new ApiError(400, "email or username already exists")
    }
  //  console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path
   // const coverImageLocalPath = req.files?.coverImage[0]?.path

 //method1->
//    let coverImageLocalPath;
//    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
//     coverImageLocalPath=req.files.coverImage[0].path
//    }

// it simple method
let coverImageLocalPath;

// Check if req.files exists and if it contains a non-empty array for coverImage
if (req.files?.coverImage?.length > 0) {
    // Assign the path of the first coverImage file to coverImageLocalPath
    coverImageLocalPath = req.files.coverImage[0].path;
} else {
    // If no coverImage is provided, set coverImageLocalPath to null
    coverImageLocalPath = null;
}

   
    //console.log(avatarLocalPath);

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar is Required")
    }
    const avatar = await upoloadOnCloudnariy(avatarLocalPath)
    const coverImage = await upoloadOnCloudnariy(coverImageLocalPath)


    if (!avatar) {
        throw new ApiError(400, "avatar is Required")
    }

    const user = await User.create({
        fullname,
        email,
        password,
        username,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })
    if (!user) {
        throw new ApiError(400, "empty user")
    }

    return res.status(201).json(
        new ApiResponse(200,user,"user Created Succesfully")
    )

})

const userLogin = asyncHandler(async (req, res) => {
    // steps->
    // req->body=data
    // username or email
    // find user
    // check password
    // access and refresh token
    // send cookies

    const { identifier, password } = req.body;

    if (!identifier || !password) {
        throw new ApiError(400, "Identifier and password fields are required");
    }

    const user = await User.findOne({
        $or: [{ username: identifier }, { email: identifier }]
    });

    if (!user) {
        throw new ApiError(404, "User not found. Please create an account.");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Incorrect password");
    }

    // Call generate tokens
    const { refreshToken, accesToken } = await generateAcessAndResfreshToken(user._id);
   // console.log("refreshToken",refreshToken);
    //console.log("accessToken",accesToken);
    const loggedUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accesToken", accesToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedUser,
                    accesToken,
                    refreshToken
                },
                "User logged in successfully"
            ) 
        );
});
// logout
const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accesToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccesToken=asyncHandler(async(req,res)=>{
    try {
        const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
    
        if(!incomingRefreshToken){
            throw new ApiError(401,"unauthorize user")
        }
        const decode= jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_KEY)
    
       const user=await User.findById(decode?._id)
    
       if(!user){
         throw new ApiError(401,"invaild or refresh token is expired")
       }
    
       if(incomingRefreshToken!==user?.refreshToken){
        throw new ApiError(401,"invaild ")
       }
    
       const options={
           httpOnly:true,
           secure:true
       }
    
         const {newRefreshToken,newAccesToken}=await generateAcessAndResfreshToken(user._id)
    
         return res.
         status(200).
         cookie("accesToken",newAccesToken,options)
         .cookie("refreshToken",newRefreshToken,options)
         .json(
            new ApiResponse(
    
                200,
                {accesToken:newAccesToken,refreshToken:newRefreshToken},
                "access token refreshed"
    
            )
         )
    
    } catch (error) {
        throw new ApiError(500,error?.message || "invaild refresh token ")
    }
    
})

const changePassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body;
    const user=await User.findById(req.user?._id);
    const isCorrectPassword=user.isPasswordCorrect(oldPassword)
    if(!isCorrectPassword){
        throw new ApiError(400,"incorrect old password")
    }
    user.password=newPassword
    await user.save({validateBeforeSave:true})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"password change succesfully"))
})

const getCurrentuser=asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(200,req.user,"currect user")

})

const updateAccountDetails=asyncHandler(async(req,res)=>{
      const {fullname,email}=req.body

      if(!fullname || !email){
        throw new ApiError(400,"all fields are required")
      }
      const user=User.findByIdAndUpdate(
        req.user?._id,
        { 
          $set:{
            fullname:fullname,
            email:email
          }
        },
        {new:true}
      ).select("-password")

      return res.
      status(200).
      json(new ApiResponse(200,user,"account updated succesfully"))
})

const updateAvatar=asyncHandler(async(req,res)=>{
    const avatarPath=req.file?.path

    if(!avatarPath){
        throw new ApiError(400,"avatar file is missing")
    }
    const avatar=await upoloadOnCloudnariy(avatarPath)

    if(!avatar.url){
        throw new ApiError(400,"error while uploading avatar")
    }

   const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200).
    json(new ApiResponse(200,user,"avatar updated succeffuly"))
})

const updateCoverImage=asyncHandler(async(req,res)=>{
     const coverImagePath=req.file?.path;

     if(!coverImagePath){
        throw new ApiError(400,"coverImage  missing")
     }
     const coverImage=await upoloadOnCloudnariy(coverImagePath);
     const url=coverImage.url
     if(!url){
        throw new ApiError(400,"error while uploadig cover image")
     }
     const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:url;
            }
        },
        {new:true}

     ).select("-password")

     return 
     res.status(200).
     json(new ApiResponse(200,user,"converImage updated succesfully"))

})

export { 
    userRegister,
    userLogin ,
    logoutUser,
    changePassword,
    refreshAccesToken ,
    getCurrentuser,
    updateAccountDetails,
    updateAvatar
}