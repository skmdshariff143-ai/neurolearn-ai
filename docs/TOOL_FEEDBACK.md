# Tool feedback from actual use

Prepared 2026-10-14. These observations are not learner-outcome measurements.

## Tavily

The actual application smoke returned HTTP 200, four schema-valid HTTPS results and two accepted references after filtering repair. A fixed 0.5 score threshold had discarded every result; accepting moderate scores only with meaningful topic overlap recovered relevant induction/transformer sources. Basic search, four-result limit, explicit parameter controls, timeout, request deduplication and process-local caching suit a small-credit prototype. Ranking and keyword overlap do not establish source authority or claim-level correctness. The cache is not shared across serverless instances; external quotas must remain server-side. See BUILD_STATUS.md and ignored local smoke evidence for exact results.

## LangSmith

Actual trace write/read, project association, input/output redaction and synthetic feedback readback passed. Aggregate rubric/misconception metrics can be retained without raw learner text. Synthetic privacy tests cover real service boundaries through mock transport; they do not prove live-model reasoning or educational efficacy. The installed SDK warns that readRun is deprecated after January 31, 2027. Ordinary reads internally override retry configuration, while trace ingestion respects the configured zero retries; this deserves clearer SDK behavior. Full inference usage/latency tracing awaits a working authorized model.

## Nebius/NVIDIA

BLOCKED: no usable key/model configuration, catalog access or live inference evidence. The official API format and account-catalog check are prepared. No observed inference performance, multilingual quality or Token Factory acceleration can be claimed yet. Complete this feedback only after a genuine authorized runtime call.

## Vercel

The connector project-creation request failed with 403; authenticated CLI setup succeeded on the intended Hobby workspace. Protection and fixture environment readback worked. Both an omitted-target API attempt and a later explicit Preview CLI attempt were classified Production. Each was canceled and removed; the latter cancellation showed no assigned alias. A dry run did not establish the actual deployment target. Requests should reliably honor an explicit environment before creating a deployment, or reject it clearly. No safe hosted application/accessibility verification exists.

No purchase, external feedback message, submission or video publication was made.
