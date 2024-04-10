import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

async function query(data) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/humarin/chatgpt_paraphraser_on_T5_base", {
		headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
		method: "POST",
		body: JSON.stringify(data),
	}
	);
	if (!response.ok) {
		throw new Error(`Server error: ${response.status}`);
	}
	return await response.json();
}

exports.handler = async (event) => {
	if (event.httpMethod === 'OPTIONS') {
		return {
			statusCode: 200,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type',
			},
			body: '',
		};
	}

	// Assuming you might use event.path to differentiate further API routes
	if (event.httpMethod === 'GET') {
		try {
			const params = new URLSearchParams(event.queryStringParameters);
			const inputs = params.get('input'); // Example use case

			const data = await query({ inputs });
			return {
				statusCode: 200,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			};
		} catch (error) {
			console.error(error);
			return {
				statusCode: 500,
				headers: { 'Access-Control-Allow-Origin': '*' },
				body: JSON.stringify({ error: error.message }),
			};
		}
	}

	// Method not allowed
	return {
		statusCode: 405,
		headers: { 'Access-Control-Allow-Origin': '*' },
		body: 'Method Not Allowed',
	};
};
