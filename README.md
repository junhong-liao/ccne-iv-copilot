# ccne-iv-copilot

## Environment variables

Create a `.env.local` file and populate the Cerebras credentials when wiring the report generator to a real backend:

```
CEREBRAS_API_URL=https://example.com/v1/generate
CEREBRAS_API_KEY=example-token
```

Leaving these unset falls back to a local placeholder document useful for development.

## Temporary report storage

Generated reports are cached in-memory for 15 minutes and exposed through signed download URLs under
`/api/generateReport/:token`. Rotate the process or restart the server to clear any lingering artifacts when deploying.
