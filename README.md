# High-Throughput Webhook Processor

#### This is a Node.js HTTP server that accepts incoming webhook POST requests and queues them for processing. The system should support high concurrency, manage load effectively, and expose observability endpoints and logs

## Quick run
#### NOTE: Be sure to have docker running

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

#### NOTE: Ensure that you have your local variables set as shown in `.env.development.local`

## Tests

```bash
 npm run test
```
