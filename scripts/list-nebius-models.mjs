if (!process.env.NEBIUS_API_KEY) {
  console.error("BLOCKED: NEBIUS_API_KEY missing; no catalog request made.");
  process.exit(2);
}
try {
  const response = await fetch(
    "https://api.tokenfactory.nebius.com/v1/models",
    {
      headers: { Authorization: `Bearer ${process.env.NEBIUS_API_KEY}` },
      signal: AbortSignal.timeout(15000),
    },
  );
  if (!response.ok) throw new Error();
  const catalog = await response.json();
  const models = catalog.data?.filter((model) =>
    /^nvidia\/.*nemotron/i.test(model.id),
  );
  if (!Array.isArray(models)) throw new Error();
  console.log(
    JSON.stringify(
      {
        retrievedAt: new Date().toISOString(),
        nvidiaNemotronModelIds: models.map((model) => model.id),
      },
      null,
      2,
    ),
  );
} catch {
  console.error(
    "FAIL: authenticated model catalog could not be read. No inference was requested.",
  );
  process.exit(1);
}
