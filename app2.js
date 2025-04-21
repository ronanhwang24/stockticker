const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();

// MongoDB Connection URI
const uri = "mongodb+srv://ronanhwang:<db_password>@stickerhw.ia1unic.mongodb.net/?retryWrites=true&w=majority&appName=stickerhw";

// MongoDB Client Configuration
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tls: true, // Ensure TLS/SSL connection
    tlsAllowInvalidCertificates: false, // Certificates must be valid
});

// Middleware
app.set("view engine", "ejs"); // Use EJS for rendering
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Home Route - Displays the Search Form
app.get("/", (req, res) => {
    res.render("home"); // Render 'home.ejs'
});

// Process Route - Handles Search Queries
app.get("/process", async (req, res) => {
    const { query, type } = req.query; // Get input from the form

    try {
        // Connect to MongoDB
        await client.connect();
        console.log("Connected to MongoDB!");

        // Select the database and collection
        const db = client.db("stock");
        const collection = db.collection("PublicCompanies");

        // Search Logic
        let results;
        if (type === "company") {
            // Case-insensitive search for company name
            results = await collection.find({ companyName: new RegExp(query, "i") }).toArray();
        } else if (type === "ticker") {
            // Case-insensitive search for stock ticker
            results = await collection.find({ stockTicker: new RegExp(query, "i") }).toArray();
        }

        // Render the Results
        res.render("process", { results });
    } catch (error) {
        console.error("Error during search:", error);
        res.status(500).send("An error occurred. Please try again later.");
    } finally {
        // Close the MongoDB connection
        await client.close();
    }
});

// Port Configuration
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
