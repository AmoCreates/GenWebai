import mongoose from "mongoose";

const dbConnection = async () => {
    const dbName = "Webiste_builder"
    try {
        await mongoose.connect(`${process.env.MONGO_DB_URL}/${dbName}`);
        console.log('DATABASE CONNECTED SUCCESSFULLY');
    } catch (error) {
        console.log('Mongoose connection error!, Database connection Failed');
    }
}

export default dbConnection;