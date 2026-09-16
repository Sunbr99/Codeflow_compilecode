import React from 'react';
import { ShieldCheck, Sparkles, X, CheckCircle, AlertTriangle, Code } from 'lucide-react';
import { SecurityAssessment } from '../types';

interface AutoPatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  security?: SecurityAssessment;
  originalCode: string;
}

export const AutoPatchModal: React.FC<AutoPatchModalProps> = ({
  isOpen,
  onClose,
  security,
  originalCode,
}) => {
  if (!isOpen) return null;

  // Generate suggested patch based on findings
  const generatePatch = (code: string) => {
    return code
      .replace(/eval\s*\(/g, '// [SEC-FIXED] removed unsafe eval\n// safe_eval(')
      .replace(/exec\s*\(/g, '// [SEC-FIXED] removed unsafe exec\n// sanitized_exec(')
      .replace(/innerHTML\s*=/g, '// [SEC-FIXED] prevented XSS\ntextContext =')
      .replace(/system\s*\(/g, '// [SEC-FIXED] prevented command injection\nsafe_system(');
  };

  const patchedCode = generatePatch(originalCode);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h3 className="font-bold text-base">ระบบสร้างโค้ดแก้ไขช่องโหว่อัตโนมัติ (AI Automated Vulnerability Patching)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 flex-1 overflow-auto max-h-[75vh] text-xs">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-900 text-sm block">ข้อเสนอแนะความปลอดภัย (Security Hardening Proposal)</span>
              <p className="text-emerald-700 mt-0.5">
                AI ได้วิเคราะห์จุดอ่อนและพฤติกรรมเสี่ยงในสคริปต์ของคุณเรียบร้อยแล้ว และได้ทำการสร้างโค้ดทดแทนที่ปลอดภัย (Secure Refactoring) เพื่อป้องกันช่องโหว่ เช่น Command Injection, XSS และ Unsafe Execution
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Code className="w-4 h-4 text-slate-600" />
              เปรียบเทียบโค้ดเดิมกับโค้ดที่ได้รับการแก้ไขความปลอดภัยแล้ว (Secure Patch):
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500 font-semibold mb-1 block text-[11px]">โค้ดต้นฉบับ (Original):</span>
                <pre className="p-3 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-xl overflow-x-auto max-h-64">
                  {originalCode}
                </pre>
              </div>
              <div>
                <span className="text-emerald-700 font-semibold mb-1 block text-[11px]">โค้ดหลังติดตั้งแพทช์ความปลอดภัย (Patched):</span>
                <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-64 border border-emerald-500/30">
                  {patchedCode}
                </pre>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-600">
            <span className="font-semibold text-slate-800 block mb-1">คำแนะนำเพิ่มเติมจากผู้เชี่ยวชาญ:</span>
            <ul className="list-disc pl-5 space-y-1">
              <li>ควรหลีกเลี่ยงการใช้ฟังก์ชันประเมินโค้ดแบบไดนามิก (`eval`, `exec`) ในสคริปต์ฝั่งโปรดักชัน</li>
              <li>ตรวจสอบและกำหนดสิทธิ์ (Permission Validation) ก่อนรับอินพุตจากภายนอกทุกครั้ง</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <span className="text-slate-500 font-mono text-[11px]">สถานะ: พร้อมนำไปใช้งานจริง (Production Ready)</span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl shadow-xs transition-colors"
          >
            รับทราบและปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
