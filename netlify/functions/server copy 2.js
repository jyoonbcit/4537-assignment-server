// Before
// import express from 'express';
// import dotenv from 'dotenv';
// import url from 'url';

// After
const express = require('express');
const dotenv = require('dotenv');
const url = require('url');

require('dotenv').config();

const app = express();
const path = require('path');
const fs = require('fs');

// Direct paths to the index.html file and OpenAPI spec file since they're in the same directory
const swaggerUiHtmlPath = path.join(__dirname, 'index.html');
const openApiSpecPath = path.join(__dirname, 'openapi.json');

// Serve your OpenAPI spec file
app.get('/openapi.json', (req, res) => {
	res.sendFile(openApiSpecPath);
});

// Serve the modified index.html from Swagger UI that uses your OpenAPI spec
app.get('/', (req, res) => {
	fs.readFile(swaggerUiHtmlPath, 'utf8', (err, data) => {
		if (err) {
			console.error('Error reading Swagger UI index.html:', err);
			return res.status(500).send('Error loading documentation');
		}
		// Replace the URL placeholder with the actual path to the OpenAPI spec
		const result = data.replace(
			'url: "https://petstore.swagger.io/v2/swagger.json"',
			'url: "/openapi.json"'
		);
		res.send(result);
	});
});
// Correcting the server start-up process
const port = process.env.PORT || 4000; // Make sure the port matches everywhere
app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});


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

module.default = async (req, res) => {
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