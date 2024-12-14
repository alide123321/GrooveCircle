const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const env = require('dotenv').config();
const session = require('express-session');
const fetch = require('node-fetch');
const { MongoClient, ServerApiVersion } = require('mongodb'); // Import MongoDB client
const methodsPath = path.join(__dirname, 'Methods');
const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.on('connection', (socket) => {
	socket.on('joinRoom', (room) => {
		socket.join(room);
	});

	socket.on('leaveRoom', (room) => {
		socket.leave(room);
	});

	socket.on('sendchatMessage', async (data) => {
		// Save message to database using your existing endpoint
		const response = await fetch(`http://localhost:${process.env.PORT}/sendMessageGroup`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				userid: data.userid,
				chatroomid: data.chatroomId,
			},
			body: JSON.stringify({ messageContent: data.message }),
		});

		if (response.ok) {
			// Broadcast message to room
			io.to(data.chatroomId).emit('message', {
				message: data.message,
				sender: data.userid,
				timestamp: new Date(),
			});
		}
	});

	socket.on('sendMessage', async (data) => {
		// Save message to database using your existing endpoint
		const response = await fetch(`http://localhost:${process.env.PORT}/SendMessageDM`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				userid: data.userid,
				friendid: data.friendid,
			},
			body: JSON.stringify({ messageContent: data.messageContent }),
		});

		if (response.ok) {
			// Broadcast message to the recipient
			io.to(data.room).emit('receiveMessage', {
				messageContent: data.messageContent,
				sender: data.userid,
				friendid: data.friendid,
				timestamp: new Date(),
			});
		}
	});
});

// Change app.listen to http.listen
//http.listen(process.env.PORT);

// use express-session to store access token and refresh token
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false },
	})
);
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use(cors());
app.use(cookieParser());

// MongoDB client setup
const uri = `mongodb+srv://${encodeURIComponent(process.env.MONGO_DB_USER)}:${encodeURIComponent(
	process.env.MONGO_DB_PASSWORD
)}@testcluster1.yoy0t.mongodb.net/?retryWrites=true&w=majority&appName=testCluster1`;
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function runMongoDB() {
	try {
		await client.connect();
		await client.db('admin').command({ ping: 1 });
		console.log('Pinged your deployment. You successfully connected to MongoDB!');
	} catch (e) {
		console.error('ERR', e);
	} finally {
		await client.close();
	}
}
runMongoDB().catch(console.dir);

// Function to recursively get all files in a directory
function getFiles(dir) {
	let files = [];
	fs.readdirSync(dir).forEach((file) => {
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
files.forEach((file) => {
	const router = require(file);
	const routePath = `/${path.basename(file, path.extname(file))}`;

	try {
		app.use(routePath, router);
	} catch (error) {
		console.error(`Failed to use route ${routePath}: ${error}`);
	}
});

http.listen(process.env.PORT);

module.exports = app;
