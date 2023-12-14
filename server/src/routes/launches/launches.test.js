const request = require("supertest");
const app = require("../../app");
const { 
    mongoConnect,
    mongoDisconnect,
 } = require("../../services/mongo");

describe('Launch API',()=>{

    beforeAll(async()=>{
        await mongoConnect();
    }); 

    afterAll(async()=>{
        await mongoDisconnect();
    });

    describe('Test GET /launches', ()=>{
        test('It should respond with 200 success', async ()=>{
            const response = await request(app)
            .get("/v1/launches")
            .expect("Content-Type", /json/)
            .expect(200);
        });
    });
    
    describe('Test POST /launch', ()=>{
    
        const completeData = {
            mission : "Osaka EER",
            rocket : "SSR Newton-4",
            launchDate : "July 30, 2023",
            target : "Kepler-62 f",
        }
        const launchDataWithoutDate = {
            mission : "Osaka EER",
            rocket : "SSR Newton-4",
            target : "Kepler-62 f",
        }
       
        const launchDataWithInavlidDate = {
            mission : "Osaka EER",
            rocket : "SSR Newton-4",
            launchDate : "datamata",
            target : "Kepler-62 f",
        }
    
    
        test('It should respond with 201 created', async ()=>{
            const response = await request(app)
            .post("/v1/launches")
            .send(completeData)
            .expect("Content-Type", /json/)
            .expect(201);
    
            const requestDate = new Date(completeData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
            expect(responseDate).toBe(requestDate);
    
           expect(response.body).toMatchObject(launchDataWithoutDate);
        });
    
    
        test('It should  catch missing properties', async ()=>{
            const response = await request(app)
            .post("/v1/launches")
            .send(launchDataWithoutDate)
            .expect("Content-Type", /json/)
            .expect(400);
    
            expect(response.body).toStrictEqual({
                error : "Missing required launch property",
            });
        });
    
        test('It should catch invalid dates', async ()=>{
            const response = await request(app)
            .post("/v1/launches")
            .send(launchDataWithInavlidDate)
            .expect("Content-Type", /json/)
            .expect(400);
    
            expect(response.body).toStrictEqual({
                error : "Invalid launch date",
            });
        });
    });
});


