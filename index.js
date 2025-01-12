const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;

//middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_password}@cluster0.kqp32.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//middleware
const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  // console.log("value of token in middleware", token);
  //no token
  if (!token) {
    return res.status(401).send({ message: "Unauthorized access" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    //err
    if (err) {
      console.log(err);
      return res.status(403).send({ message: "Forbidden access" });
    }
    //if token is valid
    console.log("value in the decoded", decoded);
    req.user = decoded;
    next();
  });
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const servicerCollection = client.db("carService").collection("services");
    const orderCollection = client.db("carService").collection("orders");

    //auth related api
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log("user for login token", user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ success: true });
    });

    //for null user or logout option
    app.post("/logOut", async (req, res) => {
      const user = req.body;
      console.log("user for logout", user);
      res.clearCookie("token", { maxAge: 0 }).send({ success: true });
    });

    //services releted api
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

    app.get("/bookings", verifyToken, async (req, res) => {
      console.log(req.query.email);

      // console.log('cookies', req.cookies)
      // console.log("token woner info", req.user);

      //if request email is not same as user email
      if (req.user.email !== req.query.email) {
        return res.status(401).json({ message: "Unauthorized access" });
      }
      //if both is  same
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
