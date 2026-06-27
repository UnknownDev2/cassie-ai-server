import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const GROQ_KEY = process.env.GROQ_KEY;

const MODEL = "openai/gpt-oss-20b";

app.post("/ai", async (req, res) => {
	try {
		const { personality, input, memory, character } = req.body;

		if (!GROQ_KEY) {
			return res.status(500).json({
				answer: "Server misconfigured (missing API key)"
			});
		}

		const messages = [
			{
				role: "system",
				content:
					(personality || "") +
					"\n\nMemory:\n" +
					(memory || "") +
					"\n\nCharacter: " +
					(character || "")
			},
			{
				role: "user",
				content: input || ""
			}
		];

		const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${GROQ_KEY}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				model: MODEL,
				messages,
				temperature: 0.8
			})
		});

		const data = await response.json();

		if (!response.ok) {
			console.error("Groq error:", JSON.stringify(data, null, 2));

			return res.status(500).json({
				answer: "AI request failed",
				error: data
			});
		}

		const answer = data?.choices?.[0]?.message?.content;

		if (!answer) {
			return res.json({
				answer: "..."
			});
		}

		return res.json({
			answer
		});
	} catch (err) {
		console.error("Server crash:", err);

		return res.status(500).json({
			answer: "Server error"
		});
	}
});

app.listen(process.env.PORT || 3000, () => {
	console.log("AI server running");
});
