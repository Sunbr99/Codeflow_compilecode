import React, { useState } from 'react';
import { Crown, Sparkles, Shield, Terminal, ArrowRight, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashIntroProps {
  onEnter: () => void;
  onOpenBrandAssets?: () => void;
}

export const SplashIntro: React.FC<SplashIntroProps> = ({ onEnter, onOpenBrandAssets }) => {
  const [isEntering, setIsEntering] = useState(false);

  const handleEnterClick = () => {
    setIsEntering(true);
    setTimeout(() => {
      onEnter();
    }, 800);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between text-cyan-100 overflow-hidden select-none"
        style={{
          backgroundImage: `url('/darkness_genesis_splash.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay for perfect contrast */}
        <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" />

        {/* Ambient background glow & cyber particles */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-600/20 rounded-full blur-[140px]" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-950/40 rounded-full blur-[100px]" />
        </div>

        {/* Top Decorative Border */}
        <div className="relative z-10 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-purple-500 shadow-[0_0_20px_rgba(0,240,255,0.8)]" />

        {/* Main Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center max-w-5xl px-6 py-10 my-auto text-center">
          
          {/* Side mystical labels */}
          <div className="hidden lg:flex justify-between w-full absolute top-1/2 -translate-y-1/2 px-10 pointer-events-none text-cyan-400/70 text-xs tracking-[0.35em] uppercase font-mono">
            <div className="flex flex-col space-y-1.5 text-left border-l-2 border-cyan-500/50 pl-4 bg-black/60 p-2 rounded-r backdrop-blur-xs">
              <span className="font-bold text-cyan-300">CYBER</span>
              <span>NEURAL</span>
              <span>DECOMPILE</span>
              <span>REVERSE</span>
              <span>SYNTAX</span>
            </div>
            <div className="flex flex-col space-y-1.5 text-right border-r-2 border-purple-500/50 pr-4 bg-black/60 p-2 rounded-l backdrop-blur-xs">
              <span className="font-bold text-purple-400">HYDRA</span>
              <span>SECURITY</span>
              <span>ANALYSIS</span>
              <span>OBFUSCATE</span>
              <span>PROTECT</span>
            </div>
          </div>

          {/* Logo Motif */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mb-5"
          >
            <div className="absolute -inset-6 bg-cyan-500/35 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-36 h-36 sm:w-48 sm:h-48 mx-auto rounded-3xl bg-[#090d18]/95 border-2 border-cyan-400 shadow-[0_0_50px_rgba(0,240,255,0.6)] backdrop-blur-md overflow-hidden p-1.5 flex items-center justify-center">
              <img
                src="/app-logo.jpg"
                alt="CodeFlow Cyber Crest Logo"
                className="w-full h-full object-contain rounded-2xl drop-shadow-[0_0_25px_rgba(0,240,255,0.7)]"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>

          {/* Subtitle / ID */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex items-center space-x-3 text-cyan-400/95 text-sm tracking-[0.4em] uppercase mb-2 font-mono"
          >
            <span className="w-10 h-[1px] bg-cyan-500/70"></span>
            <span className="font-bold text-cyan-300 drop-shadow-md">:hk-bridge9</span>
            <span className="w-10 h-[1px] bg-purple-500/70"></span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-sans font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-purple-400 mb-3 drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]"
          >
            CODEFLOW CYBER
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-sm sm:text-base text-cyan-100/90 max-w-xl mx-auto mb-6 font-light tracking-wide font-mono drop-shadow-md"
          >
            Universal Decompiler, Reverse-Engineering Suite & Security Logic Visualizer
          </motion.p>

          {/* Tagline Box */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="px-6 py-2 rounded-full bg-slate-950/80 border border-cyan-500/50 text-cyan-300 text-xs sm:text-sm tracking-[0.25em] uppercase mb-8 shadow-2xl backdrop-blur-md flex items-center gap-3"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>NOT A HERO / NOT A VILLAIN / JUST A CREATOR</span>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <button
              onClick={handleEnterClick}
              disabled={isEntering}
              className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 text-slate-950 font-black text-base sm:text-lg tracking-wider uppercase shadow-[0_0_35px_rgba(0,240,255,0.6)] hover:shadow-[0_0_55px_rgba(0,240,255,0.9)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Terminal className="w-5 h-5 text-slate-950" />
              <span className="relative z-10 font-bold">ENTER CODEFLOW</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            </button>

            {onOpenBrandAssets && (
              <button
                type="button"
                onClick={() => {
                  onEnter();
                  onOpenBrandAssets();
                }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-cyan-300 border border-cyan-500/50 hover:border-cyan-400 font-semibold text-sm tracking-wide shadow-lg transition-all duration-300 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>ดู & โหลดโลโก้ MW และไอคอนแอป</span>
              </button>
            )}
          </motion.div>

        </div>

        {/* Footer with Trademark copyright & overlaid SDK Signature */}
        <div className="relative z-10 w-full pb-6 px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-cyan-300 font-mono border-t border-cyan-500/40 pt-4 bg-black/90 backdrop-blur-lg shadow-[0_-5px_25px_rgba(6,182,212,0.25)]">
          <div className="relative flex flex-col items-center sm:items-start">
            <div className="tracking-widest text-amber-300 font-bold drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]">
              ™copyright w aistudio.&&gemini.
            </div>
            {/* Overlaid SDK package signature watermark */}
            <div className="absolute -top-3 left-0 sm:left-auto sm:right-0 opacity-25 pointer-events-none font-mono text-[10px] text-cyan-400 tracking-[0.3em] uppercase whitespace-nowrap">
              [SDK: @google/genai-v3.0.0-infra]
            </div>
          </div>
          <div className="flex items-center gap-2 text-cyan-200 mt-2 sm:mt-0">
            <span className="text-[10px] uppercase tracking-widest text-cyan-400/90 font-bold">SDK Signature:</span>
            <span className="font-serif italic text-amber-300 tracking-wider font-extrabold drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]">
              :hk-bridge9 • AI Studio & Gemini Core Engine [Infra-Secured]
            </span>
          </div>
        </div>

        {/* Bottom Cyberpunk Neon Border */}
        <div className="relative z-10 w-full h-1 bg-gradient-to-r from-cyan-500 via-amber-400 to-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.8)]" />
      </motion.div>
    </AnimatePresence>
  );
};

