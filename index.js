const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
const port = process.env.PORT || 5000;

//middleware
app.use(cors({
  origin:['http://localhost:5173'],
  
}));
app.use(express.json());

app.get('/', (req,res)=>{
    res.send("House Master Server Is Running");
})

//db

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x4cetjc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const database = client.db("HouseMaster")
    const ServiceCollection = database.collection("Services")
    const bookedCollection = database.collection("Booked")
    
    //Add Services Related Api - Start
    //post
    app.post('/services', async(req,res)=>{
        const newProduct = req.body;
        // console.log(newProduct)
        const result = await ServiceCollection.insertOne(newProduct)
        res.send(result)
      })
    
      
    //get
    app.get('/services', async(req,res)=>{
        const cursor = ServiceCollection.find()
        const result = await cursor.toArray()
        res.send(result)
      })

    //dedicated home page api so that it dosent take time loading home page as there is only need of 4 db documents for the homepage 
    app.get('/services/home', async(req,res)=>{
      const cursor = ServiceCollection.find().limit(4); 
      const result = await cursor.toArray();
      res.send(result);
      })

    //api to filter
    app.get('/services/data', async(req,res)=>{
      console.log(req.query.email)
      let query={}
      if(req.query?.email){
        query={providerEmail : req.query.email}
      }
        const cursor = ServiceCollection.find(query)
        const result = await cursor.toArray()
        res.send(result)
      })
    //Add Services Related Api - End

    //view single service from db
    app.get('/services/:id',async(req,res)=> {
        const id = req.params.id;
        const query = {_id : new ObjectId(id)}
        const result = await ServiceCollection.findOne(query);
        res.send(result)
    })

    //update single service from db
    app.put('/services/:id',async(req,res)=> {
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)}
      const service = req.body;
      const options = { upsert: true };
      const updateService={
        $set: {
        providerName:service.providerName,
            providerEmail:service.providerEmail,
            providerPhotoURL:service.providerPhotoURL,
            service:service.service,
            servicePhotoURL:service.servicePhotoURL,
            price:service.price,
            serviceArea:service.serviceArea,
            short_description:service.short_description
        }
      }
      // console.log(updateService)
        const result = await ServiceCollection.updateOne(filter,updateService,options);
        res.send(result)
    })

    //Purchased/Booked related Api - start
    app.post('/booked', async(req,res)=>{
      const newBooked = req.body;
      const result = await bookedCollection.insertOne(newBooked)
      res.send(result)
    })

    app.get('/booked', async(req,res)=>{
      // console.log(req.query)
      const cursor = bookedCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })
      //Purchased/Booked related Api - end

    // //get service data by email
    // app.get('/services', async (req, res) => {
    //   const providerEmail = req.query.providerEmail;
    //   const query = { providerEmail: providerEmail };
    
    //   try {
    //     const result = await ServiceCollection.find(query).toArray();
    //     res.send(result);
    //   } catch (err) {
    //     res.status(500).send({ error: err.message });
    //   }
    // });
    
    //Delete Service
    app.delete('/services/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)}
      console.log("found id",id)
      const result = await ServiceCollection.deleteOne(filter);
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port,()=>{
    console.log(`Brand Shop Server is Running on Port: ${port}`);
})