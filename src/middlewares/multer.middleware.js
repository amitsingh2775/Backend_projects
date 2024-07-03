import multer from "multer";

const storage=multer.diskStorage({
    //server per file kaha rakhna hai
    destination:function(req,file,cb){
        cb(null,"./public/temp")
    },
    // filename kisse save hogi
    filename:function(req,file,cb){
        cb(null,file.originalname)
    }

})

export const upload=multer({storage:storage})