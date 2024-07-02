// wraper function 

//prototype->const asyncHandler=(fun)=>{()=>{}}

    // try catch wala
const asyncHandler=(fun)=>async(req,res,next)=>{

    try {
        
    } catch (error) {
        res.status( err.code||500).json({
            success:false,
            message:error.message
        })
    }

}

export {asyncHandler}


