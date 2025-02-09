import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Swap } from './modules';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <section className="flex items-center justify-center bg-branding-background-900 w-screen h-screen">
      <Swap />
    </section>
  </QueryClientProvider>
);

export default App;
