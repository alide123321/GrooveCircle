const { MongoClient } = require("mongodb");
const uri = `mongodb+srv://${encodeURIComponent(process.env.MONGO_DB_USER)}:${encodeURIComponent(process.env.MONGO_DB_PASSWORD)}@testcluster1.yoy0t.mongodb.net/?retryWrites=true&w=majority&appName=testCluster1`; // for testCluster1
const client = new MongoClient(uri);
const database = client.db('groovecircle');

module.exports = { database };