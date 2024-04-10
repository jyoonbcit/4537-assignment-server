import { promises as fs } from 'fs';

import dotenv from 'dotenv';
import url from 'url';
import path from 'path';

dotenv.config();

const PUBLIC_PATH = path.resolve(__dirname, '../../public');

export async function handler(event) {
	const requestPath = event.path;

	// Serve the OpenAPI spec if requested
	if (requestPath.includes('openapi.json')) {
		const specPath = path.join(PUBLIC_PATH, 'openapi.json');
		try {
			const openapiSpec = await fs.readFile(specPath, 'utf8');
			return {
				statusCode: 200,
				headers: { 'Content-Type': 'application/json' },
				body: openapiSpec,
			};
		} catch (error) {
			return {
				statusCode: 404,
				body: JSON.stringify({ error: "The requested file was not found." }),
			};
		}
	}

	// For any other path, return 404
	return {
		statusCode: 404,
		body: 'Not Found',
	};
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
	const result = await response.json();
	return result;
}

export default async (req, res) => {
	// Allow origin all
	const headers = {
		// TODO: Change origin to client domain
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'OPTIONS, GET',
		'Access-Control-Allow-Headers': 'Content-Type',
		'Content-Type': 'application/json',
	};
	// res.setHeader('Access-Control-Allow-Origin', '*');
	// res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
	// res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	// res.setHeader('Content-Type', 'application/json');
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
};