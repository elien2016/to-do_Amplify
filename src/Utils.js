import { loadStripe } from '@stripe/stripe-js';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function subscribePhoto(email) {
  const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUB_KEY);

  const { error } = await stripe.redirectToCheckout({
    lineItems: [
      { price: process.env.REACT_APP_STRIPE_SUBSCRIPTION_ITEM, quantity: 1 },
    ],
    mode: 'subscription',
    successUrl: window.location.href,
    cancelUrl: window.location.href,
    customerEmail: email,
  });
  if (error) {
    console.log('error completing subscription:', error.message);
  }
}

export { delay, subscribePhoto };
