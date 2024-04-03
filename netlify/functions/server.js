const http = require('http');
const dotenv = require('dotenv');
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

const server = http.createServer(async (req, res) => {
	// Allow origin all
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	res.setHeader('Content-Type', 'application/json');
	if (req.method === 'OPTIONS') {
		res.writeHead(200);
		res.end();
		return;
	}
    if (req.method === 'GET') {
        try {
            const data = await query({ // Await the result of the query function
                "inputs": "Hello, how are you?"
            });
            res.end(JSON.stringify(data[0].generated_text)); // Send response after await
        } catch (error) {
            console.error(error);
            res.end(JSON.stringify({ error: error.message }));
        }
    }
}).listen(3000, () => {
    console.log('Server is running.');
});