# Next.js + Temporal

This example shows how to use [Temporal](https://docs.temporal.io/) with Next.js.
Demonstrate orchestration of customer and order service.


## Instructions

```bash
cd nextjs-ecommerce-oneclick # navigate into this folder
npm i
npm run dev
```

The `dev` script does 3 things:

- runs `next dev` which opens the frontend on [localhost:3000](http://localhost:3000)
- runs `temporal:dev` which runs the Temporal Worker, Workflows, and Activities code through the TypeScript compiler in watch mode
- runs `temporal:worker` which runs the compiled `worker.ts` file

## Demo

- http://localhost:3000/ (index) shows a realistic e-commerce situation where some of the state is managed on the frontend.


- Click "Buy item"
- Flow
  - The purchase will go in pending state
  - After the credit has been reserved by the customer service, the purchase will be confirmed/cancelled
  - Within 5s of purchase, if clicked cancelled, the purchase is cancelled.
  
## Architecture Discussion

This example makes two decisions which often generate questions:

1. Modeling the timeout on the clientside as well as in the Temporal workflow
   - This is a UX tradeoff, not a necessary design choice
   - You can equally have the frontend poll an API endpoint that runs a query on the workflow if precision/single source of truth is important to you
   - Long polling or websocket subscriptions model is also possible for more instantaneous update but probably would require a different API architecture
2. Next.js frontend talking to a Next.js API route, instead of talking to Temporal directly
   - Temporal Clients use gRPC to talk to Temporal Server, therefore it is easier to do it from the serverside than from the browser, particularly where auth secrets are involved
   - However we do have users that use `grpc-web` on the frontend directly and do authz on the backend through authz middleware on an ambassador router/envoy proxy.

## Deploy

This sample project is deployed on heroku server. 
Demo - [Temporal.io purchase-reserve credit app](https://temporal-demo-client.herokuapp.com/)

Build - npm run build
Serve - npm start

on build temporal and next app is built parallelly. On 'npm start' next app and worker are run.

## nextjs-ecommerce-oneclick/temporal
### worker.ts
- imports Worker, NativeConnection module from "@temporalio/worker"
- create a connection the temporal server (server address is provided as option)
- create worker using Worker
  - connection
  - workflow.ts path
  - taskQueue name (same will be maintained in the temporal sever)
  - activities
- run the worker

Read more about [worker](https://docs.temporal.io/workers/)

### activities.ts - actions
Define actions that are needed to execute the workflow
- canceledPurchase 
- purchaseFailed
- reserveCredit
- checkoutItem

Read more about [activities](https://docs.temporal.io/activities/)

### workflows.ts
Define workflows
- define query purchaseState
- define signal cancelPurchase
- wait for the cancel signal from user for 5s, if recieved cancel the purchase.
- execute child workflow - reserverCredit 
- execure reserveCredit activity
- on the result cancel/confirm purchase (execute activities)

Read more about [workflows](https://docs.temporal.io/workflows/)


## Signal Cancel

The workflow has to be signaled if the user cancels the purchase. 
- create connection like in worker.ts
- create a workflow-client (provide the connection)
- get workflow handle by passing the workflow id 
- signal by workflow.signal('cancelPurchase')

Read more about - [workflow clients](https://docs.temporal.io/typescript/clients/), [/how-to-use-signals-in-typescrip](https://docs.temporal.io/typescript/how-to-use-signals-in-typescript/)

