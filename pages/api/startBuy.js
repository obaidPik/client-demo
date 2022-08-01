import { WorkflowClient,Connection } from '@temporalio/client';
import { OneClickBuy } from '../../temporal/lib/workflows.js';

export default async function startBuy(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' });
    return;
  }

  const { itemId, transactionId,price } = req.body;
  if (!itemId) {
    res.status(405).send({ message: 'must send itemId to buy' });
    return;
  }
  // const client =;
  // Connect to localhost with default ConnectionOptions,
  // pass options to the Connection constructor to configure TLS and other settings.
  // Workflows will be started in the "default" namespace unless specified otherwise
  // via options passed the WorkflowClient constructor.

  const connection = await Connection.connect({
    address: '44.202.2.174', // defaults port to 7233 if not specified
  });
  const client = new WorkflowClient({
    connection,
  });
  // kick off the purchase async
  const handle = await client.start(OneClickBuy, {
    taskQueue: 'ecommerce-oneclick',
    workflowId: transactionId,
    args: [itemId,parseInt(price.split('$')[1]),process.env],
  });
  const result = await handle.result();
  res.status(200).send({ status: result.status});
}
