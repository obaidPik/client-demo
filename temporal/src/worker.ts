import {Worker, NativeConnection} from "@temporalio/worker";
import * as activities from "./activities";

async function run() {
  const connection = await NativeConnection.connect({
    address: '44.202.2.174', // defaults port to 7233 if not specified
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