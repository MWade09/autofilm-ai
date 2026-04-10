'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SpaceBackground } from '@/components/SpaceBackground'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-center pt-32">
      <SpaceBackground />
      
      {/* Immersive Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black/90 pointer-events-none z-0"></div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Cinematic Header Section */}
        <header className="text-center mb-24 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter mb-6 relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                Dream
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]">
                In Motion.
              </span>
            </h1>
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.8, ease: "circOut" }}
              className="w-48 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 mx-auto rounded-full shadow-[0_0_20px_rgba(236,72,153,0.8)]"
            ></motion.div>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-xl md:text-3xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed font-light"
          >
            Turn any story idea into a Hollywood-style short film in under 10 minutes. 
            <br className="hidden md:block"/>
            <span className="text-white font-medium drop-shadow-md"> Powered by AI, designed for visionaries.</span>
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex gap-6 justify-center flex-wrap"
          >
            <Link href="/dashboard">
              <Button size="lg" className="text-xl px-10 py-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 rounded-full shadow-[0_0_30px_rgba(236,72,153,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(236,72,153,0.6)] group">
                Enter The Portal 
                <span className="ml-3 group-hover:translate-x-2 transition-transform duration-300 inline-block">→</span>
              </Button>
            </Link>
          </motion.div>
        </header>

        {/* Feature Cards Showcase */}
        <div className="grid md:grid-cols-3 gap-8 mb-10 max-w-6xl mx-auto relative">
          {/* Grid Background Glow */}
          <div className="absolute inset-0 bg-purple-500/5 blur-[100px] -z-10 rounded-full pointer-events-none"></div>

          {[
            { icon: "⚡", title: "Lightning Fast", desc: "No more waiting weeks for rendering. From prompt to final cut in under 10 minutes.", delay: 1.4 },
            { icon: "🎬", title: "Cinematic Quality", desc: "Multiple camera angles, dramatic lighting, and cohesive character persistence.", delay: 1.6 },
            { icon: "🌐", title: "Scale Your Influence", desc: "Download in 4K or share instantly via unique links to your audience.", delay: 1.8 }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: feature.delay }}
              className="backdrop-blur-xl bg-black/40 border border-white/5 p-10 rounded-3xl shadow-2xl hover:bg-white/[0.03] hover:border-white/10 transition-all duration-500 group"
            >
              <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-500 origin-left">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-4 text-white tracking-tight">
                {feature.title}
              </h3>
              <p className="text-gray-400 font-light leading-relaxed text-lg group-hover:text-gray-300 transition-colors duration-300">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
