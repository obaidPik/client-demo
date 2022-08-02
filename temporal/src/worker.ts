import { Worker, NativeConnection } from "@temporalio/worker";
import * as activities from "./activities";

const dotenv = require('dotenv');

dotenv.config();
async function run() {
  const connection = await NativeConnection.connect({
    address: process.env.TEMPORAL_SERVER_URL, // defaults port to 7233 if not specified
  });

  const worker = await Worker.create({
    connection,
    workflowsPath: require.resolve('./workflows'),
        activities,
        taskQueue: 'ecommerce-oneclick',
  });
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});