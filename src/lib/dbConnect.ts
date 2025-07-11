import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}

async function dbConnect(): Promise<void>{
    if(connection.isConnected){
        console.log("already connected")
        return
    }
    try {
       const db = await mongoose.connect(process.env.MONGO_URL || "", {});

       console.log(db.connections)

       connection.isConnected = db.connections[0].readyState

       console.log("db connected Successfuly ✅✅✅")
    } catch (error) {
        console.log("db connection error", error)

        process.exit(1)
    }
}

export default dbConnect;