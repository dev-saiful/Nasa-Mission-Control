const axios = require("axios");
const launchesDB = require("./launches.mongo");
const planets = require("./planets.mongo");


let DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API = "https://api.spacexdata.com/v5/launches/query";

async function populateLaunches()
{
    console.log("Downloading Data...");
    const response = await axios.post(SPACEX_API,{
        query:{},
        options:{
            pagination:false,
            populate:[
                {
                    path:"rocket",
                    select:{
                        name:1
                    }
                },
                {
                    path:"payloads",
                    select:{
                        customers:1
                    }
                }
            ]
        }
    });
    if(response.status !== 200)
    {
       console.log("Problem downloading launch data");
       throw new Error("Launch  data downloading failed");
    }
    const launchDocs = response.data.docs;
    for(const launchDoc of launchDocs)
    {
        const payloads = launchDoc["payloads"];
        const customers = payloads.flatMap((payload)=>{
            return payload["customers"];
        })
       
        const launch = {
            flightNumber : launchDoc["flight_number"],
            mission : launchDoc["name"],
            rocket : launchDoc["rocket"]["name"],
            launchDate: launchDoc["date_local"],
            upcoming :  launchDoc["upcoming"],
            success:  launchDoc["success"],
            customers : customers,
        }
        
        console.log(`${launch.flightNumber} ${launch.mission}`);
        await saveLaunch(launch);
    }
   
}

async function loadLaunchData()
{
   const firstLaunch = await findLaunch({
    flightNumber:1,
    rocket:"Falcon 1",
    mission:"FalconSat",
   });
   if(firstLaunch)
   {
    console.log("Launch data alreday exists");
    return;
   }
   else
   {
    await populateLaunches();
   }
}
// launches.set(launch.flightNumber,launch);

async function getAllLaunches(limit,skip)
{

    return await launchesDB
    .find({},{ '_id':0,'__v':0,})
    .sort({flightNumber:1})
    .skip(skip)
    .limit(limit);
}

async function findLaunch(filter)
{
    return await launchesDB.findOne(filter);
}

async function existsLaunchWithId(launchId)
{
    return await findLaunch({
        flightNumber:launchId,
    });
}

async function getLatestFlightNumber()
{
    const latestFlightNumber = await launchesDB
    .findOne({})
    .sort('-flightNumber');
    if(!latestFlightNumber)
    {
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestFlightNumber.flightNumber;
}


async function saveLaunch(launch)
{
        await launchesDB.findOneAndUpdate({
            flightNumber:launch.flightNumber,
        },launch,{
            upsert:true,
        });
    
}


async function scheduleNewLaunch(launch)
{
    const planet = await planets.findOne({
        keplerName:launch.target,
    });
    if(!planet)
    {
        throw new Error("No matching planet found!");
    }
    const newFligthNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch,{
        success : true,
        upcoming : true,
        customers : ["RaddSoft Technology", "NASA"],
        flightNumber: newFligthNumber,
    });

    await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId)
{
    const aborted = await launchesDB.updateOne({
        flightNumber:launchId,
    },{
        upcoming:false,
        success:false,
    });

    return aborted.acknowledged === true && aborted.modifiedCount === 1;
}


module.exports = {
    loadLaunchData,
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunchById,
};