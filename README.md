# High-Throughput Webhook Processor

#### This is a Node.js HTTP server that accepts incoming webhook POST requests and queues them for processing. The system should support high concurrency, manage load effectively, and expose observability endpoints and logs

## Quick run

```bash
git clone 
cd my-app/
docker compose up -d
```

To check status, run:

```bash
docker compose logs
```

## Alternatively

```bash
npm install

npm run dev
```

#### NOTE: Ensure that you have your local variables set as shown in `.env.development.local`

## Tests

```bash
 npm run test
```
