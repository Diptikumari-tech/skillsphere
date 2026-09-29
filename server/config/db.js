import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/skillsphere");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // If local MongoDB is not running, log instructions instead of immediate exit in dev mode
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️ Warning: Could not connect to local MongoDB. Make sure MongoDB service is running or update MONGO_URI in server/.env!");
    } else {
      process.exit(1);
    }
  }
};

export default connectDB;
