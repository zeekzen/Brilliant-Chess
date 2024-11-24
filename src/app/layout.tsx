import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Brilliant Chess",
  description: "A chess.com-like chess analyzer for free",
}

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
