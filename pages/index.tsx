import Head from 'next/head';
import React, { useEffect } from 'react';
import { v4 as uuid4 } from 'uuid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CountUp from 'react-countup';

function fetchAPI(str, obj?: RequestInit) {
  return fetch(str, obj)
    .then(async (res) => {
      console.log(res);
      if (res.ok) return res.json();
      try {
        const { message, errorCode } = await res.json();
        throw new Error(errorCode + ': ' + message);
      } catch (err) {
        throw new Error(res.status + ': ' + res.statusText);
      }
    })
    .catch((err) => {
      console.error(err);
      toast.error(err, {
        position: 'top-right',
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
      });
      // throw err
    });
}

export default function Bones() {
  return (
    <div className="pt-8 pb-80 sm:pt-12 sm:pb-40 lg:pt-24 lg:pb-48">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 sm:static">
        <Head>
          <title>Temporal + Next.js Example</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <header className="relative overflow-hidden">
          <div className="sm:max-w-lg">
            <h1 className="text-4xl font font-extrabold tracking-tight text-gray-900 sm:text-6xl">
              Temporal.io Purchase, Reserve Credit Demo
            </h1>
            <p className="mt-4 text-xl text-gray-500">
              Buy Something. We check if you have enough credits to buy the item and approve your purchase.
            </p>
          </div>
        </header>
        <ToastContainer />
        <ProductList />
      </div>
    </div>
  );
}

const products = [
  {
    id: 1,
    name: 'Fusion',
    category: 'Icon set',
    href: '#',
    price: '$49',
    imageSrc: 'https://tailwindui.com/img/ecommerce-images/product-page-05-related-product-01.jpg',
    imageAlt:
      'Payment application dashboard screenshot with transaction table, financial highlights, and main clients on colorful purple background.',
  },
  {
    id: 2,
    name: 'Icons',
    category: 'Icon set',
    href: '#',
    price: '$149',
    imageSrc: 'https://tailwindui.com/img/ecommerce-images/product-page-05-related-product-02.jpg',
    imageAlt:
      'Payment application dashboard screenshot with transaction table, financial highlights, and main clients on colorful purple background.',
  },
  {
    id: 3,
    name: 'Scaffold',
    category: 'Icon set',
    href: '#',
    price: '$99',
    imageSrc: 'https://tailwindui.com/img/ecommerce-images/product-page-05-related-product-03.jpg',
    imageAlt:
      'Payment application dashboard screenshot with transaction table, financial highlights, and main clients on colorful purple background.',
  },
  {
    id: 4,
    name: 'Bone',
    category: 'Icon set',
    href: '#',
    price: '$249',
    imageSrc: 'https://tailwindui.com/img/ecommerce-images/product-page-05-related-product-04.jpg',
    imageAlt:
      'Payment application dashboard screenshot with transaction table, financial highlights, and main clients on colorful purple background.',
  },
];

function ProductList() {
  const [credit, setCredit] = React.useState<number>(0);
  const [oldCredit, setOldCredit] = React.useState<number>(0);
  
  function handleStateChange(flag:number) {
    if (flag != 0) {
      setOldCredit(credit);
      setCredit(credit - flag);
    } else {
      setOldCredit(credit);
      checkCredit();
    }
    
  }

  function checkCredit(){
    fetchAPI('/api/getCredit').then(res=>setCredit(res.message));
  }

  return (
    <div className="bg-white">
      <div className='counter-wrap'>
        <div className='counter-title'>
          Available Credit
        </div>
        {typeof window !== 'undefined'&&<CountUp start={oldCredit} end={credit} prefix={'$'} duration={1} /> }
        
      </div>
      <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 sm:gap-y-10 md:grid-cols-4">
          {products.map((product) => (
            <Product product={product} onChange={(flag)=>handleStateChange(flag)} key={product.id} />
          ))}
        </div>
      </div>
    </div>
  );
}

type ITEMSTATE = 'NEW' | 'SENDING' | 'ORDERED'| 'ORDER_PENDING' | 'CONFIRMED' | 'CANCELLING' | 'ERROR';

function Product({ product,onChange }) {
  const itemId = product.id;
  const price = product.price;
  const [state, setState] = React.useState<ITEMSTATE>('NEW');
  const stateRef = React.useRef<ITEMSTATE>();
  stateRef.current = state;


  useEffect(() => {
    if (state === 'NEW' || state === 'CONFIRMED') {
      onChange(0);
    }
  },[state])

  // Generate a uuid for initiating this transaction.
  // This is generated on this client for idempotency concerns.
  // The request handler starts a Temporal Workflow using this transaction ID as
  // a unique workflow ID, this allows us to retry the HTTP call and avoid
  // purchasing the same product more than once
  // In more advanced scenarios you may want to persist this in LocalStorage or
  // in the backend to be able to resume this transaction.
  const [transactionId, setTransactionId] = React.useState(uuid4());

  const toastId = React.useRef(null);
  function buyProduct() {
    setState('ORDERED');
    onChange(parseInt(price.split('$')[1]));
    toastId.current = toast.success('Order Placed! We will let you know once we confirm your order ', {
      position: 'top-right',
      closeOnClick: true,
      autoClose:2000,
      draggable: true,
      onClose: () => {
        if (stateRef.current === 'ORDERED') {
          setState('ORDER_PENDING');
        } else if (stateRef.current === 'CANCELLING') {
          setState('NEW');
          setTransactionId(uuid4());
        }
      },
    });
    fetchAPI('/api/startBuy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemId, transactionId ,price}),
    }).then((res) => {
      console.log(res);
      if (res.status==='success') {
        setState('CONFIRMED');
        toastId.current = toast.success('Order Confirmed', {
          position: 'top-right',
          closeOnClick: true,
          autoClose:2000,
          draggable: true,
        });
      } else if (res.status === 'cancel') {
        setState('NEW');
        toastId.current = toast.success('Order Cancelled', {
          position: 'top-right',
          closeOnClick: true,
          draggable: true,
        });
      } else {
        setState('NEW');
        toastId.current = toast.success('Order Cancelled - Payment failed', {
          position: 'top-right',
          closeOnClick: true,
          draggable: true,
        });
      }
    //   fetchAPI(`/api/reserveCredit?amount=${100}`, {
    //     method: 'GET',
    //  })
    });
  }
  function cancelBuy() {
    if (state === 'ORDERED') {
      setState('CANCELLING');
      fetchAPI('/api/cancelBuy?id=' + transactionId).catch((err) => {
        setState('ERROR');
        toast.error(err, {
          position: 'top-right',
          autoClose: 5000,
          closeOnClick: true,
          draggable: true,
        });
      });
      toast.dismiss(toastId.current);
    }
  }

  return (
    <div key={product.id} className="relative group">
      <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden bg-gray-100">
        {/* eslint-disable @next/next/no-img-element */}
        <img src={product.imageSrc} alt={product.imageAlt} className="object-center object-cover" />
        <div className="flex items-end p-4" aria-hidden="true">
          {
            {
              NEW: (
                <button
                  onClick={buyProduct}
                  className="w-full bg-white hover:bg-blue-200 bg-opacity-75 backdrop-filter backdrop-blur py-2 px-4 rounded-md text-sm font-medium text-gray-900 text-center"
                >
                  Buy Now
                </button>
              ),
              SENDING: (
                <div className="w-full bg-white hover:bg-blue-200 bg-opacity-75 backdrop-filter backdrop-blur py-2 px-4 rounded-md text-sm font-medium text-gray-900 text-center">
                  Sending...
                </div>
              ),
              ORDERED: (
                <button
                  onClick={cancelBuy}
                  className="w-full bg-white hover:bg-blue-200 bg-opacity-75 backdrop-filter backdrop-blur py-2 px-4 rounded-md text-sm font-medium text-gray-900 text-center"
                >
                  {/* {getState()} */}
                  Click to Cancel
                </button>
              ),
              ORDER_PENDING: (
                <button
                  onClick={cancelBuy}
                  className="w-full bg-white hover:bg-blue-200 bg-opacity-75 backdrop-filter backdrop-blur py-2 px-4 rounded-md text-sm font-medium text-gray-900 text-center"
                >
                  {/* {getState()} */}
                  Order Placed. Pending Confrimation
                </button>
              ),
              CONFIRMED: (
                <div className="w-full  opacity-100 bg-white bg-opacity-75 backdrop-filter backdrop-blur py-2 px-4 rounded-md text-sm font-medium text-gray-900 text-center">
                  Purchased!
                </div>
              ),
              CANCELLING: (
                <div className="w-full bg-white hover:bg-blue-200 bg-opacity-75 backdrop-filter backdrop-blur py-2 px-4 rounded-md text-sm font-medium text-gray-900 text-center">
                  Cancelling...
                </div>
              ),
              ERROR: (
                <button
                  onClick={buyProduct}
                  className="w-full bg-white hover:bg-blue-200 bg-opacity-75 backdrop-filter backdrop-blur py-2 px-4 rounded-md text-sm font-medium text-gray-900 text-center"
                >
                  Error! Click to Retry
                </button>
              ),
            }[state]
          }
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-base font-medium text-gray-900 space-x-8">
        <h3>{product.name}</h3>
        <p>{product.price}</p>
      </div>
      <p className="mt-1 text-sm text-gray-500">{product.category}</p>
    </div>
  );
}
