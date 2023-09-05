const dotenv = require('dotenv');
dotenv.config();
const http = require("http");
const mongoose = require("mongoose");
const app = require("./app");
const { loadPlanetsData } = require('./models/planets.model');

const PORT = process.env.PORT || 8000;

const MONGO_URL = "mongodb+srv://nasa-api:r2RU9psQgFZvTHcY@nasa-api.srkviyv.mongodb.net/nasa?retryWrites=true&w=majority";
const server = http.createServer(app);

mongoose.connection.once('open',()=>{
    console.log("MongoDB connetion successfully!!!");
});

mongoose.connection.on('error',(err)=>{
    console.error(err);
});

async function startServer()
{
    await mongoose.connect(MONGO_URL,{
        useNewUrlParser : true,
        // useFindAndModify: false,
        // useCreateIndex : true,
        useUnifiedTopology : true,
    });
    await loadPlanetsData();
    server.listen(PORT, ()=>{
        console.log(`Lisiting port ${PORT}`);
    });
}

startServer();

