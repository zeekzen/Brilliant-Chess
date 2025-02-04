import type { Metadata } from "next"
import "./globals.css"

import { Roboto } from 'next/font/google'
import Adsense from "@/components/ads/adsense"

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
})

export const metadata: Metadata = {
  title: "Brilliant Chess",
  description: "A chess.com-like chess analyzer for free",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <Adsense pId={process.env.PUBLISHER_ID ?? ''} />
      <body className={`flex flex-row items-center justify-start h-screen w-screen overflow-x-hidden ${roboto.className}`}>
        {children}
      </body>
    </html>
  )
}
