import '@shared/styles/app.css';

import ErrorBoundary from './ErrorBoundary';
import AppProviders from './providers';
import AppRouter from './router';

function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
