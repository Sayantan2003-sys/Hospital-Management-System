import mongoose from "mongoose";

export const dbConnection = () => {
    mongoose.connect(process.env.MONGO_URI, {
        dbName: "hospital_managment_system",
    }).then(() => {
        console.log("Database connected successfully");
    })
    .catch((err) => {
        console.log("Database connection failed", err);
    });
}