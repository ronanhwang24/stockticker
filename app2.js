const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();

// MongoDB Connection URI
const uri = "mongodb+srv://ronanhwang:<db_password>@stickerhw.ia1unic.mongodb.net/?retryWrites=true&w=majority&appName=stickerhw";

// MongoDB Client Configuration
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tls: true,
  tlsAllowInvalidCertificates: false,
});

// Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Home Route - Displays the Search Form
app.get("/", (req, res) => {
  res.render("home"); // Render 'home.ejs'
});

// Process Route - Handles Search Queries
app.get("/process", async (req, res) => {
  const { query, type } = req.query;
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    const db = client.db("stock");
    const collection = db.collection("PublicCompanies");
    let results;
    if (type === "company") {
      results = await collection.find({ companyName: new RegExp(query, "i") }).toArray();
    } else if (type === "ticker") {
      results = await collection.find({ stockTicker: new RegExp(query, "i") }).toArray();
    }
    // Display results in the console
    console.log(results);
    // Render the Results
    res.render("process", { results });
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).send("An error occurred. Please try again later.");
  } finally {
    await client.close();
  }
});

// Port Configuration
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
