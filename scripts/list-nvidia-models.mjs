const apiKey = process.env.NVIDIA_API_KEY;
if (!apiKey || /^(?:PASTE_|YOUR_|PLACEHOLDER|<)/i.test(apiKey.trim())) {
  console.log(JSON.stringify({ status: "blocked", reason: "NVIDIA_API_KEY is not configured or is placeholder" }, null, 2));
  process.exit(0);
}

try {
  const response = await fetch("https://integrate.api.nvidia.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey.trim()}` },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    console.log(JSON.stringify({ status: "error", httpStatus: response.status, message: "Catalog request failed" }, null, 2));
    process.exit(0);
  }

  const data = await response.json();
  const models = (data.data || []).map((m) => m.id);
  const nemotronModels = models.filter((m) => /nemotron/i.test(m));

  console.log(JSON.stringify({
    status: "ok",
    totalModels: models.length,
    nemotronModels,
    targetModelAvailable: models.includes("nvidia/nemotron-3.5-super-vl-120b-a12b"),
  }, null, 2));
} catch (e) {
  console.log(JSON.stringify({ status: "error", error: e instanceof Error ? e.message : String(e) }, null, 2));
}
