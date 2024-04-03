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
			const text = req.query.input;
            const data = await query({ // Await the result of the query function
				// TODO: Change inputs to req.query.text
                "inputs": text
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
				JSON.stringify({ error: error.message})
			);
        }
    }
};