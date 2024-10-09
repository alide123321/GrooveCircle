const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const methodsPath = path.join(__dirname, 'Methods');

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${encodeURIComponent(env.MongoDBUser)}:${encodeURIComponent(env.MongoDBPassword)}@testcluster1.yoy0t.mongodb.net/?retryWrites=true&w=majority&appName=testCluster1`;

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
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
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
    
    console.log(`Setting up route: ${routePath} -> ${file}`);
    
    app.use(routePath, router);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;