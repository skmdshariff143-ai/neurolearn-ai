const key = process.env.NEBIUS_API_KEY,
  model = process.env.NEBIUS_MODEL;
if (!key || !model) {
  console.error(
    "BLOCKED: NEBIUS_API_KEY and NEBIUS_MODEL are required. No inference call made.",
  );
  process.exit(2);
}
if (!/nvidia\/.*nemotron/i.test(model)) {
  console.error("Choose an NVIDIA Nemotron model ID from your account.");
  process.exit(2);
}
const response = await fetch(
  "https://api.tokenfactory.nebius.com/v1/chat/completions",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content:
            "Explain in one sentence why a transformer needs changing magnetic flux.",
        },
      ],
      max_tokens: 120,
    }),
    signal: AbortSignal.timeout(20000),
  },
);
if (!response.ok) {
  console.error(`FAIL: HTTP ${response.status}`);
  process.exit(1);
}
const data = await response.json();
if (!data.choices?.[0]?.message?.content) {
  console.error("FAIL: no generated content");
  process.exit(1);
}
console.log(
  JSON.stringify({
    verifiedAt: new Date().toISOString(),
    model,
    response: data.choices[0].message.content,
    usage: data.usage,
  }),
);
