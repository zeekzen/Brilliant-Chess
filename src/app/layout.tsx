import type { Metadata } from "next"
import "./globals.css"

import { Roboto } from 'next/font/google'
import Adsense from "@/components/ads/adsense"
import AcceptCookies from "@/components/privacy/acceptCookies"
import Analytics from "@/components/analytics/analytics"

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
})

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Brilliant Chess - Free Chess Analyzer",
  description: "Analyze your chess games and improve your skills completely free.",
  keywords: ["chess", "chess analysis", "free chess analyzer", "free chess.com analyzer", "analyze chess for free", "analyze chess games", "brilliant move chess", "brilliant chess", "brilliant-chess", "brilliant-chess.com"],
  authors: [{ name: 'Delo', url: "https://github.com/wdeloo" }],
  applicationName: "Brilliant Chess",
  metadataBase: new URL("https://brilliant-chess.com"),

  robots: {
    index: true,
    follow: true,
    nocache: false,
  },

  alternates: {
    canonical: "https://brilliant-chess.com"
  },

  icons: {
    icon: "favicon.ico"
  },

  openGraph: {
    title: "Brilliant Chess - Free Chess Analyzer",
    description: "Analyze your chess games and improve your skills completely free.",
    url: "https://brilliant-chess.com",
    siteName: "Brilliant Chess",
    locale: "en_US",
    type: "website",
  },

  twitter: {
    title: "Brilliant Chess - Free Chess Analyzer",
    description: "Analyze your chess games and improve your skills completely free.",
    card: "summary",
    site: "@BrilliantChess_",
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <Adsense pId={process.env.PUBLISHER_ID ?? ''} />
      <Analytics mId={process.env.MEASUREMENT_ID ?? ''} />
      <body className={`flex flex-row items-center justify-start h-screen w-screen overflow-x-hidden ${roboto.className}`}>
        {/* <AcceptCookies /> */}
        {children}
      </body>
    </html>
  )
}
