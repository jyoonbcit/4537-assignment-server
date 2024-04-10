// import fetch from 'node-fetch';
// import dotenv from 'dotenv';
// dotenv.config();

// async function query(data) {
// 	const response = await fetch(
// 		"https://api-inference.huggingface.co/models/humarin/chatgpt_paraphraser_on_T5_base", {
// 		headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
// 		method: "POST",
// 		body: JSON.stringify(data),
// 	}
// 	);
// 	if (!response.ok) {
// 		throw new Error(`Server error: ${response.status}`);
// 	}
// 	return await response.json();
// }

// exports.handler = async (event) => {
// 	if (event.httpMethod === 'OPTIONS') {
// 		return {
// 			statusCode: 200,
// 			headers: {
// 				'Access-Control-Allow-Origin': '*',
// 				'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
// 				'Access-Control-Allow-Headers': 'Content-Type',
// 			},
// 			body: '',
// 		};
// 	}

// 	// Assuming you might use event.path to differentiate further API routes
// 	if (event.httpMethod === 'GET') {
// 		try {
// 			const params = new URLSearchParams(event.queryStringParameters);
// 			const inputs = params.get('input'); // Example use case

// 			const data = await query({ inputs });
// 			return {
// 				statusCode: 200,
// 				headers: {
// 					'Access-Control-Allow-Origin': '*',
// 					'Content-Type': 'application/json',
// 				},
// 				body: JSON.stringify(data),
// 			};
// 		} catch (error) {
// 			console.error(error);
// 			return {
// 				statusCode: 500,
// 				headers: { 'Access-Control-Allow-Origin': '*' },
// 				body: JSON.stringify({ error: error.message }),
// 			};
// 		}
// 	}

// 	// Method not allowed
// 	return {
// 		statusCode: 405,
// 		headers: { 'Access-Control-Allow-Origin': '*' },
// 		body: 'Method Not Allowed',
// 	};
// };

import dotenv from 'dotenv';
import url from 'url';
import path from 'path';
import { promises as fs } from 'fs';
import fetch from 'node-fetch'; // Ensure you have node-fetch installed

dotenv.config();

export async function handler(event) {
	const requestPath = event.path;

	// Handle API requests for querying the model
	if (requestPath.startsWith('/api')) {
		const queryParams = url.parse(event.rawUrl).query;
		const queryObject = new url.URLSearchParams(queryParams);
		const inputs = queryObject.get('input'); // Assuming 'input' is the query param

		try {
			const data = await query({ inputs });
			return {
				statusCode: 200,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			};
		} catch (error) {
			return {
				statusCode: 500,
				body: JSON.stringify({ error: error.message }),
			};
		}
	}

	// For any other path, return 404
	return {
		statusCode: 404,
		body: 'Not Found',
	};
}

async function serveStaticFile(filename, contentType) {
	const filePath = path.join(PUBLIC_PATH, filename);
	try {
		const fileContents = await fs.readFile(filePath, 'utf8');
		return {
			statusCode: 200,
			headers: { 'Content-Type': contentType },
			body: fileContents,
		};
	} catch (error) {
		return {
			statusCode: 404,
			body: JSON.stringify({ error: "The requested file was not found." }),
		};
	}
}

async function query(data) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/humarin/chatgpt_paraphraser_on_T5_base",
		{
			headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	if (!response.ok) {
		throw new Error(`Server error: ${response.status}`);
	}
	const result = await response.json();
	return result;
}