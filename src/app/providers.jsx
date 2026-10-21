import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import PropTypes from 'prop-types';

import { queryClient } from '@shared/lib/api';

import { env } from '@core/config/env';

function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {env.isDevelopment && env.enableDevTools && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  );
}

AppProviders.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppProviders;
