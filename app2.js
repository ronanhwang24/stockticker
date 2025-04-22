const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");
const axios = require("axios");

const app = express();

// MongoDB Connection URI
const uri = "mongodb+srv://ronanhwang:ronanhwang@stickerhw.ia1unic.mongodb.net/?retryWrites=true&w=majority&appName=stickerhw";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Serve static files from the "stockticker" folder
app.use(express.static(path.join(__dirname, "stockticker")));

// Route for root – serves index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "stockticker", "index.html"));
});

// Handle stock search
app.get("/process", async (req, res) => {
  const { query, search_type } = req.query;

  try {
    await client.connect();
    const db = client.db("Stock");
    const collection = db.collection("PublicCompanies");

    let result;
    if (search_type === "ticker") {
      result = await collection.findOne({ Ticker: new RegExp(query, "i") });
    } else if (search_type === "company") {
      result = await collection.findOne({ Company: new RegExp(query, "i") });
    }

    if (!result) {
      return res.send("<h2>No results found</h2>");
    }

    // Fetch live stock price using Financial Modeling Prep API
    const apiUrl = `https://financialmodelingprep.com/api/v3/quote/${result.Ticker}?apikey=demo`;
    const response = await axios.get(apiUrl);
    const liveData = response.data[0];

    const livePrice = liveData?.price || "Unavailable";
    const companyName = result.Company;
    const tickerSymbol = result.Ticker;

    res.send(`
      <html>
        <head>
          <title>Stock Results</title>
          <style>
            table { border-collapse: collapse; width: 50%; margin: 20px auto; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            h1, p { text-align: center; }
            a { display: block; text-align: center; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Stock Search Result</h1>
          <table>
            <tr><th>Company</th><td>${companyName}</td></tr>
            <tr><th>Ticker</th><td>${tickerSymbol}</td></tr>
            <tr><th>Live Price</th><td>$${livePrice}</td></tr>
          </table>
          <a href="/">Search Again</a>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).send("An error occurred. Please try again later.");
  } finally {
    await client.close();
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
