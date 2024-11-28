const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_password}@cluster0.kqp32.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const servicerCollection = client.db("carService").collection("services");
    const orderCollection = client.db("carService").collection("orders");

    app.get("/services", async (req, res) => {
      const cursor = servicerCollection.find();
      const services = await cursor.toArray();
      res.json(services);
    });




    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      // const options = {
      //   projection: { title: 1, img: 1, price: 1, service_id: 1 },
      // };
      // const service = await servicerCollection.findOne(query, options);
      const service = await servicerCollection.findOne(query);
      res.send(service);
    });

    //order
    app.post("/bookings", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });

    app.get("/bookings", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.json(orders);
    });

    app.get("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const order = await orderCollection.findOne(query);
      res.json(order);
    });

    //update
    app.patch("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const updateBooking = req.body;
      console.log(updateBooking);
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const updateDoc = {
        $set: {
          status: updateBooking.status,
        },
      };
      const result = await orderCollection.updateOne(query, updateDoc, options);

      res.json(result);
    });

    //delete
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("car service is running");
});

app.listen(port, () => {
  console.log("car server is runnign", port);
});
