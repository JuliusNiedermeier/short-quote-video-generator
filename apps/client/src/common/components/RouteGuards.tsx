import { useLocation, useNavigate } from '@solidjs/router';
import { ParentComponent, createEffect } from 'solid-js';
import { useAuth } from '~/modules/account/components/AuthProvider';

const protectedRoutes = ['/generate', '/library', '/library/video', '/library/audio', '/account'];
const authRoutes = ['/login'];

export const RouteGuards: ParentComponent = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuth();

  createEffect(() => {
    if (protectedRoutes.includes(location.pathname) && !user()) navigate('/login', { replace: true });
    if (authRoutes.includes(location.pathname) && user()) navigate('/generate', { replace: true });
  });
  return props.children;
};
