const mongoose = require("mongoose");


const MONGO_URL = "mongodb+srv://nasa-api:r2RU9psQgFZvTHcY@nasa-api.srkviyv.mongodb.net/nasa?retryWrites=true&w=majority";

mongoose.connection.once('open',()=>{
    console.log("MongoDB connetion successfully!!!");
});

mongoose.connection.on('error',(err)=>{
    console.error(err);
});

async function mongoConnect()
{
    await mongoose.connect(MONGO_URL,{
    });
}

async function mongoDisconnect() {
    await mongoose.disconnect();
}


module.exports = {
    mongoConnect,
    mongoDisconnect,
}