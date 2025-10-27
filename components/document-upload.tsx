"use client"

import type React from "react"

import { useState } from "react"
import { Upload, File, X, CheckCircle } from "lucide-react"

interface DocumentUploadProps {
  trackingId: string
  onUploadComplete?: () => void
}

export default function DocumentUpload({ trackingId, onUploadComplete }: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    try {
      // Simulate upload - in production, upload to Cloudinary
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Save document references to localStorage
      const documents = files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        url: URL.createObjectURL(file), // In production, this would be Cloudinary URL
      }))

      const existingDocs = JSON.parse(localStorage.getItem(`documents_${trackingId}`) || "[]")
      localStorage.setItem(`documents_${trackingId}`, JSON.stringify([...existingDocs, ...documents]))

      setUploadSuccess(true)
      setFiles([])
      onUploadComplete?.()

      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload documents. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Upload Supporting Documents</h3>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-foreground font-medium">Click to upload documents</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG, DOC (Max 10MB each)</p>
          </label>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-background p-3 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <File className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <button onClick={() => removeFile(index)} className="text-muted-foreground hover:text-red-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {uploadSuccess && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <p className="text-sm font-medium">Documents uploaded successfully!</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : `Upload ${files.length} Document${files.length !== 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  )
}
