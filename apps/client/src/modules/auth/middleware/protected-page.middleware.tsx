import { Navigate } from '@solidjs/router';
import { type Component, Suspense } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { match } from 'ts-pattern';
import { useSession } from '../auth.services';

export function createProtectedPage({ authType, component }: { authType: 'public' | 'private' | 'public-only' | 'admin'; component: Component }) {
  return () => {
    const session = useSession();

    const getIsAuthenticated = () => Boolean(session()?.data?.user);

    return (
      <Suspense>
        {
          match({
            authType,
            isAuthenticated: getIsAuthenticated(),
            isPending: session().isPending,
            // isAdmin: user?.roles.includes('admin'),
          })
            .with({ isPending: true }, () => (
              <div class="flex flex-col items-center justify-center h-full">
                <div class="i-tabler-loader-2 animate-spin"></div>
              </div>
            ))
            .with({ authType: 'private', isAuthenticated: false }, () => <Navigate href="/login" />)
            .with({ authType: 'public-only', isAuthenticated: true }, () => <Navigate href="/" />)
            // .with({ authType: 'admin', isAuthenticated: false }, () => <Navigate href="/login" />)
            // .with({ authType: 'admin', isAuthenticated: true, isAdmin: false }, () => <Navigate href="/" />)
            .otherwise(() => <Dynamic component={component} />)
        }
      </Suspense>
    );
  };
}
