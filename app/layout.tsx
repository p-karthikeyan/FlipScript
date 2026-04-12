import type { Metadata } from "next";
import { Geist, Geist_Mono, Patrick_Hand, Caveat, Dancing_Script, Indie_Flower, Shadows_Into_Light, Kalam } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const patrickHand = Patrick_Hand({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: "400",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const indieFlower = Indie_Flower({
  variable: "--font-indie",
  subsets: ["latin"],
  weight: "400",
});

const shadowsIntoLight = Shadows_Into_Light({
  variable: "--font-shadows",
  subsets: ["latin"],
  weight: "400",
});

const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "FlipScript | Immersive Digital Book Writing & Reading",
    template: "%s | FlipScript"
  },
  description: "Write, read, and share your stories with a realistic flip-book experience. FlipScript offers a tactile, distraction-free environment for authors to create digital manuscripts with secure cloud storage.",
  keywords: ["flip book", "type online", "book writing", "reading online", "digital manuscript", "online writing platform", "realistic page flips", "distraction-free writing", "secure book storage", "authors", "writers", "story writing", "digital journal", "tactile writing experience"],
  authors: [{ name: "FlipScript Team" }],
  creator: "FlipScript",
  publisher: "FlipScript",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://flipscript.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "FlipScript | Immersive Digital Book Writing & Reading",
    description: "The ultimate digital oasis for writers. Realistic page flips, secure storage, and a distraction-free writing experience.",
    url: 'https://flipscript.app',
    siteName: 'FlipScript',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "FlipScript | Immersive Digital Book Writing & Reading",
    description: "Write your next masterpiece on digital paper that feels real. Realistic page flips and secure storage for authors.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${patrickHand.variable} ${caveat.variable} ${dancingScript.variable} ${indieFlower.variable} ${shadowsIntoLight.variable} ${kalam.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-black" suppressHydrationWarning>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
