import type { AppProps } from 'next/app';
import { AuthProvider } from '@/shared/api/AuthContext';
import '@/index.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
