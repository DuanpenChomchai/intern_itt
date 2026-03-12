import ProviderComponent from '@/components/layouts/provider-component';
import 'react-perfect-scrollbar/dist/css/styles.css';
import '../styles/tailwind.css';
import { Metadata } from 'next';
import { Nunito } from 'next/font/google';

const defaultTitle = 'VRISTO - Multipurpose Tailwind Dashboard Template';

export const metadata: Metadata = {
    title: {
        template: '%s | VRISTO - Multipurpose Tailwind Dashboard Template',
        default: defaultTitle,
    },
    description: 'A modern admin dashboard application built with Next.js, React 19, and TypeScript',
    manifest: '/manifest.json',
    themeColor: '#009688',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'Vristo',
    },
    formatDetection: {
        telephone: false,
    },
    icons: {
        icon: '/pwa-icons/icon-192x192.svg',
        apple: '/pwa-icons/icon-192x192.svg',
    },
};
const nunito = Nunito({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-nunito',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={nunito.variable}>
                <ProviderComponent>{children}</ProviderComponent>
            </body>
        </html>
    );
}
