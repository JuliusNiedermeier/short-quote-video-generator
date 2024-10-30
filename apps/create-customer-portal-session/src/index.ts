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
  returnUrl: string;
}

const stripeSecretKey = defineString('STRIPE_SECRET_KEY');

const stripe = new Stripe(stripeSecretKey.value(), { apiVersion: '2022-11-15' });

initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
  projectId: 'stoic-sage',
  storageBucket: 'stoic-sage.appspot.com',
});

export const create_customer_portal_session = onCall<Payload>(async (data) => {
  if (!data.auth) throw new HttpsError('unauthenticated', 'Unauthenticated');

  const firestore = getFirestore();
  let customer: string | undefined;

  try {
    const doc = await firestore.doc('users/' + data.auth.uid).get();
    customer = doc.data()?.stripe?.customer;
    if (!customer) throw new HttpsError('not-found', 'User is not a stripe customer yet');
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    throw new HttpsError('internal', 'Could not fetch a user record');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer,
    return_url: data.data.returnUrl,
  });

  return session.url;
});
