const model_1 = "poolside/laguna-m.1:free";

export const generateResponse = async (prompt) => {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model_1,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant. You must return only valid raw JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 8000,
        temperature: 0.1,
      }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }
  const data = await response.json();
  return data;
};