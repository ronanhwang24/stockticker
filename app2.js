const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");
const app = express();

// MongoDB Connection URI
const uri = "mongodb+srv://ronanhwang:ronanhwang@stickerhw.ia1unic.mongodb.net/?retryWrites=true&w=majority&appName=stickerhw";

// MongoDB Client Configuration
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tls: true,
  tlsAllowInvalidCertificates: false,
});

// Middleware to serve static files
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Serves static files from the root directory

// Serve the index.html page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Process the search query
app.get("/process", async (req, res) => {
  const { query, search_type } = req.query;
  console.log("Search query:", query, "Type:", search_type);

  try {
    await client.connect();
    const db = client.db("Stock");
    const collection = db.collection("PublicCompanies");

    let results;
    if (search_type === "company") {
      results = await collection.find({ Company: new RegExp(query, "i") }).toArray();
    } else if (search_type === "ticker") {
      results = await collection.find({ Ticker: new RegExp(query, "i") }).toArray();
    }

    console.log("Search results:", results);

    if (!results || results.length === 0) {
      return res.send("<p>No results found.</p><a href='/'>Back to search</a>");
    }

    const htmlResults = results.map(r => `
      <tr>
        <td>${r.Company}</td>
        <td>${r.Ticker}</td>
        <td>${r.Price}</td>
      </tr>
    `).join("");

    res.send(`
      <h2>Search Results</h2>
      <table border="1">
        <tr><th>Company Name</th><th>Ticker</th><th>Price</th></tr>
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

// Port Configuration
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
