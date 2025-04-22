const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");
const app = express();

// MongoDB URI
const uri = "mongodb+srv://ronanhwang:ronanhwang@stickerhw.ia1unic.mongodb.net/?retryWrites=true&w=majority&appName=stickerhw";

// MongoDB Client Config
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tls: true,
  tlsAllowInvalidCertificates: false,
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Serve static files from project root

// Root route → serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// /process route → handle form/search
app.get("/process", async (req, res) => {
  const { query, type } = req.query;

  try {
    await client.connect();
    const db = client.db("stock");
    const collection = db.collection("PublicCompanies");

    let results;
    if (type === "company") {
      results = await collection.find({ companyName: new RegExp(query, "i") }).toArray();
    } else if (type === "ticker") {
      results = await collection.find({ stockTicker: new RegExp(query, "i") }).toArray();
    }

    if (!results || results.length === 0) {
      return res.send("<p>No results found.</p><a href='/'>Back to search</a>");
    }

    // Format and send HTML response
    const htmlResults = results.map(r => `
      <tr>
        <td>${r.companyName}</td>
        <td>${r.stockTicker}</td>
      </tr>
    `).join("");

    res.send(`
      <h2>Search Results</h2>
      <table border="1">
        <tr><th>Company Name</th><th>Ticker</th></tr>
        ${htmlResults}
      </table>
      <br>
      <a href="/">Back to Search</a>
    `);
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).send("An error occurred. Please try again later.");
  } finally {
    await client.close();
  }
});

// Port setup for Heroku
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
