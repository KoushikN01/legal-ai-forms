"use client"

import { ArrowRight, Mic, Shield, Globe } from "lucide-react"

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pt-20 pb-32">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-blue-300">AI-Powered Legal Forms</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                Speak Your Legal
                <span className="block bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  Forms Effortlessly
                </span>
              </h1>

              <p className="text-xl text-slate-300 leading-relaxed max-w-lg">
                Transform your voice into perfectly filled legal documents. No complex paperwork, no confusion. Just
                speak in your language and let AI handle the rest.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-3">
              {[
                { icon: Mic, text: "Voice-Powered Form Filling" },
                { icon: Globe, text: "Multi-Language Support" },
                { icon: Shield, text: "Bank-Level Security" },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 text-slate-200">
                  <feature.icon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span className="font-medium">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:-translate-y-1">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-slate-700/50 text-white rounded-xl font-semibold border border-slate-600 hover:bg-slate-700 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>

          {/* Right Image Section */}
          <div className="relative h-96 lg:h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl blur-2xl" />
            <div className="relative bg-gradient-to-br from-slate-700 to-slate-800 rounded-3xl p-8 border border-slate-600/50 shadow-2xl">
              <div className="space-y-6">
                {/* Animated form preview */}
                <div className="space-y-3">
                  <div className="h-3 bg-slate-600 rounded-full w-3/4 animate-pulse" />
                  <div className="h-3 bg-slate-600 rounded-full w-full animate-pulse" />
                  <div className="h-3 bg-slate-600 rounded-full w-5/6 animate-pulse" />
                </div>
                <div className="pt-4 border-t border-slate-600">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-blue-500/30 rounded-lg animate-bounce" />
                    <div className="flex-1 h-8 bg-slate-600 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
