import {Router} from 'express'
import {userRegister,userLogin,userLogout,refreshAccesToken} from '../controllers/user.controller.js'
import  {upload } from '../middlewares/multer.middleware.js'
import { jwtVerify } from '../middlewares/auth.middleware.js' 
// create route from Router
const router=Router()

 router.route("/register").post(
    upload.fields([

        {name:"avatar", maxCount:1},
        {name:"coverImage",maxCount:1}

    ]),
    userRegister
)
router.route("/login").post(userLogin)
router.route("/logout").post(jwtVerify,userLogout)
router.route("/genratetoken").post(refreshAccesToken)
export default router