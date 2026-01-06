'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

/**
 * Additional Sections Component
 * Includes Level Up, Practice, Build Portfolio, Community, and Testimonials sections
 */
export function AdditionalSections() {
  return (
    <>
      {/* Level Up Section */}
      <section className="py-20 px-4 bg-[var(--color-background)]">
        <div className="container-responsive max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-96 rounded-2xl overflow-hidden border border-[var(--color-border)]"
            >
              <Image
                src="/images/features/build.png"
                alt="Level Up Interface"
                fill
                className="object-fill"
                style={{ imageRendering: 'pixelated' }}
              />
            </motion.div>

            {/* Right - Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-[family-name:var(--font-pixel)] text-3xl md:text-4xl lg:text-5xl text-[var(--color-text-primary)] mb-6" style={{ imageRendering: 'pixelated' }}>
                Level up your learning
              </h2>
              <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed mb-6">
                Gain XP and collect badges as you complete bite-sized lessons in financial literacy, savings strategies, and more. Our beginner-friendly curriculum makes learning to save money as motivating as completing your next quest.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Practice Coding Section */}
      <section className="py-20 px-4 bg-[var(--color-surface)]">
        <div className="container-responsive max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-[family-name:var(--font-pixel)] text-3xl md:text-4xl lg:text-5xl text-[var(--color-text-primary)] mb-6" style={{ imageRendering: 'pixelated' }}>
                Practice your smart money chops
              </h2>
              <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed mb-6">
                Take your skills further with money savings challenges and project tutorials designed to help you apply what you learned to real-world problems and examples.
              </p>
            </motion.div>

            {/* Right - Image Placeholder */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-96 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl overflow-hidden border border-[var(--color-border)]"
            >
              <Image
                src="/images/features/float.png"
                alt="Level Up Interface"
                fill
                className="object-cover"
                style={{ imageRendering: 'pixelated' }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Build Portfolio Section */}
      <section id="build" className="py-20 px-4 bg-[var(--color-background)]">
        <div className="container-responsive max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image Placeholder */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-96 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl overflow-hidden border border-[var(--color-border)]"
            >
              <Image
                src="/images/features/see.png"
                alt="Level Up Interface"
                fill
                className="object-cover"
                style={{ imageRendering: 'pixelated' }}
              />
            </motion.div>

            {/* Right - Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-[family-name:var(--font-pixel)] text-3xl md:text-4xl lg:text-5xl text-[var(--color-text-primary)] mb-6" style={{ imageRendering: 'pixelated' }}>
                Build an awesome portfolio
              </h2>
              <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed mb-6">
                Create your own interactive financial profit, savings, smart money, data visualizations, and show them off to friends or the world—all on Puddle.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-20 px-4 bg-[var(--color-surface)]">
        <div className="container-responsive max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-[family-name:var(--font-pixel)] text-3xl md:text-4xl lg:text-5xl text-[var(--color-text-primary)] mb-6" style={{ imageRendering: 'pixelated' }}>
                Make friends along the way
              </h2>
              <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed mb-6">
                Join a vibrant community of learners and creators. Share your progress, collaborate on projects, and celebrate each other's achievements as you all level up your financial skills together.
              </p>
            </motion.div>

            {/* Right - Image Placeholder */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-96 bg-gradient-to-br from-pink-400 to-purple-600 rounded-2xl overflow-hidden border border-[var(--color-border)]"
            >
              <Image
                src="/images/features/volcano.png"
                alt="Level Up Interface"
                fill
                className="object-cover"
                style={{ imageRendering: 'pixelated' }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-[var(--color-background)]">
        <div className="container-responsive max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-[family-name:var(--font-pixel)] text-3xl md:text-4xl lg:text-5xl text-[var(--color-text-primary)] mb-6" style={{ imageRendering: 'pixelated' }}>
              Loved by our community
            </h2>
          </motion.div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Testimonial 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex gap-6"
            >
              {/* Avatar Placeholder */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 border-4 border-[var(--color-border)] flex items-center justify-center text-5xl">
                RB
                </div>
              </div>

              {/* Testimonial Content */}
              <div className="flex-1">
                <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] relative">
                  {/* Speech bubble arrow */}
                  <div className="absolute left-0 top-8 -translate-x-2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-[var(--color-border)] border-b-8 border-b-transparent"></div>
                  
                  <div className="mb-4">
                    <h3 className="font-bold text-[var(--color-text-primary)] mb-1">Ray Cielo Briones</h3>
                    <p className="text-sm text-[var(--color-text-tertiary)]">Software Developer • Philippines</p>
                  </div>
                  
                  <p className="text-[var(--color-text-secondary)] leading-relaxed">
                    Puddle helped me understand financial concepts in a fun and interactive way. The gamified approach kept me engaged, and I loved earning badges as I progressed through the lessons!
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex gap-6"
            >
              {/* Avatar Placeholder */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-400 to-red-600 border-4 border-[var(--color-border)] flex items-center justify-center text-5xl">
                AC
                </div>
              </div>

              {/* Testimonial Content */}
              <div className="flex-1">
                <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] relative">
                  {/* Speech bubble arrow */}
                  <div className="absolute left-0 top-8 -translate-x-2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-[var(--color-border)] border-b-8 border-b-transparent"></div>
                  
                  <div className="mb-4">
                    <h3 className="font-bold text-[var(--color-text-primary)] mb-1">Arron Acasio</h3>
                    <p className="text-sm text-[var(--color-text-tertiary)]">Student • Philippines</p>
                  </div>
                  
                  <p className="text-[var(--color-text-secondary)] leading-relaxed">
                    I love how Puddle makes learning about money fun and interactive. The community is supportive, and the challenges really helped me apply what I learned. Highly recommend to anyone looking to improve their financial skills!
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
