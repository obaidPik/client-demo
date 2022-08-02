import { WorkflowClient, Connection } from '@temporalio/client';

const dotenv = require('dotenv');

dotenv.config();

export default async function cancelBuy(req, res) {
  const { id } = req.query;
  if (!id) {
    res.status(405).send({ message: 'must send workflow id to cancel' });
    return;
  }

  const connection = await Connection.connect({
    address: process.env.TEMPORAL_SERVER_URL, // defaults port to 7233 if not specified
  });
  const client = new WorkflowClient({
    connection,
  });

  const workflow = client.getHandle(id);
  try {
    await workflow.signal('cancelPurchase');
    res.status(200).json({ cancelled: id });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e.details, errorCode: e.code });
    return;
  }
}