/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as wf from '@temporalio/workflow';
import { executeChild, sleep } from '@temporalio/workflow';
// // Only import the activity types
import type * as activities from './activities.js';

const { checkoutItem, canceledPurchase,reserveCredit,purchaseFailed } = wf.proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
  retry: {
    // default retry policy if not specified
    initialInterval: '1s',
    backoffCoefficient: 2,
    maximumAttempts: 10,
    nonRetryableErrorTypes: [],
  },
});

type PurchaseState = 'PURCHASE_PENDING' | 'PURCHASE_CONFIRMED' | 'PURCHASE_CANCELED';

export const cancelPurchase = wf.defineSignal('cancelPurchase');
export const purchaseStateQuery = wf.defineQuery<PurchaseState>('purchaseState');

// @@@SNIPSTART typescript-oneclick-buy
export async function OneClickBuy(itemId: string,price:number,env:object) {
  const itemToBuy = itemId;

  let purchaseState: PurchaseState = 'PURCHASE_PENDING';
  wf.setHandler(cancelPurchase, () => void (purchaseState = 'PURCHASE_CANCELED'));
  wf.setHandler(purchaseStateQuery, () => purchaseState);

  if (await wf.condition(() => purchaseState === 'PURCHASE_CANCELED', '5s')) {
    return await canceledPurchase(itemToBuy);
  } else {
    
    const response = await executeChild(reserveCreditFunc, { args: [price] });
    
    if (response === 'CREDIT_RESERVED') {
      return await checkoutItem(itemToBuy);
    } else {
      return await purchaseFailed(itemToBuy);
    }
  }

}

export async function reserveCreditFunc(amount: number): Promise<string> {
  const res= await reserveCredit(amount);

  if (res.status==='success') {
    return 'CREDIT_RESERVED'
  }
  return 'CREDIT_RESERVE_FAILED';
}
// @@@SNIPEND
