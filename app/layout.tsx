import type React from "react"
import {Inter} from "next/font/google"
import "./globals.css"
import {SessionProvider} from "./providers/session-provider"
import {MiniKitProvider} from "@/components/minikit-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "WorldTimeTicket - Time Marketplace",
  description: "Connect with people and sell your time with World ID authentication",
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
      <body className={inter.className}>
        <MiniKitProvider>
          <SessionProvider>
            {children}
          </SessionProvider>
        </MiniKitProvider>
      </body>
    </html>
  )
}
