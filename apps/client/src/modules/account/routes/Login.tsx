import { Component, JSX, Show, createSignal } from 'solid-js';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/common/lib/firesbase';
import { Alert, AlertDescription, AlertTitle } from '~/common/components/ui/alert';
import { TextField, TextFieldInput, TextFieldLabel } from '~/common/components/ui/textfield';
import { Button } from '~/common/components/ui/button';
import { BiRegularLoader } from 'solid-icons/bi';
import { IoAlertCircleOutline } from 'solid-icons/io';

export const Login: Component = () => {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  const handleSubmit: JSX.CustomEventHandlersCamelCase<HTMLFormElement>['onSubmit'] = async (e) => {
    e.preventDefault();
    try {
      if (error()) setError('');
      setLoading(true);
      await signInWithEmailAndPassword(auth, email(), password());
    } catch (error) {
      if (error instanceof Error) setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="p-4 grid place-content-center h-screen">
      <div class="max-w-xs">
        <div>
          <h1 class="text-4xl font-bold">Login</h1>
          <p class="mt-2 text-muted-foreground">
            Welcome to the <b class="text-foreground">RapidFootprints</b> project. Please login to get access to all its
            features.
          </p>
        </div>
        <form onSubmit={handleSubmit} class="mt-12">
          <Show when={error()}>
            <Alert variant="destructive">
              <IoAlertCircleOutline class="h-4 w-4" />
              <AlertTitle>{error()}</AlertTitle>
              <AlertDescription>Please make sure your credentials are correct.</AlertDescription>
            </Alert>
          </Show>
          <div class="mt-6">
            <TextField class="mt-2" id="email-input" required>
              <TextFieldLabel>Email</TextFieldLabel>{' '}
              <TextFieldInput
                placeholder="example@mail.com"
                type="email"
                onInput={({ currentTarget: { value } }) => setEmail(value)}
              />
            </TextField>
          </div>
          <div class="mt-6">
            <TextField class="mt-2" id="password-input" required>
              <TextFieldLabel>Password</TextFieldLabel>{' '}
              <TextFieldInput
                placeholder="Your password"
                type="password"
                onInput={({ currentTarget: { value } }) => setPassword(value)}
              />
            </TextField>
          </div>
          <Button class="mt-6 w-full" type="submit" disabled={loading()}>
            <Show when={loading()}>
              <BiRegularLoader class="mr-2 h-4 w-4 animate-spin" />
            </Show>
            Login
          </Button>
        </form>
      </div>
    </div>
  );
};
