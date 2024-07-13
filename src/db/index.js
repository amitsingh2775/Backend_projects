// src/db/index.js
import mongoose from 'mongoose';
 import { DB_NAME } from '../constants.js';

export const ConnectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`).then(()=>{
            console.log('MongoDB connected successfully');
        })
       
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
    }
};
