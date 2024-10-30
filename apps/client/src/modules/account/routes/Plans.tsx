import { Component, For } from 'solid-js';
import { Container } from '~/common/components/Container';
import { Button } from '~/common/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/common/components/ui/card';
import { DefaultLayout } from '~/common/layouts/DefaultLayout';
import { httpsCallableFromURL } from 'firebase/functions';
import { functions } from '~/common/lib/firesbase';

interface Payload {
  successUrl: string;
  cancelUrl: string;
}

const createCheckoutSession = httpsCallableFromURL<Payload, string>(
  functions,
  'https://create-checkout-session-7jjimiuc4a-uc.a.run.app',
);

export const Plans: Component = () => {
  const plans: PlanCardProps[] = [
    { title: 'Starter', price: 'Free forever', billingPeriod: 'monthly', subscribed: true },
    {
      title: 'Premium',
      price: '4,99€',
      billingPeriod: 'monthly',
      subscribed: false,
      onSubscribe: () => redirectToCheckout(),
    },
  ];

  const getCheckoutSessionUrl = async () => {
    const { data } = await createCheckoutSession({
      successUrl: `${window.location.origin}/generate`,
      cancelUrl: `${window.location.origin}/plans`,
    });
    return data;
  };

  const redirectToCheckout = async () => {
    const url = await getCheckoutSessionUrl();
    if (!url) return;
    window.location.assign(url);
  };

  return (
    <DefaultLayout>
      <Container class="grid grid-cols-2 gap-4 h-screen place-content-center">
        <For each={plans}>{(plan) => <PlanCard {...plan} />}</For>
      </Container>
    </DefaultLayout>
  );
};

interface PlanCardProps {
  title: string;
  subscribed: boolean;
  price: string;
  billingPeriod: 'monthly' | 'yearly';
  onSubscribe?: () => any;
}

const PlanCard: Component<PlanCardProps> = (props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
        <CardDescription>For most users</CardDescription>
        <h1 class="text-xl font-medium">{props.price}</h1>
        <span>{props.billingPeriod}</span>
      </CardHeader>
      <CardContent>
        <Button class="w-full" disabled={props.subscribed} onClick={props.onSubscribe}>
          {props.subscribed ? 'Subscribed' : 'Subscribe'}
        </Button>
      </CardContent>
    </Card>
  );
};
