// Setup environment variables first
const dotenv = require('dotenv');
dotenv.config({ path: './netlify/functions/.env' });


// Core Node.js modules
const http = require('http');
const url = require('url');

// Third-party packages
const fetch = require('node-fetch');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
// Local file imports
const messages = require('./en/lang/messages/user');
const usersModel = require('./models/users');
const sanitize = require('mongo-sanitize');

dotenv.config();


async function query(data) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/humarin/chatgpt_paraphraser_on_T5_base",
		{
			headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}

function parseBody(request, callback) {
	let body = '';
	request.on('data', chunk => {
		body += chunk.toString();
	});
	request.on('end', () => {
		callback(JSON.parse(body));
	});
}

// This function is new and sets up the mongoose connection and server listening
async function main() {
	try {
		await mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log("Connected to db.");

		const port = process.env.PORT || 4000; // Make sure the port matches everywhere
		server.listen(port, () => {
			console.log(`Server is running on http://localhost:${port}`);
		});
	} catch (err) {
		console.log('Database connection failed', err);
		process.exit(1); // Exit in case of connection failure
	}
}

const server = http.createServer(async (req, res) => {
	const reqUrl = url.parse(req.url, true);

	// Common headers
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	// Preflight request handling
	if (req.method === 'OPTIONS') {
		res.writeHead(200);
		res.end();
		return;
	}
	if (req.method === 'GET') {
		try {
			let q = url.parse(req.url, true);
			const data = await query({ // Await the result of the query function
				// TODO: Change inputs to req.query.text
				"inputs": q.query.input
			});
			return new Response(
				JSON.stringify(data),
				{
					status: 200,
					headers: new Headers(headers)
				}
			);
		} catch (error) {
			console.error(error);
			return new Response(
				JSON.stringify({ error: error.message })
			);
		}
	}
	if (req.method === 'POST' && reqUrl.pathname === '/login') {
		let body = '';
		req.on('data', chunk => {
			body += chunk.toString();
		});
		req.on('end', async () => {
			try {
				const bodyData = JSON.parse(body);
				const { email, password } = bodyData;
				const sanitizedEmail = sanitize(email);
				const user = await usersModel.findOne({ email: sanitizedEmail }).exec();
				if (!user) {
					res.writeHead(401, { 'Content-Type': 'text/html' });
					res.end('<h1>User not found</h1>');
					return;
				}
				if (bcrypt.compareSync(password, user.password)) {
					const token = jwt.sign({
						email: sanitizedEmail,
						username: user.username,
						isAdmin: user.isAdmin
					}, process.env.SESSION_SECRET, { expiresIn: '1h' });

					user.loginRequests++;
					await user.save();

					res.writeHead(200, {
						'Set-Cookie': `jwt=${token}; HttpOnly; Path=/; Max-Age=3600`,
						'Content-Type': 'text/html'
					});
					const redirectPath = user.isAdmin ? '/admin' : '/members';
					res.end(`<html><body><script>window.location.href = "${redirectPath}"</script></body></html>`);
				} else {
					res.writeHead(401, { 'Content-Type': 'text/html' });
					res.end('<h1>Incorrect password</h1>');
				}
			} catch (error) {
				console.error(error);
				res.writeHead(500, { 'Content-Type': 'text/html' });
				res.end('<h1>Internal Server Error</h1>');
			}
		});
	} else {
		// Handle other routes or methods
		res.writeHead(404, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ error: "Not Found" }));
	}
});
// server.listen(4000, () => {
// 	console.log('Server running on http://localhost:4000');
// });

// Call main to start the server and database connection
main().catch(err => console.log(err));