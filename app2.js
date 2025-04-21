const fs = require('fs');
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://ronanhwang:<db_password>@stickerhw.ia1unic.mongodb.net/?retryWrites=true&w=majority&appName=stickerhw";
const client = new MongoClient(uri);

async function loadCSVData() {
    try {
        // Connect to MongoDB
        await client.connect();
        console.log("Connected to MongoDB!");
        const db = client.db("stock");
        const collection = db.collection("PublicCompanies");

        // Clear existing data
        await collection.deleteMany({});
        console.log("Cleared existing data.");

        // Read CSV file
        const fileName = "companies.csv";
        const data = fs.readFileSync(fileName, 'utf8');
        const lines = data.split('\n');

        // Insert data into MongoDB
        for (let line of lines) {
            const [companyName, stockTicker, stockPrice] = line.split(',');
            if (companyName && stockTicker && stockPrice) {
                await collection.insertOne({
                    companyName: companyName.trim(),
                    stockTicker: stockTicker.trim(),
                    stockPrice: parseFloat(stockPrice.trim()),
                });
                console.log(`Inserted: ${companyName}, ${stockTicker}, ${stockPrice}`);
            }
        }

        console.log("Data insertion complete!");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.close();
        console.log("Connection closed.");
    }
}

loadCSVData();
