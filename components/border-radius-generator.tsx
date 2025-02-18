"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { motion } from "framer-motion"

export default function BorderRadiusGenerator() {
  const [corners, setCorners] = useState({
    topLeft: { x: 28, y: 72 },
    topRight: { x: 17, y: 83 },
    bottomRight: { x: 80, y: 34 },
    bottomLeft: { x: 66, y: 20 },
  })
  const [customSize, setCustomSize] = useState(false)
  const [size, setSize] = useState({ width: 400, height: 400 })
  const [copied, setCopied] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef<string | null>(null)

  const getBorderRadiusString = () => {
    return `${corners.topLeft.x}% ${100 - corners.topRight.x}% ${corners.bottomRight.x}% ${100 - corners.bottomLeft.x}% / ${100 - corners.topLeft.y}% ${100 - corners.topRight.y}% ${corners.bottomRight.y}% ${corners.bottomLeft.y}%`
  }

  const handleMouseDown = (corner: string) => () => {
    isDragging.current = corner
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setCorners((prev) => ({
      ...prev,
      [isDragging.current!]: {
        x: Math.min(100, Math.max(0, x)),
        y: Math.min(100, Math.max(0, y)),
      },
    }))
  }

  const handleMouseUp = () => {
    isDragging.current = null
  }

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, []) // Removed dependencies here

  const copyToClipboard = () => {
    const css = `border-radius: ${getBorderRadiusString()};`
    navigator.clipboard.writeText(css)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center gap-12">
      <div className="relative group">
        {/* Container with glass effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl" />
        <div
          ref={containerRef}
          className="relative backdrop-blur-sm bg-black/30 p-8 rounded-3xl border border-white/10"
        >
          <div
            className="relative w-[400px] h-[400px] border border-dashed border-white/20 rounded-xl"
            style={{
              width: customSize ? size.width + "px" : "400px",
              height: customSize ? size.height + "px" : "400px",
            }}
          >
            <motion.div
              className="absolute inset-0 m-4"
              style={{
                background: "linear-gradient(135deg, rgba(255,0,255,0.7) 0%, rgba(102,0,255,0.7) 100%)",
                borderRadius: getBorderRadiusString(),
              }}
              animate={{
                boxShadow: ["0 0 20px rgba(255,0,255,0.3)", "0 0 40px rgba(102,0,255,0.3)"],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
            {Object.entries(corners).map(([corner, position]) => (
              <motion.div
                key={corner}
                className="absolute w-4 h-4 bg-white rounded-full cursor-move flex items-center justify-center"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onMouseDown={handleMouseDown(corner)}
              >
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 text-white">
        <motion.div
          className="flex items-center gap-4 bg-black/30 p-4 rounded-xl backdrop-blur-sm border border-white/10"
          whileHover={{ scale: 1.02 }}
        >
          <span className="text-gray-400 font-mono">border-radius:</span>
          <code className="bg-white/5 px-4 py-2 rounded-lg font-mono">{getBorderRadiusString()}</code>
          <button
            onClick={copyToClipboard}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
              copied
                ? "bg-green-500 text-white"
                : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            }`}
          >
            {copied ? "Copied!" : "Copy CSS"}
          </button>
        </motion.div>

        <motion.div
          className="flex items-center gap-6 bg-black/30 p-4 rounded-xl backdrop-blur-sm border border-white/10"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-gray-400">Custom size</span>
            <Switch
              checked={customSize}
              onCheckedChange={setCustomSize}
              className="data-[state=checked]:bg-gradient-to-r from-purple-500 to-pink-500"
            />
          </div>

          {customSize && (
            <div className="flex items-center gap-4 ml-4">
              <input
                type="number"
                value={size.width}
                onChange={(e) => setSize((prev) => ({ ...prev, width: Number.parseInt(e.target.value) || 0 }))}
                className="w-20 bg-white/5 border border-white/10 px-3 py-1 rounded-lg font-mono"
              />
              <span className="text-gray-400">×</span>
              <input
                type="number"
                value={size.height}
                onChange={(e) => setSize((prev) => ({ ...prev, height: Number.parseInt(e.target.value) || 0 }))}
                className="w-20 bg-white/5 border border-white/10 px-3 py-1 rounded-lg font-mono"
              />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

