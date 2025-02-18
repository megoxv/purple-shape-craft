"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy } from "lucide-react"

export default function OrganicShapeGenerator() {
  const [borderRadius, setBorderRadius] = useState({
    topLeft: [50, 50, 50, 50],
    topRight: [50, 50, 50, 50],
    bottomRight: [50, 50, 50, 50],
    bottomLeft: [50, 50, 50, 50],
  })

  const [size, setSize] = useState({ width: 200, height: 200 })

  const updateBorderRadius = (corner: keyof typeof borderRadius, index: number, value: number) => {
    setBorderRadius((prev) => ({
      ...prev,
      [corner]: prev[corner].map((v, i) => (i === index ? value : v)),
    }))
  }

  const borderRadiusString = `${borderRadius.topLeft.join("% ")}% / ${borderRadius.topRight.join("% ")}% ${borderRadius.bottomRight.join("% ")}% ${borderRadius.bottomLeft.join("% ")}%`

  const cssCode = `
.organic-shape {
  width: ${size.width}px;
  height: ${size.height}px;
  background: #3498db;
  border-radius: ${borderRadiusString};
}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cssCode)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <h2 className="text-2xl font-semibold mb-4">Controls</h2>
        {Object.entries(borderRadius).map(([corner, values]) => (
          <div key={corner} className="mb-6">
            <h3 className="text-lg font-medium mb-2 capitalize">{corner.replace(/([A-Z])/g, " $1").trim()}</h3>
            {values.map((value, index) => (
              <div key={index} className="mb-2">
                <Label htmlFor={`${corner}-${index}`} className="text-sm">
                  Value {index + 1}
                </Label>
                <Slider
                  id={`${corner}-${index}`}
                  min={0}
                  max={100}
                  step={1}
                  value={[value]}
                  onValueChange={([newValue]) =>
                    updateBorderRadius(corner as keyof typeof borderRadius, index, newValue)
                  }
                  className="mb-2"
                />
              </div>
            ))}
          </div>
        ))}
        <div className="flex gap-4 mb-6">
          <div>
            <Label htmlFor="width">Width (px)</Label>
            <Input
              id="width"
              type="number"
              value={size.width}
              onChange={(e) => setSize((prev) => ({ ...prev, width: Number.parseInt(e.target.value) || 0 }))}
            />
          </div>
          <div>
            <Label htmlFor="height">Height (px)</Label>
            <Input
              id="height"
              type="number"
              value={size.height}
              onChange={(e) => setSize((prev) => ({ ...prev, height: Number.parseInt(e.target.value) || 0 }))}
            />
          </div>
        </div>
      </div>
      <div className="flex-1">
        <h2 className="text-2xl font-semibold mb-4">Preview</h2>
        <div
          className="organic-shape mx-auto"
          style={{
            width: `${size.width}px`,
            height: `${size.height}px`,
            background: "#3498db",
            borderRadius: borderRadiusString,
          }}
        ></div>
        <h2 className="text-2xl font-semibold mt-8 mb-4">CSS Code</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
          <code>{cssCode}</code>
        </pre>
        <Button onClick={copyToClipboard} className="mt-4">
          <Copy className="w-4 h-4 mr-2" />
          Copy CSS
        </Button>
      </div>
    </div>
  )
}

