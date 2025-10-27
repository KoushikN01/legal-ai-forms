"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Camera, User, Mail, Phone, MapPin, Save, Settings, HelpCircle, LogOut, Upload, FileText, X, ArrowLeft, Trash2, Filter } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    photo: user?.photo || "",
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState(user?.photo || "")
  const [documents, setDocuments] = useState<any[]>([])
  const [showDocumentUpload, setShowDocumentUpload] = useState(false)
  const [documentType, setDocumentType] = useState("aadhar")
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [documentFilter, setDocumentFilter] = useState("all") // Filter state

  useEffect(() => {
    // Check if user is logged in by checking localStorage token
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth")
    } else {
      loadUserProfile()
      loadUserDocuments()
    }
  }, [router])

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProfileData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.profile?.address || "",
          photo: data.profile?.photo || data.photo || "",
        })
        setPhotoPreview(data.profile?.photo || data.photo || "")
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  const loadUserDocuments = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/user/documents`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log("[Profile] Loaded documents:", data.documents)
        setDocuments(data.documents || [])
      } else {
        console.error("[Profile] Failed to load documents:", response.status)
      }
    } catch (error) {
      console.error("Error loading documents:", error)
    }
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to backend instead of direct Cloudinary upload
    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "profile_photo")

      const response = await fetch(`${API_BASE_URL}/upload/profile-photo`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()
      console.log("[v0] Backend upload response:", data)
      
      if (data.secure_url) {
        setProfileData((prev) => ({ ...prev, photo: data.secure_url }))
        console.log("[v0] Profile photo uploaded successfully:", data.secure_url)
      } else {
        console.error("[v0] No secure_url in backend response:", data)
        // If backend upload fails, just use the local preview for now
        console.log("[v0] Using local preview instead of backend upload")
      }
    } catch (error) {
      console.error("[v0] Error uploading photo to backend:", error)
      // If backend upload fails, just use the local preview for now
      console.log("[v0] Using local preview instead of backend upload")
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: profileData.name,
          phone: profileData.phone,
          address: profileData.address,
          photo: profileData.photo
        })
      })
      
      if (response.ok) {
        setIsEditing(false)
        alert("Profile updated successfully!")
        // Reload profile data
        await loadUserProfile()
      } else {
        const error = await response.json()
        alert(`Error: ${error.detail || "Failed to update profile"}`)
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentUpload = async () => {
    if (!documentFile) return
    
    setLoading(true)
    try {
      // Upload through backend directly
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("file", documentFile)
      
      const response = await fetch(`${API_BASE_URL}/user/documents?document_type=${documentType}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      })
      
      if (response.ok) {
        alert("Document uploaded successfully!")
        setShowDocumentUpload(false)
        setDocumentFile(null)
        await loadUserDocuments()
      } else {
        const error = await response.json()
        alert(`Error: ${error.detail || "Failed to upload document"}`)
      }
      return
    } catch (error) {
      console.error("Error uploading document:", error)
      alert("Failed to upload document. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDocumentFile(file)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!documentId || documentId === "undefined") {
      alert("Error: Document ID not found")
      return
    }

    if (!confirm("Are you sure you want to delete this document?")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      console.log(`[Delete] Attempting to delete document with ID: ${documentId}`)
      
      const response = await fetch(`${API_BASE_URL}/user/documents/${documentId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (response.ok) {
        alert("Document deleted successfully!")
        await loadUserDocuments()
      } else {
        const error = await response.json()
        console.error("[Delete] Error response:", error)
        alert(`Error: ${error.detail || "Failed to delete document"}`)
      }
    } catch (error) {
      console.error("Error deleting document:", error)
      alert("Failed to delete document. Please try again.")
    }
  }

  // Filter documents based on selected filter
  const filteredDocuments = documentFilter === "all" 
    ? documents 
    : documents.filter(doc => doc.document_type === documentFilter)

  // Get unique document types for filter
  const documentTypes = ["all", ...new Set(documents.map(doc => doc.document_type))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => router.push("/forms")}
                className="flex items-center gap-2 text-blue-100 hover:text-white transition"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Forms
              </button>
            </div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-blue-100 mt-2">Manage your account settings and preferences</p>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            {/* Photo Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                  {photoPreview ? (
                    <img
                      src={photoPreview || "/placeholder.svg"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100">
                      <User className="w-16 h-16 text-blue-600" />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="photo-upload"
                  className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition shadow-lg"
                >
                  <Camera className="w-5 h-5 text-white" />
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
              <h2 className="text-2xl font-bold text-foreground mt-4">{profileData.name}</h2>
              <p className="text-muted-foreground">{profileData.email}</p>
            </div>

            {/* Profile Fields */}
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  <User className="inline w-4 h-4 mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  Address
                </label>
                <textarea
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
                >
                  <Settings className="w-5 h-5" />
                  Edit Profile
                </button>
              )}
            </div>

            {/* Documents Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">My Documents</h3>
                <button
                  onClick={() => setShowDocumentUpload(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Document
                </button>
              </div>

              {/* Filter Dropdown */}
              {documents.length > 0 && (
                <div className="mb-4 flex items-center gap-3">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <select
                    value={documentFilter}
                    onChange={(e) => setDocumentFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    {documentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type === "all" ? "All Documents" : type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-gray-600">
                    {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Documents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map((doc, index) => {
                  const fileUrl = doc.document_data?.file_url || doc.file_url
                  const isBase64 = fileUrl && fileUrl.startsWith('data:')
                  const isCloudinary = fileUrl && !isBase64
                  
                  // Get the correct document ID
                  const docId = doc._id || doc.id || doc.document_id
                  
                  return (
                    <div key={docId || index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition relative">
                      {/* Delete Button */}
                      <button
                        onClick={() => {
                          console.log("[Delete] Document object:", doc)
                          console.log("[Delete] Document ID:", docId)
                          handleDeleteDocument(docId)
                        }}
                        className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold capitalize">{doc.document_type}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Uploaded: {new Date(doc.uploaded_at || doc.uploadedAt || new Date()).toLocaleDateString()}
                      </p>
                      
                      {/* Show preview for base64 images */}
                      {isBase64 && doc.document_data?.file_type?.startsWith('image/') && (
                        <div className="mb-2 rounded overflow-hidden border border-gray-300">
                          <img
                            src={fileUrl}
                            alt={doc.document_type}
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      )}
                      
                      {/* View document link */}
                      <div className="flex items-center gap-2 mt-3">
                        {isCloudinary ? (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Document
                          </a>
                        ) : (
                          <span className="text-sm text-gray-500">
                            {doc.document_data?.storage_type === 'mongodb' ? 'Stored in MongoDB' : 'Document saved'}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredDocuments.length === 0 && documents.length > 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No documents found with selected filter</p>
                    <p className="text-sm">Try selecting a different filter or upload new documents</p>
                  </div>
                )}
                {documents.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No documents uploaded yet</p>
                    <p className="text-sm">Click "Upload Document" to add your Aadhar or other documents</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-8 pt-8 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push("/help")}
                className="px-6 py-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition flex items-center gap-3"
              >
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">Help & Support</span>
              </button>
              <button
                onClick={() => router.push("/settings")}
                className="px-6 py-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition flex items-center gap-3"
              >
                <Settings className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">Settings</span>
              </button>
              <button
                onClick={logout}
                className="px-6 py-4 bg-red-50 rounded-lg hover:bg-red-100 transition flex items-center gap-3"
              >
                <LogOut className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-600">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Upload Modal */}
      {showDocumentUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">Upload Document</h3>
              <button
                onClick={() => setShowDocumentUpload(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="aadhar">Aadhar Card</option>
                  <option value="pan">PAN Card</option>
                  <option value="passport">Passport</option>
                  <option value="driving_license">Driving License</option>
                  <option value="voter_id">Voter ID</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Select File
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleDocumentFileChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {documentFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {documentFile.name}
                  </p>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleDocumentUpload}
                  disabled={!documentFile || loading}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
                >
                  {loading ? "Uploading..." : "Upload"}
                </button>
                <button
                  onClick={() => setShowDocumentUpload(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
