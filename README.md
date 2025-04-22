# High-Throughput Webhook Processor

#### This is a Node.js HTTP server that accepts incoming webhook POST requests and queues them for processing. The system should support high concurrency, manage load effectively, and expose observability endpoints and logs

## Quick run
#### NOTE: Be sure to have docker running

```bash
git clone https://github.com/iAmCodeHead/webhook-Processor.git webhook-processor
cd webhook-processor/
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

```bash
QUEUE_NAME=webhookprocessor # give your queue a name
MAX_PARALLEL_JOBS=10 # this is the number of items you want to process in parallel
QUEUE_RATE_LIMIT=100 # Once the pending Queue get to this limit, all incoming requests are ignored with a 429 error
TRIGGER_QUEUES_IN_MS=50000 # how often the system triggers queue processing
REDIS_HOST="127.0.0.1"
REDIS_PORT=6379
SIMULATE_FAILURE=true # simualate a 10% failure or not
```

#### NOTE: Ensure that you have redis installed on your local computer

Your app should be available of PORT `3000` or any other port you configured.

## Endpoints

There are 2 endpoints as shown below:

1. `/webhook`

This endpoint received an arbitrary JSON payload and queues is for processing and returns a `202`

```json
# /webhook
{
    "event": "payment",
    "paymentId": 1,
}
```

An empty JSON payload `{}` returns a `422` error.

2. `/metrics`

This endpoint returns a set of metrcis partaning to the queue with a status of `200`.

```json
# /metrics
{
    "message": "Request Successful",
    "data": {
        "totalRequestsReceived": 146,
        "totalRequestsProcessed": 57,
        "currentQueueLength": 0,
        "total429sReturned": 9,
        "averageProcessingTime": 9061.81,
        "totalFailedJobs": 0
    }
}
```

## Tests

```bash
 npm run test
```
