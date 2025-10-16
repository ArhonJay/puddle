'use client';

import React from 'react';
import { PuddleLayout } from '@/components/layout/puddleLayout';
import { Bot, Sparkles, Zap, Brain } from 'lucide-react';

export default function AIPage() {
  return (
    <PuddleLayout>
      <div className="max-w-4xl mx-auto">
        {/* Coming Soon Card */}
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center px-4">
            {/* Animated Icon */}
            <div className="relative inline-block mb-6">
              {/* Floating sparkles */}
              <div className="absolute -top-4 -left-4 animate-bounce">
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="absolute -top-2 -right-6 animate-pulse delay-100">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <div className="absolute -bottom-3 -right-4 animate-bounce delay-200">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>

              {/* Main icon */}
              <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8 rounded-3xl shadow-2xl animate-pulse">
                <Bot className="w-20 h-20 sm:w-24 sm:h-24 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Puddle AI
            </h1>

            {/* Subtitle */}
            <div className="mb-8">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                Coming Soon
              </p>
              <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
                We're building something amazing! AI-powered task recommendations, 
                smart insights, and automated strategies are on the way.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PuddleLayout>
  );
}
