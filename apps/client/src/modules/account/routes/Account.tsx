import { signOut } from 'firebase/auth';
import { httpsCallableFromURL } from 'firebase/functions';
import { TbLoader2 } from 'solid-icons/tb';
import { Component, Match, ParentComponent, Show, Switch, createSignal } from 'solid-js';
import { Container } from '~/common/components/Container';
import { Button } from '~/common/components/ui/button';
import { ImageFallback, ImageRoot, Image } from '~/common/components/ui/image';
import { DefaultLayout } from '~/common/layouts/DefaultLayout';
import { auth, functions } from '~/common/lib/firesbase';
import { useAccount } from '../components/AccountProvider';
import { Badge } from '~/common/components/ui/badge';

interface CustomerPortalPayload {
  returnUrl: string;
}

const createCustomerPortalSession = httpsCallableFromURL<CustomerPortalPayload, string>(
  functions,
  'https://create-customer-portal-session-7jjimiuc4a-uc.a.run.app',
);

export const Account: Component<{}> = (props) => {
  const account = useAccount();
  const [loadingManageSubscription, setLoadingManageSubscription] = createSignal(false);

  const handleManageSubscription = async () => {
    try {
      setLoadingManageSubscription(true);
      const { data: url } = await createCustomerPortalSession({ returnUrl: location.href });
      location.assign(url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingManageSubscription(false);
    }
  };

  return (
    <DefaultLayout>
      <Container class="mt-36">
        <div class="flex items-center gap-8">
          <button>
            <ImageRoot class="hover:ring w-24 h-24">
              <Image src="https://avatars.githubusercontent.com/u/55204325?v=4" alt="hngngn" />
              <ImageFallback>JN</ImageFallback>
            </ImageRoot>
          </button>
          <div class="flex-1">
            <h1 class="text-xl font-medium">Julius Niedermeier</h1>
            <p class="text-muted-foreground">julius.niedermeier@outlook.de</p>
          </div>
          <Button variant="ghost" onClick={() => signOut(auth)}>
            Logout
          </Button>
        </div>
        <div class="grid mt-8 rounded-md border">
          <SettingsItem>
            <div class="flex items-center justify-between gap-8">
              <div>
                <Switch>
                  <Match when={account()?.stripe?.plan === 'starter'}>
                    <Badge>Starter</Badge>
                  </Match>
                  <Match when={account()?.stripe?.plan === 'premium'}>
                    <Badge class="bg-purple-500">Premium</Badge>
                  </Match>
                </Switch>
                <h3 class="font-medium mt-4">Manage subscription</h3>
                <small>You are currently on the free plan.</small>
              </div>
              <Button class="gap-2" disabled={loadingManageSubscription()} onClick={handleManageSubscription}>
                <Show when={loadingManageSubscription()}>
                  <TbLoader2 class="animate-spin" />
                </Show>
                Manage subscription
              </Button>
            </div>
          </SettingsItem>
          <SettingsItem>
            <div class="flex items-center justify-between gap-8">
              <div class="text-destructive">
                <h3 class="font-medium">Delete account</h3>
                <small>All your data will be deleted an cannot be restored.</small>
              </div>
              <Button variant="destructive">Delete account</Button>
            </div>
          </SettingsItem>
        </div>
      </Container>
    </DefaultLayout>
  );
};

const SettingsItem: ParentComponent = (props) => {
  return <div class="border-t p-8">{props.children}</div>;
};
