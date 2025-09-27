import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "WorldTimeTicket - Professional Time Marketplace",
  description: "Book verified experts and sell your time on World App",
  generator: 'v0.app'
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Detect if running in iframe (World App)
              if (window.self !== window.top) {
                document.documentElement.classList.add('in-iframe');
                document.body.classList.add('in-iframe');
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
