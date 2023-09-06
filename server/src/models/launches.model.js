const launchesDB = require("./launches.mongo");
const planets = require("./planets.mongo");
const launches = new Map();

let DEFAULT_FLIGHT_NUMBER = 100;

const launch = {
    flightNumber : 100,
    mission : "Kepler Exploration X",
    rocket : "Explorer IS1",
    launchDate: new Date("December 28, 2030"),
    target : "Kepler-442 b",
    customers : ["ZTM","NASA"],
    upcoming : true,
    success: true,
};

saveLaunch(launch);
// launches.set(launch.flightNumber,launch);

function getAllLaunches()
{
    return launchesDB.find({},{
        '_id':0,
        '__v':0,
    });
}


function existsLaunchWithId(launchId)
{
    return launches.has(launchId);
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
    const planet = await planets.findOne({
        keplerName:launch.target,
    });
    if(!planet)
    {
        throw new Error("No matching planet found!");
    }
    else
    {
        await launchesDB.updateOne({
            flightNumber:launch.flightNumber,
        },launch,{
            upsert:true,
        });
    }
    
}


function addNewLaunch(launch)
{
    latestFlightNumber++;
    launches.set(
        latestFlightNumber,
        Object.assign(launch,{
            success : true,
            upcoming : true,
            customers : ["Zero to Mastery", "NASA"],
            flightNumber: latestFlightNumber,
    })
    );
}

function abortLaunchById(launchId)
{
    const aborted = launches.get(launchId);
    aborted.upcoming = false;
    aborted.success = false;
    return aborted;
}


module.exports = {
    getAllLaunches,
    addNewLaunch,
    existsLaunchWithId,
    abortLaunchById,
};