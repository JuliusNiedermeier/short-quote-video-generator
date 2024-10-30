import { Component, ParentComponent } from 'solid-js';
import { ColorModeToggle } from '~/common/components/ColorModeToggle';
import { Logo } from '~/common/components/Logo';
import { ImageFallback, ImageRoot, Image } from '~/common/components/ui/image';
import { A, useLocation } from '@solidjs/router';
import { HiSolidSparkles } from 'solid-icons/hi';
import { VsLibrary } from 'solid-icons/vs';
import { Button } from '~/common/components/ui/button';

export const NavBar: Component<{}> = (props) => {
  return (
    <nav class="flex flex-col h-full items-center justify-between gap-8 px-8 py-16">
      <Logo />

      <div class="my-auto flex flex-col gap-4">
        <NavItem href="/generate">
          <HiSolidSparkles size={24} />
          <small>Create</small>
        </NavItem>
        <NavItem href="/library">
          <VsLibrary size={24} />
          <small>Library</small>
        </NavItem>
      </div>
      <ColorModeToggle />
      <NavItem href="/account">
        <ImageRoot>
          <Image src="https://avatars.githubusercontent.com/u/55204325?v=4" alt="hngngn" />
          <ImageFallback>JN</ImageFallback>
        </ImageRoot>
      </NavItem>
      <A href="/plans">
        <Button variant="outline">Upgrade</Button>
      </A>
    </nav>
  );
};

interface NavItemProps {
  href: string;
}

const NavItem: ParentComponent<NavItemProps> = (props) => {
  const location = useLocation();

  const active = () => location.pathname.startsWith(props.href);

  return (
    <A
      href={props.href}
      class="rounded-xl block w-24 h-24 flex flex-col gap-2 items-center justify-center hover:bg-muted/50 cursor-pointer text-muted-foreground"
      classList={{ 'bg-muted': active() }}
    >
      {props.children}
    </A>
  );
};
