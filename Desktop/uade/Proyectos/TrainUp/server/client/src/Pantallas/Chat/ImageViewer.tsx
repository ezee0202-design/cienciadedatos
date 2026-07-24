"use client"

import type React from "react"
import { X, Download } from "lucide-react"
import "./ImageViewer.css"

interface ImageViewerProps {
  src: string
  onClose: () => void
}

const ImageViewer: React.FC<ImageViewerProps> = ({ src, onClose }) => {
  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = src
    link.download = "imagen"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="image-viewer-overlay" onClick={onClose}>
      <div className="image-viewer-content" onClick={(e) => e.stopPropagation()}>
        <div className="image-viewer-header">
          <button onClick={handleDownload} className="download-btn" title="Descargar">
            <Download size={20} />
          </button>
          <button onClick={onClose} className="close-btn" title="Cerrar">
            <X size={20} />
          </button>
        </div>
        <div className="image-container">
          <img src={src || "/placeholder.svg"} alt="Imagen ampliada" className="viewer-image" />
        </div>
      </div>
    </div>
  )
}

export default ImageViewer
