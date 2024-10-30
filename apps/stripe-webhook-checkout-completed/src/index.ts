// Env config
import { defineString } from 'firebase-functions/params';
import { initializeApp, cert } from 'firebase-admin/app';
import { ServiceAccount } from 'firebase-admin';
import serviceAccount from './service-account.json' assert { type: 'json' };

// Function infrastructure
import { onRequest } from 'firebase-functions/v2/https';

// Client libraries
import { Stripe } from 'stripe';
import { getFirestore } from 'firebase-admin/firestore';

const stripeSecretKey = defineString('STRIPE_SECRET_KEY');
const stripeWebhookSecret = defineString('STRIPE_WEBHOOK_SECRET');

initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
  projectId: 'stoic-sage',
  storageBucket: 'stoic-sage.appspot.com',
});

export const stripe_webhook_checkout_completed = onRequest(async (req, res) => {
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    const message = 'No stripe-signature header present';
    console.warn(message);
    res.status(400).send(message);
    return;
  }

  const stripe = new Stripe(stripeSecretKey.value(), { apiVersion: '2022-11-15' });
  const webhookSecret = stripeWebhookSecret.value();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
  } catch (err) {
    const message = 'Webhook signature verification failed.';
    console.error(message, err);
    res.status(400).send(message);
    return;
  }

  if (event.type !== 'checkout.session.completed') {
    const message = `Unexpected event type "${event.type}". This endpoint only handles checkout.session.completed`;
    console.error(message);
    res.status(400).send(message);
    return;
  }

  // Payment is successful and the subscription is created.
  // Provision the subscription and save the customer ID to your database.

  const session = event.data.object as Stripe.Checkout.Session;

  if (!session.client_reference_id) {
    const message = 'No client_reference_id specified in session';
    console.error(message);
    res.status(400).send(message);
    return;
  }

  const firestore = getFirestore();

  try {
    await firestore
      .doc(`users/${session.client_reference_id}`)
      .update({ stripe: { customer: session.customer, subscription: session.subscription } });
  } catch (err) {
    const message = 'User doc update failed.';
    console.error(message, err);
    res.status(500).send(message);
    return;
  }

  res.sendStatus(200);
});
