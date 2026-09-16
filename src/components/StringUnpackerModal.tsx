import React, { useState } from 'react';
import { Terminal, Lock, Unlock, Copy, Check, X, RefreshCw } from 'lucide-react';

interface StringUnpackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StringUnpackerModal: React.FC<StringUnpackerModalProps> = ({ isOpen, onClose }) => {
  const [inputStr, setInputStr] = useState<string>('');
  const [keyStr, setKeyStr] = useState<string>('0x00');
  const [outputResult, setOutputResult] = useState<{
    ascii: string;
    base64Decoded: string;
    hexDecoded: string;
    xorDecoded: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleUnpack = () => {
    if (!inputStr.trim()) return;

    let ascii = '';
    let base64Decoded = '';
    let hexDecoded = '';
    let xorDecoded = '';

    // 1. Base64 attempt
    try {
      base64Decoded = atob(inputStr.trim());
    } catch {
      base64Decoded = '(ไม่สามารถแปลง Base64 ได้)';
    }

    // 2. Hex attempt (e.g., 48656c6c6f)
    try {
      const cleanedHex = inputStr.replace(/\\x|0x|\s+/g, '');
      const bytes = [];
      for (let i = 0; i < cleanedHex.length; i += 2) {
        bytes.push(parseInt(cleanedHex.substr(i, 2), 16));
      }
      hexDecoded = new TextDecoder().decode(new Uint8Array(bytes));
    } catch {
      hexDecoded = '(ไม่สามารถถอดรหัส Hex ได้)';
    }

    // 3. XOR attempt
    try {
      const keyNum = parseInt(keyStr, 16) || parseInt(keyStr, 10) || 1;
      const xorChars = [];
      for (let i = 0; i < inputStr.length; i++) {
        xorChars.push(String.fromCharCode(inputStr.charCodeAt(i) ^ keyNum));
      }
      xorDecoded = xorChars.join('');
    } catch {
      xorDecoded = '(ไม่สามารถถอดรหัส XOR ได้)';
    }

    setOutputResult({
      ascii: inputStr,
      base64Decoded,
      hexDecoded,
      xorDecoded,
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Unlock className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">เครื่องมือถอดรหัสสตริงและสตริงออบฟัสเคชัน (Binary & String Unpacker)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 flex-1 overflow-auto max-h-[75vh] text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              วางข้อความที่ถูกเข้ารหัส (Obfuscated String, Base64, Hex หรือ XOR payload):
            </label>
            <textarea
              rows={3}
              value={inputStr}
              onChange={(e) => setInputStr(e.target.value)}
              placeholder="ตัวอย่างเช่น SGVsbG8gd29ybGQ= หรือ 48656c6c6f"
              className="w-full p-3 font-mono border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-1/3">
              <label className="block font-medium text-slate-600 mb-1">XOR Key (ถ้ามี):</label>
              <input
                type="text"
                value={keyStr}
                onChange={(e) => setKeyStr(e.target.value)}
                placeholder="0x00 หรือ 5"
                className="w-full p-2 font-mono border border-slate-300 rounded-lg text-slate-800"
              />
            </div>
            <div className="flex-1 flex items-end">
              <button
                type="button"
                onClick={handleUnpack}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                ถอดรหัสข้อมูล (Unpack & Decrypt)
              </button>
            </div>
          </div>

          {outputResult && (
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm">ผลลัพธ์การถอดรหัสรูปแบบต่างๆ:</h4>

              <div className="space-y-2 font-mono">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span>Base64 Decoded:</span>
                    <button
                      onClick={() => handleCopy(outputResult.base64Decoded)}
                      className="text-slate-700 hover:text-slate-900 flex items-center gap-1 font-sans"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      คัดลอก
                    </button>
                  </div>
                  <div className="text-slate-800 break-all">{outputResult.base64Decoded}</div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span>Hex Decoded:</span>
                    <button
                      onClick={() => handleCopy(outputResult.hexDecoded)}
                      className="text-slate-700 hover:text-slate-900 flex items-center gap-1 font-sans"
                    >
                      <Copy className="w-3.5 h-3.5" /> คัดลอก
                    </button>
                  </div>
                  <div className="text-slate-800 break-all">{outputResult.hexDecoded}</div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span>XOR Decoded (Key: {keyStr}):</span>
                    <button
                      onClick={() => handleCopy(outputResult.xorDecoded)}
                      className="text-slate-700 hover:text-slate-900 flex items-center gap-1 font-sans"
                    >
                      <Copy className="w-3.5 h-3.5" /> คัดลอก
                    </button>
                  </div>
                  <div className="text-slate-800 break-all">{outputResult.xorDecoded}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
