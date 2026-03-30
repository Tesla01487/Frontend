import type { Metadata } from "next"; 
import { Inter, JetBrains_Mono } from "next/font/google"; 
import "./globals.css"; 
import { ThemeProvider } from "@/components/providers/theme-provider"; 
import PrismBackground from "@/components/ui/prism-background"; 
import { Toaster } from "react-hot-toast"; 
const inter = Inter({ 
variable: "--font-geist-sans", 
subsets: ["latin"], 
display: "swap", 
}); 
const jetbrainsMono = JetBrains_Mono({ 
variable: "--font-geist-mono", 
subsets: ["latin"], 
display: "swap", 
}); 
export const metadata: Metadata = { 
  title: "Tesla - Secure Digital Coin Transfer Platform", 
  description: "Transfer digital coins securely with our premium fintech platform. Features include real-time transactions, QR code transfers, and comprehensive wallet management.", 
keywords: ["crypto", "wallet", "digital coins", "fintech", "blockchain", "secure transfer", 
"tesla"], 
authors: [{ name: "Tesla Team" }], 
openGraph: { 
title: "Tesla - Secure Digital Coin Transfer", 
description: "Premium fintech platform for secure digital coin transfers", 
type: "website", 
}, 
viewport: { 
width: "device-width", 
initialScale: 1, 
maximumScale: 5, 
userScalable: true, 
viewportFit: "cover" 
}, 
themeColor: [ 
{ media: "(prefers-color-scheme: light)", color: "#f59e0b" }, 
{ media: "(prefers-color-scheme: dark)", color: "#fb923c" }, 
], 
}; 
export default function RootLayout({ 
children, 
}: Readonly<{ 
children: React.ReactNode; 
}>) { 
return ( 
<html lang="en" suppressHydrationWarning> 
      <body 
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`} 
      > 
        <ThemeProvider> 
          <PrismBackground /> 
          {children} 
          <Toaster 
            position="top-right" 
            toastOptions={{ 
              duration: 4000, 
              style: { 
                background: 'var(--card)', 
                color: 'var(--foreground)', 
                border: '1px solid var(--border)', 
              }, 
              success: { 
                iconTheme: { 
                  primary: 'var(--success)', 
                  secondary: 'white', 
                }, 
              }, 
              error: { 
                iconTheme: { 
                  primary: 'var(--error)', 
                  secondary: 'white', 
                }, 
              }, 
            }} 
          /> 
        </ThemeProvider> 
      </body> 
    </html> 
  ); 
}