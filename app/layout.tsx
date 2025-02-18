import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import type { Metadata } from "next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Purple Shape Craft - Advanced Shape Generator",
  description: "Create and manipulate unique shapes with advanced controls using Purple Shape Craft.",
  keywords: "shape generator, CSS, SVG, design tool, web development",
  authors: [{ name: 'Abdelmjid Saber' }, { name: 'Abdelmjid', url: 'https://instagram.com/megoxv' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

