import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Sparkles,
  Smartphone,
  Monitor,
  Shield,
  Layers,
  Image as ImageIcon,
  ExternalLink,
  Code
} from 'lucide-react';

interface AppBrandAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSplash?: () => void;
}

export const AppBrandAssetsModal: React.FC<AppBrandAssetsModalProps> = ({
  isOpen,
  onClose,
  onOpenSplash,
}) => {
  const [activeTab, setActiveTab] = useState<'icons' | 'logo' | 'splash' | 'guide'>('icons');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadAsset = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/50 overflow-hidden my-6 text-slate-100">
        
        {/* Modal Top Header with Neon Cyber Aesthetic */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-400/60 shadow-lg shadow-cyan-500/20 bg-black flex items-center justify-center p-0.5">
              <img
                src="/app-icon.jpg"
                alt="Cyber Crest Icon"
                className="w-full h-full object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-cyan-200 tracking-wide flex items-center gap-2">
                  <span>สัญลักษณ์ ไอคอน & โลโก้แอปพลิเคชัน</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Official Assets
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                ดาวน์โหลดและดูตัวอย่างไอคอนสำหรับ Android APK, iOS, PWA และโลโก้ CodeFlow Cyber
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenSplash && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSplash();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>เปิด Splash Screen</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="ปิด"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('icons')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'icons'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60 rounded-t-lg -mb-px'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>ไอคอนแอพพลิเคชั่น (App Icons)</span>
          </button>

          <button
            onClick={() => setActiveTab('logo')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'logo'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60 rounded-t-lg -mb-px'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>ตราสัญลักษณ์ & โลโก้หลัก (Brand Crest)</span>
          </button>

          <button
            onClick={() => setActiveTab('splash')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'splash'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60 rounded-t-lg -mb-px'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>ภาพพื้นหลัง Splash & Wallpaper</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'guide'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60 rounded-t-lg -mb-px'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>วิธีนำไปติดตั้งใน APK / Web</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 max-h-[72vh] overflow-y-auto space-y-6">

          {/* TAB 1: APP ICONS */}
          {activeTab === 'icons' && (
            <div className="space-y-6">
              {/* Highlight Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-purple-950/50 border border-cyan-500/30 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-xl shadow-cyan-500/30 bg-black flex items-center justify-center">
                    <img
                      src="/app-icon.jpg"
                      alt="Cyber Emblem App Icon"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-black shadow-md ring-2 ring-slate-900">
                    ⚡
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h4 className="text-base font-bold text-white">MW Cyber App Icon (ไอคอนแอพพลิเคชั่น MW)</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      512 x 512 High-Res
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      MW Monogram
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    สัญลักษณ์อักษรย่อไซเบอร์เนติกส์ <strong>MW</strong> เรืองแสงสีฟ้านีออนและม่วง พร้อมเขาจักรกลหมาป่าและเกราะชีลด์หกเหลี่ยม สำหรับเป็นไอคอนแอพพลิเคชัน Android APK, iOS, PWA และ Shortcut
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                    <button
                      onClick={() => downloadAsset('/pwa-512x512.png', 'codeflow-icon-512.png')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>ดาวน์โหลด PNG 512x512</span>
                    </button>
                    <button
                      onClick={() => downloadAsset('/icon.svg', 'codeflow-icon.svg')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-medium text-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>ดาวน์โหลด Vector SVG</span>
                    </button>
                    <button
                      onClick={() => copyText('/app-icon.jpg', 'icon-path')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium text-xs transition-colors cursor-pointer"
                    >
                      {copiedKey === 'icon-path' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'icon-path' ? 'คัดลอก URL แล้ว' : 'คัดลอก URL Path'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Multi-Platform Icon Previews */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-cyan-400" />
                  <span>ตัวอย่างการแสดงผลบนอุปกรณ์และแพลตฟอร์มต่างๆ</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Android Squircle */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center text-center space-y-3">
                    <div className="text-[11px] font-medium text-slate-400">Android Launcher (Squircle)</div>
                    <div className="w-16 h-16 rounded-[22px] overflow-hidden border-2 border-slate-700 shadow-lg shadow-black/80 p-0.5 bg-black">
                      <img
                        src="/pwa-192x192.png"
                        alt="Android Squircle"
                        className="w-full h-full object-cover rounded-[18px]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="text-[11px] font-mono text-cyan-400">CodeFlow</div>
                    <button
                      onClick={() => downloadAsset('/pwa-192x192.png', 'android-icon-192.png')}
                      className="w-full py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors cursor-pointer"
                    >
                      ดาวน์โหลด (192px)
                    </button>
                  </div>

                  {/* iOS App Icon */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center text-center space-y-3">
                    <div className="text-[11px] font-medium text-slate-400">iOS / iPadOS (Continuous)</div>
                    <div className="w-16 h-16 rounded-[18px] overflow-hidden border-2 border-slate-700 shadow-lg shadow-black/80 bg-black">
                      <img
                        src="/apple-touch-icon.png"
                        alt="iOS Icon"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="text-[11px] font-mono text-cyan-400">CodeFlow</div>
                    <button
                      onClick={() => downloadAsset('/apple-touch-icon.png', 'apple-touch-icon.png')}
                      className="w-full py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors cursor-pointer"
                    >
                      ดาวน์โหลด (Apple)
                    </button>
                  </div>

                  {/* PWA / Windows Desktop */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center text-center space-y-3">
                    <div className="text-[11px] font-medium text-slate-400">Desktop / Taskbar</div>
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-cyan-500/50 shadow-md shadow-cyan-500/20 bg-slate-900 p-1 flex items-center justify-center">
                      <img
                        src="/app-icon.jpg"
                        alt="Desktop App Icon"
                        className="w-full h-full object-cover rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="text-[11px] font-mono text-cyan-400">PWA 512px</div>
                    <button
                      onClick={() => downloadAsset('/pwa-512x512.png', 'pwa-512.png')}
                      className="w-full py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors cursor-pointer"
                    >
                      ดาวน์โหลด (512px)
                    </button>
                  </div>

                  {/* Browser Favicon */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center text-center space-y-3">
                    <div className="text-[11px] font-medium text-slate-400">Browser Tab Favicon</div>
                    <div className="w-16 h-16 flex items-center justify-center bg-slate-900 border border-slate-700 rounded-lg">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 shadow-sm">
                        <img
                          src="/app-icon.jpg"
                          alt="Favicon"
                          className="w-4 h-4 rounded-xs object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[10px] text-slate-300 font-mono">CodeFlow</span>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-cyan-400">Tab Icon</div>
                    <button
                      onClick={() => downloadAsset('/app-icon.jpg', 'favicon.jpg')}
                      className="w-full py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors cursor-pointer"
                    >
                      ดาวน์โหลด Favicon
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BRAND LOGO EMBLEM */}
          {activeTab === 'logo' && (
            <div className="space-y-6">
              {/* Primary MW Cyber Crest Logo */}
              <div className="flex flex-col lg:flex-row items-center gap-6 p-6 rounded-2xl bg-slate-950 border-2 border-cyan-500/40 shadow-xl shadow-cyan-950/40">
                <div className="relative group shrink-0">
                  <div className="w-56 h-56 rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-[0_0_40px_rgba(0,240,255,0.4)] bg-black p-1 flex items-center justify-center">
                    <img
                      src="/mw-logo.jpg"
                      alt="MW Cyber Crest Logo"
                      className="w-full h-full object-contain rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                    MW OFFICIAL
                  </div>
                </div>

                <div className="flex-1 space-y-3 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      MW CYBER EMBLEM
                    </span>
                    <span className="text-xs text-cyan-400 font-mono">1024 x 1024 Ultra-Res</span>
                  </div>

                  <h4 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-purple-300">
                    โลโก้ MW Cyber Demon Beast Crest
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    ตราสัญลักษณ์โลโก้หลัก <strong>MW</strong> สไตล์ Cyberpunk Esports & Security พร้อมหน้ากากจักรกลหมาป่าไซเบอร์ เขาพลังงานนีออนสีฟ้า-ม่วง เกราะชีลด์หกเหลี่ยม และตัวอักษร <strong>MW</strong> โครเมียมนีออนเรืองแสง
                  </p>

                  <div className="pt-2 flex flex-wrap gap-2.5">
                    <button
                      onClick={() => downloadAsset('/mw-logo.jpg', 'MW-Cyber-Crest-Logo.jpg')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>ดาวน์โหลดโลโก้ MW (High-Res)</span>
                    </button>
                    <button
                      onClick={() => downloadAsset('/icon.svg', 'MW-Cyber-Vector.svg')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 font-medium text-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>ดาวน์โหลด MW Vector SVG</span>
                    </button>
                    <button
                      onClick={() => copyText('<img src="/mw-logo.jpg" alt="MW Logo" width="300" />', 'html-mw-logo')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-medium text-xs transition-colors cursor-pointer"
                    >
                      {copiedKey === 'html-mw-logo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'html-mw-logo' ? 'คัดลอก HTML แล้ว' : 'คัดลอก HTML'}</span>
                    </button>
                    <button
                      onClick={() => copyText('![MW Logo](/mw-logo.jpg)', 'md-mw-logo')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium text-xs transition-colors cursor-pointer"
                    >
                      {copiedKey === 'md-mw-logo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'md-mw-logo' ? 'คัดลอก Markdown แล้ว' : 'Markdown'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Alternative Cyber Emblem */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-700 bg-black shrink-0 p-1">
                  <img
                    src="/app-icon.jpg"
                    alt="MW App Icon"
                    className="w-full h-full object-cover rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <div className="font-semibold text-white text-xs flex items-center justify-center sm:justify-start gap-2">
                    <span>MW Cyber Monogram App Badge</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">1:1 Icon</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    เวอร์ชันสัญลักษณ์ไอคอนทรงสี่เหลี่ยมโค้ง (Squircle) สำหรับนำไปใช้เป็นปุ่มแอปพลิเคชันหรือ Avatar
                  </p>
                </div>
                <button
                  onClick={() => downloadAsset('/mw-app-icon.jpg', 'MW-App-Icon.jpg')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-medium cursor-pointer"
                >
                  ดาวน์โหลดรูปนี้
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SPLASH & WALLPAPER */}
          {activeTab === 'splash' && (
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden border border-cyan-500/30 bg-black relative shadow-2xl group">
                <img
                  src="/darkness_genesis_splash.jpg"
                  alt="Cyber Command Center Splash"
                  className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex flex-col justify-end p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-bold text-white drop-shadow-md">
                        Cyberspace Command Center (16:9 4K Wallpaper)
                      </h4>
                      <p className="text-xs text-cyan-200 drop-shadow-md">
                        ภาพพื้นหลังศูนย์บัญชาการไซเบอร์ พร้อมหน้าจอ HUD โค้ดดิ้งและตราสัญลักษณ์นีออน
                      </p>
                    </div>
                    <button
                      onClick={() => downloadAsset('/darkness_genesis_splash.jpg', 'codeflow-cyber-wallpaper.jpg')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/30 transition-all cursor-pointer shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>ดาวน์โหลด Wallpaper HD</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HOW TO INSTALL IN APK / WEB */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span>การติดตั้งไอคอนใน Android Studio / Capacitor APK</span>
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  หากคุณทำการสร้างแอป Android ด้วยสคริปต์ <code>./build_apk_capacitor.sh</code> หรือเปิดใน Android Studio ไฟล์ไอคอนจะอยู่ในโฟลเดอร์ทรัพยากรของ Android:
                </p>
                <div className="p-3 bg-slate-900 rounded-lg font-mono text-slate-300 space-y-1">
                  <div>📁 android/app/src/main/res/</div>
                  <div className="pl-4 text-cyan-400">├── mipmap-mdpi/ic_launcher.png (48x48)</div>
                  <div className="pl-4 text-cyan-400">├── mipmap-hdpi/ic_launcher.png (72x72)</div>
                  <div className="pl-4 text-cyan-400">├── mipmap-xhdpi/ic_launcher.png (96x96)</div>
                  <div className="pl-4 text-cyan-400">├── mipmap-xxhdpi/ic_launcher.png (144x144)</div>
                  <div className="pl-4 text-cyan-400">└── mipmap-xxxhdpi/ic_launcher.png (192x192)</div>
                </div>
                <p className="text-slate-400">
                  ไฟล์ <code>public/pwa-512x512.png</code> และ <code>public/app-icon.jpg</code> ได้รับการปรับปรุงเป็นรูปสัญลักษณ์ใหม่แล้ว และสามารถคัดลอกไปทับไฟล์ไอคอนในโปรเจกต์ Android ได้ทันที
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-purple-400" />
                  <span>การตั้งค่า Web & PWA Manifest</span>
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  ในไฟล์ <code>index.html</code> และ <code>public/manifest.webmanifest</code> ระบบเชื่อมโยงไอคอนเหล่านี้ไว้เรียบร้อยแล้ว:
                </p>
                <div className="p-3 bg-slate-900 rounded-lg font-mono text-slate-300 space-y-1 overflow-x-auto">
                  <div className="text-emerald-400">&lt;link rel="icon" type="image/jpeg" href="/app-icon.jpg" /&gt;</div>
                  <div className="text-emerald-400">&lt;link rel="apple-touch-icon" href="/app-icon.jpg" /&gt;</div>
                  <div className="text-emerald-400">&lt;link rel="manifest" href="/manifest.webmanifest" /&gt;</div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono text-cyan-300">CodeFlow Cyber Assets v2.5</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
