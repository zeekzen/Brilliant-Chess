import type { Metadata } from "next"
import "./globals.css"

import Nav from "@/components/nav"

export const metadata: Metadata = {
  title: "Brilliant Chess",
  description: "A chess.com-like chess analyzer for free",
}

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en">
      <body className="flex flex-row items-center justify-between h-screen">
        <header>
          <Nav />
        </header>
        {children}
      </body>
    </html>
  )
}
