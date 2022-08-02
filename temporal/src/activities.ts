
// import fetch from "node-fetch";
const fetch = require('node-fetch');
const dotenv = require('dotenv');

dotenv.config();

export async function checkoutItem(itemId: string): Promise<object> {
  return ({
    status: 'success',
    message:`checking out ${itemId}!`
  });
}
export async function canceledPurchase(itemId: string): Promise<object> {
  return ({
    status: 'cancel',
    message:`cancel purchase ${itemId}!`
  });
}
export async function purchaseFailed(itemId:string):Promise<object> {
  return ({
    status: 'failed',
    message:`cancel purchase ${itemId}!`
  })
}

export async function reserveCredit(amount:number) {
  
  const url = `${process.env.NEXT_PUBLIC_API_URL}api/reserveCredit?amount=${amount}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.message === 'success') {
    return {
      status:'success'
    }
  } else {
    return {
      status:'failed'
    }
  }
}