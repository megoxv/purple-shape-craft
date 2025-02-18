"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { Copy, Undo, Redo, RefreshCw, Download, Save, Upload, Layers } from "lucide-react"

type Corner = { x: number; y: number }
type Corners = { [key: string]: Corner }
type ShapeLayer = {
  corners: Corners
  gradient: { start: string; end: string }
  blendMode: string
  rotation: number
}

const BLEND_MODES = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
]

const SHAPE_PRESETS = {
  circle: {
    topLeft: { x: 100, y: 100 },
    topRight: { x: 0, y: 100 },
    bottomRight: { x: 100, y: 0 },
    bottomLeft: { x: 0, y: 0 },
  },
  diamond: {
    topLeft: { x: 50, y: 100 },
    topRight: { x: 50, y: 100 },
    bottomRight: { x: 100, y: 50 },
    bottomLeft: { x: 0, y: 50 },
  },
  triangle: {
    topLeft: { x: 50, y: 100 },
    topRight: { x: 50, y: 100 },
    bottomRight: { x: 100, y: 0 },
    bottomLeft: { x: 0, y: 0 },
  },
  star: {
    topLeft: { x: 50, y: 90 },
    topRight: { x: 50, y: 90 },
    bottomRight: { x: 90, y: 40 },
    bottomLeft: { x: 10, y: 40 },
  },
}

export default function ShapeCraftGenerator() {
  const [layers, setLayers] = useState<ShapeLayer[]>([
    {
      corners: {
        topLeft: { x: 28, y: 72 },
        topRight: { x: 17, y: 83 },
        bottomRight: { x: 80, y: 34 },
        bottomLeft: { x: 66, y: 20 },
      },
      gradient: { start: "#8B5CF6", end: "#6B46C1" },
      blendMode: "normal",
      rotation: 0,
    },
  ])
  const [activeLayer, setActiveLayer] = useState(0)
  const [customSize, setCustomSize] = useState(false)
  const [size, setSize] = useState({ width: 400, height: 400 })
  const [copied, setCopied] = useState(false)
  const [mirrorMode, setMirrorMode] = useState(false)
  const [history, setHistory] = useState<ShapeLayer[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isAnimating, setIsAnimating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef<string | null>(null)

  useEffect(() => {
    if (historyIndex === -1 || JSON.stringify(layers) !== JSON.stringify(history[historyIndex])) {
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), layers])
      setHistoryIndex((prev) => prev + 1)
    }
  }, [layers, historyIndex, history])

  const getBorderRadiusString = (corners: Corners) => {
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

    setLayers((prevLayers) => {
      const newLayers = [...prevLayers]
      const newCorners = { ...newLayers[activeLayer].corners }
      newCorners[isDragging.current!] = {
        x: Math.min(100, Math.max(0, x)),
        y: Math.min(100, Math.max(0, y)),
      }

      if (mirrorMode) {
        const oppositeCorner = {
          topLeft: "bottomRight",
          topRight: "bottomLeft",
          bottomRight: "topLeft",
          bottomLeft: "topRight",
        }[isDragging.current!]

        newCorners[oppositeCorner!] = {
          x: 100 - newCorners[isDragging.current!].x,
          y: 100 - newCorners[isDragging.current!].y,
        }
      }

      newLayers[activeLayer] = { ...newLayers[activeLayer], corners: newCorners }
      return newLayers
    })
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
  }, [handleMouseMove, handleMouseUp]) // Updated useEffect dependencies

  const copyToClipboard = () => {
    const css = layers
      .map(
        (layer, index) => `
.shape-${index + 1} {
  width: ${customSize ? size.width : 400}px;
  height: ${customSize ? size.height : 400}px;
  background: linear-gradient(135deg, ${layer.gradient.start} 0%, ${layer.gradient.end} 100%);
  border-radius: ${getBorderRadiusString(layer.corners)};
  transform: rotate(${layer.rotation}deg);
  mix-blend-mode: ${layer.blendMode};
}
`,
      )
      .join("\n")
    navigator.clipboard.writeText(css)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1)
      setLayers(history[historyIndex - 1])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1)
      setLayers(history[historyIndex + 1])
    }
  }

  const randomizeShape = () => {
    setLayers((prevLayers) => {
      const newLayers = [...prevLayers]
      newLayers[activeLayer] = {
        ...newLayers[activeLayer],
        corners: {
          topLeft: { x: Math.random() * 100, y: Math.random() * 100 },
          topRight: { x: Math.random() * 100, y: Math.random() * 100 },
          bottomRight: { x: Math.random() * 100, y: Math.random() * 100 },
          bottomLeft: { x: Math.random() * 100, y: Math.random() * 100 },
        },
        gradient: {
          start: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          end: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        },
        rotation: Math.random() * 360,
      }
      return newLayers
    })
  }

  const exportSVG = () => {
    const svgString = `
      <svg width="${customSize ? size.width : 400}" height="${customSize ? size.height : 400}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          ${layers
            .map(
              (layer, index) => `
            <linearGradient id="grad-${index}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${layer.gradient.start};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${layer.gradient.end};stop-opacity:1" />
            </linearGradient>
          `,
            )
            .join("")}
        </defs>
        ${layers
          .map(
            (layer, index) => `
          <g transform="rotate(${layer.rotation} ${customSize ? size.width / 2 : 200} ${customSize ? size.height / 2 : 200})">
            <rect width="100%" height="100%" fill="url(#grad-${index})" 
              rx="${layer.corners.topLeft.x}%" ry="${100 - layer.corners.topLeft.y}%"
              style="mix-blend-mode: ${layer.blendMode};"
            />
          </g>
        `,
          )
          .join("")}
      </svg>
    `
    const blob = new Blob([svgString], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "purple-shape-craft.svg"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const saveShape = () => {
    const data = JSON.stringify({ layers, size, customSize })
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "purple-shape-craft-config.json"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const loadShape = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const data = JSON.parse(content)
        setLayers(data.layers)
        setSize(data.size)
        setCustomSize(data.customSize)
      }
      reader.readAsText(file)
    }
  }

  const addLayer = () => {
    setLayers((prev) => [
      ...prev,
      {
        corners: {
          topLeft: { x: 50, y: 50 },
          topRight: { x: 50, y: 50 },
          bottomRight: { x: 50, y: 50 },
          bottomLeft: { x: 50, y: 50 },
        },
        gradient: { start: "#8B5CF6", end: "#6B46C1" },
        blendMode: "normal",
        rotation: 0,
      },
    ])
    setActiveLayer((prev) => prev + 1) // Update this line
  }

  const removeLayer = (index: number) => {
    if (layers.length > 1) {
      setLayers((prev) => prev.filter((_, i) => i !== index))
      setActiveLayer((prev) => {
        if (prev >= index) {
          return Math.max(0, prev - 1)
        }
        return prev
      })
    }
  }

  const setShapePreset = (preset: keyof typeof SHAPE_PRESETS) => {
    setLayers((prev) => {
      const newLayers = [...prev]
      newLayers[activeLayer] = { ...newLayers[activeLayer], corners: SHAPE_PRESETS[preset] }
      return newLayers
    })
  }

  const toggleAnimation = () => {
    setIsAnimating((prev) => !prev)
  }

  return (
    <div className="flex flex-col items-center gap-12">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-purple-700/20 rounded-3xl blur-xl dark:from-purple-400/20 dark:to-purple-600/20" />
        <div
          ref={containerRef}
          className="relative backdrop-blur-sm bg-purple-100/30 dark:bg-purple-900/30 p-8 rounded-3xl border border-purple-300/10 dark:border-purple-700/10"
        >
          <div
            className="relative w-[400px] h-[400px] border border-dashed border-purple-300/20 dark:border-purple-700/20 rounded-xl overflow-hidden"
            style={{
              width: customSize ? size.width + "px" : "400px",
              height: customSize ? size.height + "px" : "400px",
            }}
          >
            {layers.map((layer, index) => (
              <motion.div
                key={index}
                className="absolute inset-0 m-4"
                style={{
                  background: `linear-gradient(135deg, ${layer.gradient.start} 0%, ${layer.gradient.end} 100%)`,
                  borderRadius: getBorderRadiusString(layer.corners),
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  mixBlendMode: layer.blendMode as any,
                  rotate: layer.rotation,
                }}
                animate={
                  isAnimating
                    ? {
                        rotate: [0, 360],
                        scale: [1, 1.1, 1],
                      }
                    : {}
                }
                transition={{
                  duration: 5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
            ))}
            {layers[activeLayer].corners &&
              Object.entries(layers[activeLayer].corners).map(([corner, position]) => (
                <motion.div
                  key={corner}
                  className="absolute w-4 h-4 bg-purple-200 dark:bg-purple-700 rounded-full cursor-move flex items-center justify-center"
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onMouseDown={handleMouseDown(corner)}
                >
                  <div className="w-2 h-2 bg-purple-600 dark:bg-purple-300 rounded-full" />
                </motion.div>
              ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 text-purple-800 dark:text-purple-200">
        <motion.div
          className="flex items-center gap-4 bg-purple-100/30 dark:bg-purple-900/30 p-4 rounded-xl backdrop-blur-sm border border-purple-300/10 dark:border-purple-700/10"
          whileHover={{ scale: 1.02 }}
        >
          <span className="text-purple-600 dark:text-purple-300 font-mono">border-radius:</span>
          <code className="bg-purple-200/30 dark:bg-purple-800/30 px-4 py-2 rounded-lg font-mono">
            {getBorderRadiusString(layers[activeLayer].corners)}
          </code>
          <Button
            onClick={copyToClipboard}
            className={`transition-all duration-300 ${
              copied
                ? "bg-green-500 text-white"
                : "bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white"
            }`}
          >
            <Copy className="w-4 h-4 mr-2" />
            {copied ? "Copied!" : "Copy CSS"}
          </Button>
        </motion.div>

        <div className="flex gap-4">
          <Button onClick={undo} disabled={historyIndex <= 0}>
            <Undo className="w-4 h-4 mr-2" />
            Undo
          </Button>
          <Button onClick={redo} disabled={historyIndex >= history.length - 1}>
            <Redo className="w-4 h-4 mr-2" />
            Redo
          </Button>
          <Button onClick={randomizeShape}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Randomize
          </Button>
          <Button onClick={exportSVG}>
            <Download className="w-4 h-4 mr-2" />
            Export SVG
          </Button>
          <Button onClick={toggleAnimation}>{isAnimating ? "Stop" : "Start"} Animation</Button>
        </div>

        <motion.div
          className="flex items-center gap-6 bg-purple-100/30 dark:bg-purple-900/30 p-4 rounded-xl backdrop-blur-sm border border-purple-300/10 dark:border-purple-700/10"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3">
            <Label htmlFor="custom-size" className="text-purple-600 dark:text-purple-300">
              Custom size
            </Label>
            <Switch
              id="custom-size"
              checked={customSize}
              onCheckedChange={setCustomSize}
              className="data-[state=checked]:bg-gradient-to-r from-purple-500 to-purple-700"
            />
          </div>

          {customSize && (
            <div className="flex items-center gap-4 ml-4">
              <Input
                type="number"
                value={size.width}
                onChange={(e) => setSize((prev) => ({ ...prev, width: Number.parseInt(e.target.value) || 0 }))}
                className="w-20 bg-purple-200/30 dark:bg-purple-800/30 border border-purple-300/10 dark:border-purple-700/10 px-3 py-1 rounded-lg font-mono"
              />
              <span className="text-purple-600 dark:text-purple-300">×</span>
              <Input
                type="number"
                value={size.height}
                onChange={(e) => setSize((prev) => ({ ...prev, height: Number.parseInt(e.target.value) || 0 }))}
                className="w-20 bg-purple-200/30 dark:bg-purple-800/30 border border-purple-300/10 dark:border-purple-700/10 px-3 py-1 rounded-lg font-mono"
              />
            </div>
          )}
        </motion.div>

        <motion.div
          className="flex items-center gap-6 bg-purple-100/30 dark:bg-purple-900/30 p-4 rounded-xl backdrop-blur-sm border border-purple-300/10 dark:border-purple-700/10"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3">
            <Label htmlFor="mirror-mode" className="text-purple-600 dark:text-purple-300">
              Mirror Mode
            </Label>
            <Switch
              id="mirror-mode"
              checked={mirrorMode}
              onCheckedChange={setMirrorMode}
              className="data-[state=checked]:bg-gradient-to-r from-purple-500 to-purple-700"
            />
          </div>
        </motion.div>

        <motion.div
          className="flex items-center gap-6 bg-purple-100/30 dark:bg-purple-900/30 p-4 rounded-xl backdrop-blur-sm border border-purple-300/10 dark:border-purple-700/10"
          whileHover={{ scale: 1.02 }}
        >
          <Label className="text-purple-600 dark:text-purple-300">Gradient</Label>
          <Input
            type="color"
            value={layers[activeLayer].gradient.start}
            onChange={(e) =>
              setLayers((prev) => {
                const newLayers = [...prev]
                newLayers[activeLayer] = {
                  ...newLayers[activeLayer],
                  gradient: { ...newLayers[activeLayer].gradient, start: e.target.value },
                }
                return newLayers
              })
            }
            className="w-12 h-8 bg-transparent border-none"
          />
          <Input
            type="color"
            value={layers[activeLayer].gradient.end}
            onChange={(e) =>
              setLayers((prev) => {
                const newLayers = [...prev]
                newLayers[activeLayer] = {
                  ...newLayers[activeLayer],
                  gradient: { ...newLayers[activeLayer].gradient, end: e.target.value },
                }
                return newLayers
              })
            }
            className="w-12 h-8 bg-transparent border-none"
          />
        </motion.div>

        <motion.div
          className="flex items-center gap-6 bg-purple-100/30 dark:bg-purple-900/30 p-4 rounded-xl backdrop-blur-sm border border-purple-300/10 dark:border-purple-700/10"
          whileHover={{ scale: 1.02 }}
        >
          <Label className="text-purple-600 dark:text-purple-300">Rotation</Label>
          <Slider
            min={0}
            max={360}
            step={1}
            value={[layers[activeLayer].rotation]}
            onValueChange={([value]) =>
              setLayers((prev) => {
                const newLayers = [...prev]
                newLayers[activeLayer] = { ...newLayers[activeLayer], rotation: value }
                return newLayers
              })
            }
            className="w-64"
          />
          <span className="text-purple-600 dark:text-purple-300">{layers[activeLayer].rotation}°</span>
        </motion.div>

        <motion.div
          className="flex items-center gap-6 bg-purple-100/30 dark:bg-purple-900/30 p-4 rounded-xl backdrop-blur-sm border border-purple-300/10 dark:border-purple-700/10"
          whileHover={{ scale: 1.02 }}
        >
          <Label className="text-purple-600 dark:text-purple-300">Blend Mode</Label>
          <Select
            value={layers[activeLayer].blendMode}
            onValueChange={(value) =>
              setLayers((prev) => {
                const newLayers = [...prev]
                newLayers[activeLayer] = { ...newLayers[activeLayer], blendMode: value }
                return newLayers
              })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select blend mode" />
            </SelectTrigger>
            <SelectContent>
              {BLEND_MODES.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {mode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div
          className="flex items-center gap-6 bg-purple-100/30 dark:bg-purple-900/30 p-4 rounded-xl backdrop-blur-sm border border-purple-300/10 dark:border-purple-700/10"
          whileHover={{ scale: 1.02 }}
        >
          <Label className="text-purple-600 dark:text-purple-300">Shape Preset</Label>
          <Select onValueChange={setShapePreset}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select shape" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(SHAPE_PRESETS).map((preset) => (
                <SelectItem key={preset} value={preset}>
                  {preset}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div
          className="flex items-center gap-6 bg-purple-100/30 dark:bg-purple-900/30 p-4 rounded-xl backdrop-blur-sm border border-purple-300/10 dark:border-purple-700/10"
          whileHover={{ scale: 1.02 }}
        >
          <Label className="text-purple-600 dark:text-purple-300">Layers</Label>
          <div className="flex gap-2">
            {layers.map((_, index) => (
              <Button
                key={index}
                onClick={() => setActiveLayer(index)}
                variant={activeLayer === index ? "default" : "outline"}
              >
                {index + 1}
              </Button>
            ))}
            <Button onClick={addLayer} variant="outline">
              <Layers className="w-4 h-4" />
            </Button>
          </div>
          {layers.length > 1 && (
            <Button onClick={() => removeLayer(activeLayer)} variant="destructive">
              Remove Layer
            </Button>
          )}
        </motion.div>

        <div className="flex gap-4">
          <Button onClick={saveShape}>
            <Save className="w-4 h-4 mr-2" />
            Save Shape
          </Button>
          <label className="cursor-pointer">
            <Input type="file" accept=".json" onChange={loadShape} className="hidden" />
            <div className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
              <Upload className="w-4 h-4 mr-2" />
              Load Shape
            </div>
          </label>
        </div>
      </div>
    </div>
  )
}

