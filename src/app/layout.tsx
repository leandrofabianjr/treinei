import Nav from '@/components/ui/nav';
import { Provider } from '@/components/ui/provider';
import { Container } from '@chakra-ui/react';
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'], // Specify desired weights
  subsets: ['latin'],
  display: 'swap', // Optimizes font loading
  variable: '--font-roboto', // Optional: for use with CSS variables
});

export const metadata: Metadata = {
  title: 'Treinei',
  description: 'Para treinar é preciso treinar.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="pt-BR" className={roboto.className}>
      <body>
        <Provider>
          <Nav />
          <Container paddingY={8}>{children}</Container>
        </Provider>
      </body>
    </html>
  );
}
