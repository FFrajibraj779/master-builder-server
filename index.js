const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion,ObjectId } = require("mongodb");
const app = express();
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

async function run() {
  try {
    const AllServices = client.db("Myservice").collection("ServiceCollection");

    app.get("/services", async (req, res) => {
      const query = {};
     const cursor = AllServices.find(query);
      console.log(cursor);
      const result = await cursor.toArray();

      res.send(result);
    });
    app.get('/services/:id', async(req, res)=>{
        const id = req.params.id ;
        const query ={_id:ObjectId(id)}
        const result = await AllServices.findOne(query);
        
        res.send(result)
        console.log(result);
    })
    app.get("/home", async (req, res) => {
      const query = {};
     const cursor = AllServices.find(query);
      console.log(cursor);
      const result = await cursor.limit(3).toArray();

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
