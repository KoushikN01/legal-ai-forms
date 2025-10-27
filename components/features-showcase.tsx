"use client"

import { Mic, FileCheck, Zap, Lock, Clock, BarChart3 } from "lucide-react"

const features = [
  {
    icon: Mic,
    title: "Voice Recognition",
    description: "Advanced AI understands your voice in 50+ languages with 99% accuracy",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: FileCheck,
    title: "Auto-Fill Forms",
    description: "Intelligent mapping automatically fills legal form fields from your speech",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Process forms in seconds, not hours. Get instant results and tracking",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "Military-grade encryption protects your sensitive legal information",
    color: "from-pink-500 to-pink-600",
  },
  {
    icon: Clock,
    title: "Real-Time Tracking",
    description: "Monitor your submission status 24/7 with detailed progress updates",
    color: "from-orange-500 to-orange-600",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description: "Get insights into your submissions and processing timeline",
    color: "from-green-500 to-green-600",
  },
]

export default function FeaturesShowcase() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">Powerful Features for Legal Excellence</h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Everything you need to handle legal forms with confidence and ease
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group relative bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 hover:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/50"
            >
              {/* Gradient overlay on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
              />

              <div className="relative z-10">
                {/* Icon */}
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>

                {/* Bottom accent */}
                <div className="mt-6 pt-6 border-t border-slate-700/50 flex items-center text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-sm font-semibold">Learn more</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ArrowRight({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}
