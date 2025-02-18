"use client"

import { useState } from "react"
import ShapeCraftGenerator from "../components/shape-craft-generator"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true)

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "dark" : ""}`}>
      <div className="bg-gradient-to-br from-purple-100 to-purple-300 dark:from-purple-900 dark:to-purple-700 min-h-screen relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300/10 dark:bg-purple-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <main className="container mx-auto p-4 relative">
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200"
            >
              {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
          <div className="text-center py-12">
            <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-900 dark:from-purple-300 dark:to-purple-500 mb-6 tracking-tight">
              PURPLE SHAPE CRAFT
            </h1>
            <p className="text-purple-700 dark:text-purple-300 mb-8 text-lg">
              Create, animate, and manipulate unique shapes with advanced controls
            </p>
            <div className="flex justify-center gap-8 text-sm">
              <Link href="https://github.com/megoxv/purple-shape-craft" target="_blank" className="group relative">
                <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700 rounded-lg blur opacity-25 group-hover:opacity-50 transition"></span>
                <span className="relative px-6 py-2 bg-purple-100 dark:bg-purple-900 rounded-lg text-purple-800 dark:text-purple-200 hover:text-purple-600 dark:hover:text-purple-300 transition">
                  View on GitHub
                </span>
              </Link>
            </div>
          </div>
          <ShapeCraftGenerator />
        </main>
      </div>
    </div>
  )
}

