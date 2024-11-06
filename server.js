const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const env = require('dotenv').config();
const session = require('express-session');
const { MongoClient, ServerApiVersion } = require('mongodb'); // Import MongoDB client
const methodsPath = path.join(__dirname, 'Methods');

const app = express();

// use express-session to store access token and refresh token
app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(express.json())

app.use(express.static(path.join(__dirname, 'public')))
   .use(cors())
   .use(cookieParser());

// MongoDB client setup
const uri = `mongodb+srv://${encodeURIComponent(process.env.MONGO_DB_USER)}:${encodeURIComponent(process.env.MONGO_DB_PASSWORD)}@testcluster1.yoy0t.mongodb.net/?retryWrites=true&w=majority&appName=testCluster1`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function runMongoDB() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (e) {  
        console.error("ERR", e);
    } finally {
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
