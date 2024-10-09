const express = require('express');
const fs = require('fs');
const path = require('path');
const env = require('dotenv').config();

const app = express();
const methodsPath = path.join(__dirname, 'Methods');

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${encodeURIComponent(process.env.MongoDBUser)}:${encodeURIComponent(process.env.MongoDBPassword)}@testcluster1.yoy0t.mongodb.net/?retryWrites=true&w=majority&appName=testCluster1`; // for testCluster1

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function runMongoDB() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (e) {  
        console.error("ERR", e);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
runMongoDB().catch(console.dir);

// Function to recursively get all files in a directory
function getFiles(dir) {
    let files = [];
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            files = files.concat(getFiles(filePath));
        } else {
            files.push(filePath);
        }
    });
    return files;
}

// Get all files in the Methods directory and its subdirectories
const files = getFiles(methodsPath);

// Use each file as a router
files.forEach(file => {
    const router = require(file);
    const routePath = `/${path.basename(file, path.extname(file))}`;
    
    try {
        app.use(routePath, router);
    } catch (error) {
        console.error(`Failed to use route ${routePath}: ${error}`);
    }
    
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;