// src/db/index.js
import mongoose from 'mongoose';
 //import { DB_NAME } from '../constants.js';

export const ConnectDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/myapp').then(()=>{
            console.log('MongoDB connected successfully');
        })
       
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
    }
};
