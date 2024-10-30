import type { Component } from 'solid-js';
import { A, Route, Routes } from '@solidjs/router';
import { AuthProvider } from '~/modules/account/components/AuthProvider';
import { RouteGuards } from '~/common/components/RouteGuards';
import { Login } from '@/modules/account/routes/Login';
import { Library } from '@/modules/media-library/routes/Library';
import { VideoLibrary } from '@/modules/media-library/routes/VideoLibrary';
import { AudioLibrary } from '@/modules/media-library/routes/AudioLibrary';
import { Generate } from '@/modules/generate/routes/Generate';
import { VideoDetail } from './modules/generate/routes/VideoDetail';
import { ColorModeProvider, ColorModeScript, localStorageManager } from '@kobalte/core';
import { Account } from './modules/account/routes/Account';
import { LibrarayRedirect } from './modules/media-library/routes/LibrarayRedirect';
import { ToastList, ToastRegion } from './common/components/ui/toast';
import { Plans } from './modules/account/routes/Plans';
import { AccountProvider } from './modules/account/components/AccountProvider';

const App: Component = () => {
  return (
    <>
      <ColorModeScript storageType={localStorageManager.type} />
      <ColorModeProvider storageManager={localStorageManager}>
        <AuthProvider>
          <AccountProvider>
            <ToastRegion>
              <ToastList />
            </ToastRegion>
            <RouteGuards>
              <Routes>
                <Route path="/login" component={Login} />
                <Route path="/generate" component={Generate} />
                <Route path="/generate/:id" component={VideoDetail} />
                <Route path="/library" component={LibrarayRedirect} />
                <Route path="/library" component={Library}>
                  <Route path="/video" component={VideoLibrary} />
                  <Route path="/audio" component={AudioLibrary} />
                </Route>
                <Route path="/account" component={Account} />
                <Route path="/plans" component={Plans} />
              </Routes>
            </RouteGuards>
          </AccountProvider>
        </AuthProvider>
      </ColorModeProvider>
    </>
  );
};

export default App;
