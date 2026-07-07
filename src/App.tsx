import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { store } from '@/store/store';
import { queryClient } from '@/lib/queryClient';
import { AppRoutes } from '@/routes/AppRoutes';

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" richColors closeButton />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
