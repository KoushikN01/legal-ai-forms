"use client"

import type React from "react"

import { useState } from "react"
import { HelpCircle, MessageSquare, FileText, Star, Send, CheckCircle } from "lucide-react"

interface Ticket {
  id: number
  title: string
  description: string
  category: string
  status: string
  createdAt: string
}

interface Feedback {
  id: number
  rating: number
  comment: string
  createdAt: string
}

export default function HelpPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("general")
  const [activeTab, setActiveTab] = useState<"tickets" | "feedback">("tickets")

  // Feedback form
  const [rating, setRating] = useState(0)
  const [feedbackComment, setFeedbackComment] = useState("")
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault()
    const newTicket: Ticket = {
      id: Date.now(),
      title,
      description,
      category,
      status: "open",
      createdAt: new Date().toLocaleDateString(),
    }
    setTickets([newTicket, ...tickets])
    setTitle("")
    setDescription("")
    setCategory("general")
    alert("Ticket submitted successfully! We'll get back to you soon.")
  }

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      alert("Please select a rating")
      return
    }

    const newFeedback: Feedback = {
      id: Date.now(),
      rating,
      comment: feedbackComment,
      createdAt: new Date().toLocaleDateString(),
    }
    setFeedbacks([newFeedback, ...feedbacks])
    setRating(0)
    setFeedbackComment("")
    setFeedbackSubmitted(true)
    setTimeout(() => setFeedbackSubmitted(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Help & Support Center</h1>
          <p className="text-lg text-muted-foreground">We're here to help you with any questions or issues</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-md p-2 inline-flex gap-2">
            <button
              onClick={() => setActiveTab("tickets")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                activeTab === "tickets" ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              Support Tickets
            </button>
            <button
              onClick={() => setActiveTab("feedback")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                activeTab === "feedback" ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Star className="w-5 h-5" />
              Feedback
            </button>
          </div>
        </div>

        {activeTab === "tickets" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create Ticket */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Create Support Ticket</h2>
              </div>

              <form onSubmit={handleSubmitTicket} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value="general">General Question</option>
                    <option value="technical">Technical Issue</option>
                    <option value="form">Form Help</option>
                    <option value="account">Account Issue</option>
                    <option value="payment">Payment Issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief description of your issue"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed description of your issue"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    rows={5}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Submit Ticket
                </button>
              </form>
            </div>

            {/* Tickets List */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
              <h2 className="text-2xl font-bold text-foreground mb-6">Your Tickets</h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {tickets.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-muted-foreground">No tickets yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Create a ticket to get help from our support team
                    </p>
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <div key={ticket.id} className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-foreground text-lg">{ticket.title}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            ticket.status === "open"
                              ? "bg-yellow-100 text-yellow-800"
                              : ticket.status === "in-progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{ticket.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="bg-gray-100 px-2 py-1 rounded">{ticket.category}</span>
                        <span>{ticket.createdAt}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {/* Feedback Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Share Your Feedback</h2>
              </div>

              {feedbackSubmitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-800 font-semibold">Thank you for your feedback!</p>
                </div>
              )}

              <form onSubmit={handleSubmitFeedback} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">Rate Your Experience</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-10 h-10 ${
                            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {rating === 5
                        ? "Excellent!"
                        : rating === 4
                          ? "Good!"
                          : rating === 3
                            ? "Average"
                            : rating === 2
                              ? "Poor"
                              : "Very Poor"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Your Comments</label>
                  <textarea
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Tell us what you think about our service..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    rows={5}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Submit Feedback
                </button>
              </form>
            </div>

            {/* Previous Feedbacks */}
            {feedbacks.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
                <h3 className="text-xl font-bold text-foreground mb-6">Your Previous Feedback</h3>
                <div className="space-y-4">
                  {feedbacks.map((feedback) => (
                    <div key={feedback.id} className="p-5 border border-gray-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < feedback.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-2">{feedback.createdAt}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{feedback.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-blue-50 rounded-xl">
              <h3 className="font-semibold text-foreground mb-2">How do I record my voice for the form?</h3>
              <p className="text-sm text-muted-foreground">
                Click the microphone button on the form page and speak clearly. The app will transcribe your speech
                automatically.
              </p>
            </div>

            <div className="p-5 bg-blue-50 rounded-xl">
              <h3 className="font-semibold text-foreground mb-2">What languages are supported?</h3>
              <p className="text-sm text-muted-foreground">
                We support English, Hindi, Tamil, Telugu, Kannada, Malayalam, and more. Select your preferred language
                before recording.
              </p>
            </div>

            <div className="p-5 bg-blue-50 rounded-xl">
              <h3 className="font-semibold text-foreground mb-2">How can I track my submission?</h3>
              <p className="text-sm text-muted-foreground">
                Use your tracking ID to check the status of your submission. You'll also receive email updates.
              </p>
            </div>

            <div className="p-5 bg-blue-50 rounded-xl">
              <h3 className="font-semibold text-foreground mb-2">Is my data secure?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, all your data is encrypted and stored securely. We comply with all data protection regulations.
              </p>
            </div>

            <div className="p-5 bg-blue-50 rounded-xl">
              <h3 className="font-semibold text-foreground mb-2">Can I upload documents?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can upload supporting documents for forms that require them. We support PDF, JPG, and PNG
                formats.
              </p>
            </div>

            <div className="p-5 bg-blue-50 rounded-xl">
              <h3 className="font-semibold text-foreground mb-2">How do I contact admin?</h3>
              <p className="text-sm text-muted-foreground">
                Use the live chat feature to connect with an admin in real-time for immediate assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
