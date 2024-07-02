// src/index.js

import dotenv from 'dotenv';
import { ConnectDB } from './db/index.js';
import {app} from './app.js'
const port=process.env.PORT ||8000

dotenv.config({
    path:'.env'
});




 ConnectDB().then(()=>{
    app.listen(port,()=>{
        console.log(`server start at ${port}`);
    })
 })
 .catch((error)=>{
    console.log(error);
 });

