import type { Metadata } from "next"
import "./globals.css"

import { Roboto } from 'next/font/google'

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
      <body className={`flex flex-row items-center justify-between h-screen ${roboto.className}`}>
        {children}
      </body>
    </html>
  )
}
