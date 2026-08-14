import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'] });

export const metadata = {
  metadataBase: new URL('https://www.codewale.in'),

  title: {
    default: 'Indian Army Truck Music 🇮🇳 | 15 August Independence Day Songs',
    template: '%s | CodeWale.in',
  },

  description:
    'Celebrate 15 August with Indian Army truck music, patriotic songs, deshbhakti music and Independence Day vibes. Listen to powerful Indian patriotic playlists inspired by the spirit of India\'s armed forces.',

  keywords: [
    '15 august music website',
    'independence day songs',
    'indian army music',
    'desh bhakti songs',
    'देशभक्ति गाने',
    'स्वतंत्रता दिवस playlist',
    'patriotic songs india',
    'truck wala music website',
    'horn ok please music',
    'indian music website trend',
    'army songs hindi',
    'bharat mata ki jai songs',
    'vande mataram playlist',
    'jai hind music',
    '15 august 2025',
    'codewale',
  ],

  authors: [{ name: 'CodeWale', url: 'https://www.codewale.in' }],
  creator: 'CodeWale',
  publisher: 'CodeWale',

  openGraph: {
    type: 'website',
    locale: 'hi_IN',
    url: 'https://www.codewale.in',
    siteName: '15 August Music | CodeWale',
    title: 'Indian Army Truck Music 🇮🇳 | 15 August Independence Day Songs',
    description:
      'Celebrate 15 August with Indian Army truck music, patriotic songs, deshbhakti music and Independence Day vibes. Listen to powerful Indian patriotic playlists inspired by the spirit of India\'s armed forces.',
    images: [
      {
        url: '/hero.png',
        width: 1200,
        height: 630,
        alt: '15 August Indian Army Music Website',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Indian Army Truck Music 🇮🇳 | 15 August Independence Day Songs',
    description:
      'Celebrate 15 August with Indian Army truck music, patriotic songs, deshbhakti music and Independence Day vibes. Listen to powerful Indian patriotic playlists inspired by the spirit of India\'s armed forces.',
    images: ['/hero.png'],
    creator: '@codewale',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },

  alternates: {
    canonical: 'https://www.codewale.in',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="hi" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#FF671F" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: '15 August Music | Indian Army Playlist',
              url: 'https://www.codewale.in',
              description: 'Best Independence Day patriotic songs — Indian Army desh bhakti music website',
              author: { '@type': 'Organization', name: 'CodeWale', url: 'https://www.codewale.in' },
              keywords: '15 august music, indian army songs, desh bhakti, independence day playlist',
            }),
          }}
        />
      </head>
      <body className={`${geist.className} min-h-full m-0 p-0 overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
