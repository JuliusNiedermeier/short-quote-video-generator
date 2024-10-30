// Env config
import { defineString } from 'firebase-functions/params';
import { initializeApp, cert } from 'firebase-admin/app';
import { ServiceAccount } from 'firebase-admin';
import serviceAccount from './service-account.json' assert { type: 'json' };

// Function infrastructure
import { HttpsError, onCall } from 'firebase-functions/v2/https';

// Client libraries
import { Stripe } from 'stripe';
import { getFirestore } from 'firebase-admin/firestore';

interface Payload {
  successUrl: string;
  cancelUrl: string;
}

const stripeSecretKey = defineString('STRIPE_SECRET_KEY');
const stripePriceId = defineString('STRIPE_PRICE_ID');

const stripe = new Stripe(stripeSecretKey.value(), { apiVersion: '2022-11-15' });

initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
  projectId: 'stoic-sage',
  storageBucket: 'stoic-sage.appspot.com',
});

export const create_checkout_session = onCall<Payload>(async (data) => {
  if (!data.auth) throw new HttpsError('unauthenticated', 'You must be authenticated to create a checkout session');

  const firestore = getFirestore();
  let customer: string | undefined;

  try {
    const doc = await firestore.doc('users/' + data.auth.uid).get();
    const stripeData = doc.data()?.stripe;
    if (stripeData?.subscription) throw new HttpsError('cancelled', 'User already subscribed');
    customer = stripeData?.customer;
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    throw new HttpsError('internal', 'Could not fetch a user record');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: stripePriceId.value(), quantity: 1 }],
    success_url: `${data.data.successUrl}?session={CHECKOUT_SESSION_ID}`,
    cancel_url: data.data.cancelUrl,
    client_reference_id: data.auth.uid,
    customer,
  });

  return session.url;
});
