// import fetch from "node-fetch";
const fetch = require('node-fetch');

export async function checkoutItem(itemId: string): Promise<object> {
  return ({
    status: 'success',
    message:`checking out ${itemId}!`
  });
}
export async function canceledPurchase(itemId: string): Promise<object> {
  return ({
    status: 'failed',
    message:`cancel purchase ${itemId}!`
  });
}

export async function reserveCredit(amount:number) {
  
  console.log('reserving credit....');
  const url = `http://localhost:3000/api/reserveCredit?amount=${amount}`;
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