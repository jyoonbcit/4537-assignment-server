import dotenv from 'dotenv';
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

export default async (req, res) => {
	// Allow origin all
	const headers = {
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
            const data = await query({ // Await the result of the query function
                "inputs": "Hello, how are you?"
            });
			return {
				statusCode: 200,
				headers: headers,
				body: JSON.stringify(data[0].generated_text)
			};
        } catch (error) {
            console.error(error);
			return {
				statusCode: 200,
				headers: headers,
				body: JSON.stringify({ error: error.message})
    		};
        }
    }
};