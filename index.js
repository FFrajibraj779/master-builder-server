const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 5000;

//middleWare
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lrjyghr.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access 1" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access 1" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const AllServices = client.db("Myservice").collection("ServiceCollection");
    const ReviewsCollection = client.db("Myservice").collection("reviews");

    //jwttoken

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1d",
      });
      console.log(token);
      res.send({ token });
    });

    //get all service
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = AllServices.find(query).sort({ time: -1 });
      console.log(cursor);
      const result = await cursor.toArray();

      res.send(result);
    });
    //service post
    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await AllServices.insertOne(service);

      res.send(result);
    });
    //service get by id
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await AllServices.findOne(query);

      res.send(result);
      console.log(result);
    });

    app.get("/home", async (req, res) => {
      const query = {};
      const cursor = AllServices.find(query);
      console.log(cursor);
      const result = await cursor.limit(3).toArray();

      res.send(result);
    });

    //post review
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await ReviewsCollection.insertOne(review);
      res.send(result);
    });

    //update review

    app.patch("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const reviewUpdate = req.body;
      const options = { upsert: true };

      const updateService = {
        $set: {
          serviceName: reviewUpdate.serviceName,
          Price: reviewUpdate.Price,
          message: reviewUpdate.message,
        },
      };
      const result = await ReviewsCollection.updateOne(
        filter,
        updateService,
        options
      );
      res.send(result);
      console.log(result);
    });

    //get all review
    app.get("/reviews", async (req, res) => {
      const query = {};
      const cursor = ReviewsCollection.find(query).sort({ time: -1 });
      const result = await cursor.toArray();
      // console.log(result);

      res.send(result);
    });
    //get review by email
    app.get("/reviews", verifyJwt, async (req, res) => {
      const decoded = req.decoded;

      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: "unauthorized access 2" });
      }

      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      //update check

      const cursor = ReviewsCollection.find(query);
      const review = await cursor.toArray();
      res.send(review);
    });

    //delete review
    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ReviewsCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch((err) => {
  console.log(err);
});

app.get("/", (req, res) => {
  res.send("server is ok");
});

app.listen(port, () => {
  console.log(`servar running on ${port}`);
});
