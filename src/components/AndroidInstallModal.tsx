import React, { useState } from 'react';
import {
  Smartphone,
  Terminal,
  Download,
  Check,
  Copy,
  ExternalLink,
  X,
  Play,
  FolderArchive,
  Info
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadProjectZip: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
  onDownloadProjectZip,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'pwa' | 'termux'>('pwa');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-100">
                ติดตั้ง CodeFlow บนเครื่อง Android (PWA & Termux)
              </h3>
              <p className="text-xs text-slate-400">
                เลือกรูปแบบการติดตั้งที่เหมาะกับอุปกรณ์ Android ของคุณ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'pwa'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg -mb-px'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>วิธีที่ 1: ติดตั้งเป็นแอป Android ทันที (PWA 1-Click)</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-800 font-bold">
              แนะนำ
            </span>
          </button>

          <button
            onClick={() => setActiveTab('termux')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'termux'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg -mb-px'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>วิธีที่ 2: Build & รันบน Termux (Offline / Local Server)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-slate-700 text-xs">
          {activeTab === 'pwa' ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-emerald-950 text-sm">
                    ติดตั้งเป็น Android Application แท้ผ่าน WebAPK / PWA
                  </div>
                  <p className="text-emerald-800 leading-relaxed">
                    ระบบรองรับ Progressive Web App (PWA) เต็มรูปแบบ Android จะสร้างตัวแอปพลิเคชันพร้อมไอคอนบนหน้าจอหลัก (Home Screen) เปิดแบบเต็มหน้าจอ Standalone ไม่มีแถบ URL ของเบราว์เซอร์ และเก็บ Cache ออฟไลน์ได้
                  </p>
                </div>
              </div>

              {/* Install Action */}
              {isInstalled ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">
                    ตรวจพบว่าคุณกำลังเปิดใช้งานในโหมดแอปพลิเคชัน (Standalone PWA) เรียบร้อยแล้ว!
                  </span>
                </div>
              ) : isInstallable ? (
                <div className="text-center py-3">
                  <button
                    onClick={async () => {
                      const success = await install();
                      if (success) onClose();
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer text-sm"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>แตะที่นี่เพื่อติดตั้งแอป CodeFlow ลงเครื่อง Android</span>
                  </button>
                  <p className="text-[11px] text-slate-500 mt-2">
                    หรือเลือกเมนูจุด 3 จุด (⋮) ใน Chrome / Edge แล้วเลือก "ติดตั้งแอปพลิเคชัน"
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-semibold text-slate-800 flex items-center gap-2">
                    <Info className="w-4 h-4 text-slate-600" />
                    <span>ขั้นตอนการติดตั้งบนมือถือ Android:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1">
                    <li>เปิดหน้านี้บนเบราว์เซอร์ <strong>Google Chrome</strong>, <strong>Samsung Internet</strong> หรือ <strong>Edge</strong> บนมือถือ</li>
                    <li>แตะที่ไอคอน <strong>จุดสามจุด (⋮)</strong> ที่มุมขวาบนของเบราว์เซอร์</li>
                    <li>เลือกเมนู <strong>"ติดตั้งแอปพลิเคชัน" (Install app)</strong> หรือ <strong>"เพิ่มลงในหน้าจอหลัก" (Add to Home screen)</strong></li>
                    <li>กดยืนยัน <strong>"ติดตั้ง"</strong> — ระบบ Android จะสร้างไอคอนแอปบนหน้าจอมือถือของคุณทันที</li>
                  </ol>
                </div>
              )}

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-semibold text-slate-900 mb-1">⚡ ไม่ต้องลงโปรแกรมเสริม</div>
                  <p className="text-[11px] text-slate-500">ติดตั้งได้ทันทีจากเบราว์เซอร์โดยตรง ไม่เปลืองเนื้อที่เครื่อง</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-semibold text-slate-900 mb-1">📱 หน้าต่าง Standalone</div>
                  <p className="text-[11px] text-slate-500">ทำงานเหมือนแอปทั่วไป มีไอคอนใน App Drawer แยกต่างหาก</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-semibold text-slate-900 mb-1">💾 แคชออฟไลน์ในตัว</div>
                  <p className="text-[11px] text-slate-500">โหลดไวและเปิดใช้งานได้ลื่นไหลแม้เน็ตไม่เสถียร</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <Terminal className="w-4 h-4" />
                  <span>Build Pack & Local Server บน Termux (Android)</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  ในไฟล์ ZIP ของโปรแกรมเราได้ใส่สคริปต์ <strong>`termux_install.sh`</strong> และ <strong>`termux_start.sh`</strong> ไว้พร้อมแล้ว เมื่อคุณแตกไฟล์ใน Termux สามารถสั่ง Build และรันเซิร์ฟเวอร์แบบออฟไลน์ได้ 100%
                </p>
              </div>

              {/* Quick Action Download */}
              <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl border border-slate-200">
                <div>
                  <div className="font-semibold text-slate-800">1. ดาวน์โหลดไฟล์โปรแกรม (.ZIP)</div>
                  <div className="text-[11px] text-slate-500">แพ็กเกจ Source Code พร้อมสคริปต์ Termux สำหรับ Android</div>
                </div>
                <button
                  onClick={onDownloadProjectZip}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด ZIP</span>
                </button>
              </div>

              {/* Step by Step commands */}
              <div className="space-y-3">
                <div className="font-semibold text-slate-800">2. คำสั่งรันใน Termux บน Android:</div>

                {/* Command 1: Setup storage */}
                <div className="space-y-1">
                  <div className="text-slate-600 font-medium text-[11px]">
                    ก. ให้สิทธิ์ Termux เข้าถึงโฟลเดอร์ Download:
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 text-emerald-400 font-mono p-2.5 rounded-lg text-xs">
                    <span>termux-setup-storage</span>
                    <button
                      onClick={() => copyToClipboard('termux-setup-storage', 'cmd1')}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
                      title="คัดลอกคำสั่ง"
                    >
                      {copiedCmd === 'cmd1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Command 2: cd & install */}
                <div className="space-y-1">
                  <div className="text-slate-600 font-medium text-[11px]">
                    ข. ย้ายไปยังโฟลเดอร์ที่แตกไฟล์ แล้วรันตัวติดตั้งอัตโนมัติ (ติดตั้ง Node.js & Dependencies):
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 text-emerald-400 font-mono p-2.5 rounded-lg text-xs">
                    <span className="truncate pr-2">bash termux_install.sh</span>
                    <button
                      onClick={() => copyToClipboard('bash termux_install.sh', 'cmd2')}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer shrink-0"
                      title="คัดลอกคำสั่ง"
                    >
                      {copiedCmd === 'cmd2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Command 3: start */}
                <div className="space-y-1">
                  <div className="text-slate-600 font-medium text-[11px]">
                    ค. เริ่มรันโปรแกรม (จะเปิดเบราว์เซอร์ที่ http://localhost:3000 ให้อัตโนมัติ):
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 text-emerald-400 font-mono p-2.5 rounded-lg text-xs">
                    <span className="truncate pr-2">bash termux_start.sh</span>
                    <button
                      onClick={() => copyToClipboard('bash termux_start.sh', 'cmd3')}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer shrink-0"
                      title="คัดลอกคำสั่ง"
                    >
                      {copiedCmd === 'cmd3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* F-Droid Note */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <span>💡 คำแนะนำเกี่ยวกับแอป Termux:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  ควรดาวน์โหลด Termux จาก <strong>F-Droid</strong> (เนื่องจากเวอร์ชันบน Google Play Store หยุดการอัปเดตและแพ็กเกจเก่า) โดยค้นหา "Termux" บน F-Droid เพื่อการทำงานที่เสถียรที่สุด
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50">
          <div className="text-[11px] text-slate-500">
            {activeTab === 'pwa'
              ? 'รองรับ Android 8.0 ขึ้นไป ทั้งสมาร์ตโฟนและแท็บเล็ต'
              : 'ไฟล์สคริปต์ termux_install.sh ถูกบรรจุใน ZIP เรียบร้อยแล้ว'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg transition-colors cursor-pointer text-xs"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
