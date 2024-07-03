import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

// configration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key:  process.env.API_KEY, 
    api_secret: process.env.API_SECRET
});

const upoloadOnCloudnariy=async(localPath)=>{
   try {

    if(!localPath) return null

    // upload file on cloudinary
  const res= await cloudinary.uploader.upload(localPath,{
        resource_type:"auto"
    })
    // file uploaded succesfully
    console.log("file uploaded",res.url);
    return res;
    
   } catch (error) {
    // yani server pe too wo file aa chuki thhi ab server se hata do yani delete kar do sync way me
    // remove localy saved temp file 
     fs.unlinkSync(localPath)
     return null
   }
}

export {upoloadOnCloudnariy}