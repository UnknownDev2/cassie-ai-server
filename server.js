import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_KEY = "PUT_NEW_KEY_HERE";

app.post("/ai", async (req, res) => {
	const { personality, input, memory } = req.body;

	const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${GROQ_KEY}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			model: "llama-3.1-70b-versatile",
			messages: [
				{ role: "system", content: personality + "\n\nMemory:\n" + (memory || "") },
				{ role: "user", content: input }
			]
		})
	});

	const data = await response.json();
	res.json({ answer: data?.choices?.[0]?.message?.content || "..." });
});

app.listen(process.env.PORT || 3000);
