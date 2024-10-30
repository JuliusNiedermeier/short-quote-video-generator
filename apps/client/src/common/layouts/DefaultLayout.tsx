import { ParentComponent } from 'solid-js';
import { Header } from '~/modules/header/Header';
import { NavBar } from '~/modules/navigation/NavBar';

// export const DefaultLayout: ParentComponent = (props) => {
//   return (
//     <>
//       <Header />
//       {props.children}
//     </>
//   );
// };

export const DefaultLayout: ParentComponent = (props) => {
  return (
    <div class="flex relative">
      <div class="h-screen sticky top-0">
        <NavBar />
      </div>
      <main class="flex-1 border">{props.children}</main>
    </div>
  );
};
