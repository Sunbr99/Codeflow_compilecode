import React, { useState, useRef } from 'react';
import {
  X,
  Palette,
  Image as ImageIcon,
  Sparkles,
  Check,
  RotateCcw,
  Sliders,
  Layers,
  Sun,
  Moon,
  Upload,
  Eye,
  Brush
} from 'lucide-react';
import {
  ThemePalette,
  ButtonCornerStyle,
  ButtonElevationStyle,
  AppBackgroundStyle,
} from '../types/theme';
import { extractThemeFromImage, PRESET_THEMES } from '../utils/themeExtractor';

interface SettingsThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemePalette;
  onApplyTheme: (newTheme: ThemePalette) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SettingsThemeModal: React.FC<SettingsThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onApplyTheme,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'auto-image' | 'presets' | 'customize'>('auto-image');
  const [imagePreview, setImagePreview] = useState<string | null>(currentTheme.customBgImage || null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [useImageAsBackground, setUseImageAsBackground] = useState<boolean>(
    currentTheme.backgroundStyle === 'custom-image'
  );

  // Editable temporary theme
  const [tempTheme, setTempTheme] = useState<ThemePalette>(currentTheme);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle image upload & automatic color extraction
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setIsExtracting(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);

      // Run automatic color extraction from image
      const extracted = await extractThemeFromImage(dataUrl);

      const newTheme: ThemePalette = {
        id: 'auto-custom-' + Date.now(),
        name: `ธีมวิเคราะห์จากรูป (${file.name.slice(0, 12)}...)`,
        primary: extracted.dominantColor,
        primaryHover: extracted.secondaryColor,
        accent: extracted.accentColor,
        surfaceBg: extracted.isDarkPalette ? '#0f172a' : '#ffffff',
        pageBg: extracted.isDarkPalette ? '#020617' : '#f8fafc',
        textPrimary: extracted.isDarkPalette ? '#f8fafc' : '#0f172a',
        buttonRadius: extracted.suggestedButtonRadius,
        buttonElevation: extracted.suggestedElevation,
        backgroundStyle: useImageAsBackground ? 'custom-image' : extracted.suggestedBackground,
        customBgImage: dataUrl,
      };

      setTempTheme(newTheme);
      onApplyTheme(newTheme);
      setIsExtracting(false);
    };

    reader.readAsDataURL(file);
  };

  const handleApplyPreset = (preset: ThemePalette) => {
    setTempTheme(preset);
    onApplyTheme(preset);
  };

  const handleUpdateRadius = (radius: ButtonCornerStyle) => {
    const updated = { ...tempTheme, buttonRadius: radius };
    setTempTheme(updated);
    onApplyTheme(updated);
  };

  const handleUpdateElevation = (elevation: ButtonElevationStyle) => {
    const updated = { ...tempTheme, buttonElevation: elevation };
    setTempTheme(updated);
    onApplyTheme(updated);
  };

  const handleUpdateBgStyle = (bgStyle: AppBackgroundStyle) => {
    const updated = { ...tempTheme, backgroundStyle: bgStyle };
    setTempTheme(updated);
    onApplyTheme(updated);
  };

  const handleResetDefault = () => {
    const defaultTheme = PRESET_THEMES[0];
    setTempTheme(defaultTheme);
    setImagePreview(null);
    onApplyTheme(defaultTheme);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: tempTheme.primary }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>ตั้งค่าหน้าตา & ปรับแต่งธีมอัตโนมัติ (UI & Theme Studio)</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  AI Auto Theme
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                แนบรูปภาพเพื่อให้ระบบดูดโทนสี และสร้างธีมพื้นหลัง + รูปแบบปุ่มอัตโนมัติ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-5 text-xs bg-slate-50/40 dark:bg-slate-900/40">
          <button
            type="button"
            onClick={() => setActiveTab('auto-image')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'auto-image'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 dark:border-emerald-500'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>สร้างธีมจากรูปภาพอัตโนมัติ (Image Auto-Theme)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'presets'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 dark:border-emerald-500'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>ชุดธีมสำเร็จรูป (Preset Styles)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('customize')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'customize'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 dark:border-emerald-500'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>ปรับแต่งรูปแบบปุ่ม & พื้นหลัง (Customizer)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* TAB 1: Auto-Theme From Image */}
          {activeTab === 'auto-image' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-6 text-center transition-all bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer flex flex-col items-center space-y-2 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      คลิกเพื่อแนบรูปภาพตัวอย่าง
                    </span>
                    <span className="text-slate-500 dark:text-slate-400"> หรือลากไฟล์รูปมาวางที่นี่</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    รองรับภาพถ่าย, โลโก้, วอลเปเปอร์อนิเมะ, งานอาร์ต (PNG, JPG, WebP)
                  </p>
                </div>
              </div>

              {isExtracting && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl flex items-center gap-2 animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>กำลังวิเคราะห์และสกัดชุดสี (Palette Extraction Engine)...</span>
                </div>
              )}

              {/* Uploaded Image & Extracted Colors Display */}
              {imagePreview && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      ภาพต้นแบบและโทนสีที่สกัดได้
                    </span>
                    <label className="inline-flex items-center gap-2 cursor-pointer text-[11px] text-slate-600 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={tempTheme.backgroundStyle === 'custom-image'}
                        onChange={(e) => {
                          const useImg = e.target.checked;
                          setUseImageAsBackground(useImg);
                          handleUpdateBgStyle(useImg ? 'custom-image' : 'mesh-gradient');
                        }}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>ใช้วอลเปเปอร์รูปนี้เป็นพื้นหลังของแอพ</span>
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="w-24 h-16 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 shrink-0 shadow-xs">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <div className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: tempTheme.primary }} />
                        <div className="overflow-hidden">
                          <div className="text-[10px] text-slate-400">Primary Color</div>
                          <div className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                            {tempTheme.primary}
                          </div>
                        </div>
                      </div>

                      <div className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: tempTheme.primaryHover }} />
                        <div className="overflow-hidden">
                          <div className="text-[10px] text-slate-400">Secondary Color</div>
                          <div className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                            {tempTheme.primaryHover}
                          </div>
                        </div>
                      </div>

                      <div className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: tempTheme.accent }} />
                        <div className="overflow-hidden">
                          <div className="text-[10px] text-slate-400">Accent Color</div>
                          <div className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                            {tempTheme.accent}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Real-time Preview Card */}
              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 space-y-2.5">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>ตัวอย่างปุ่มที่สร้างขึ้นจากธีม (Live Button Preview)</span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    style={{ backgroundColor: tempTheme.primary }}
                    className={`px-3 py-1.5 text-white font-semibold text-xs transition-all shadow-xs ${
                      tempTheme.buttonRadius
                    } ${
                      tempTheme.buttonElevation === 'neon-glow'
                        ? 'shadow-[0_0_12px_rgba(16,185,129,0.5)] ring-1 ring-white/30'
                        : tempTheme.buttonElevation === 'glass'
                        ? 'backdrop-blur-md bg-opacity-80 border border-white/20'
                        : ''
                    }`}
                  >
                    ปุ่มหลัก (Primary Button)
                  </button>

                  <button
                    type="button"
                    style={{ borderColor: tempTheme.primary, color: tempTheme.primary }}
                    className={`px-3 py-1.5 border font-semibold text-xs bg-transparent transition-all ${tempTheme.buttonRadius}`}
                  >
                    ปุ่มเส้นขอบ (Outline)
                  </button>

                  <button
                    type="button"
                    style={{ backgroundColor: tempTheme.accent }}
                    className={`px-3 py-1.5 text-slate-900 font-semibold text-xs transition-all ${tempTheme.buttonRadius}`}
                  >
                    ปุ่มไฮไลต์ (Accent Tag)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Preset Themes */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_THEMES.map((preset) => {
                  const isSelected = tempTheme.id === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 relative group ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                          {preset.name}
                        </span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full shadow-2xs" style={{ backgroundColor: preset.primary }} />
                        <span className="w-5 h-5 rounded-full shadow-2xs" style={{ backgroundColor: preset.primaryHover }} />
                        <span className="w-5 h-5 rounded-full shadow-2xs" style={{ backgroundColor: preset.accent }} />
                        <span className="w-5 h-5 rounded-full shadow-2xs border border-slate-300 dark:border-slate-600" style={{ backgroundColor: preset.pageBg }} />
                        <span className="text-[10px] text-slate-400 ml-auto font-mono">
                          {preset.buttonRadius}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Customizer (Buttons & Backgrounds) */}
          {activeTab === 'customize' && (
            <div className="space-y-4">
              {/* Corner Radius */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-600" />
                  <span>ความโค้งมนของปุ่ม (Button Corner Radius)</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { id: 'rounded-none', label: 'เหลี่ยมมน (Sharp)' },
                    { id: 'rounded-md', label: 'โค้งน้อย (Small)' },
                    { id: 'rounded-lg', label: 'มาตรฐาน (Default)' },
                    { id: 'rounded-xl', label: 'โค้งมน (Rounded)' },
                    { id: 'rounded-2xl', label: 'โค้งมาก (Modern)' },
                    { id: 'rounded-full', label: 'แคปซูล (Pill)' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleUpdateRadius(item.id as ButtonCornerStyle)}
                      className={`p-2 border text-center transition-all text-[11px] font-medium ${item.id} ${
                        tempTheme.buttonRadius === item.id
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Button Elevation Style */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Brush className="w-4 h-4 text-emerald-600" />
                  <span>เอฟเฟกต์และมิติปุ่ม (Button Elevation & Glow)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'flat', label: 'แบนราบ (Flat UI)' },
                    { id: 'subtle-shadow', label: 'เงาละมุน (Subtle Shadow)' },
                    { id: 'neon-glow', label: 'แสงนีออน (Cyber Glow)' },
                    { id: 'glass', label: 'กระจกใส (Glassmorphism)' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleUpdateElevation(item.id as ButtonElevationStyle)}
                      className={`p-2.5 rounded-xl border text-center transition-all text-[11px] font-medium ${
                        tempTheme.buttonElevation === item.id
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* App Background Style */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>ลวดลายพื้นหลังของแอพ (App Canvas Style)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'default', label: 'เรียบง่าย (Clean Slate)' },
                    { id: 'mesh-gradient', label: 'ไล่เฉดมิติ (Mesh Gradient)' },
                    { id: 'cyberpunk-grid', label: 'ตารางไซเบอร์ (Grid Matrix)' },
                    { id: 'deep-midnight', label: 'มิดไนท์รัตติกาล (Midnight)' },
                    { id: 'warm-amber', label: 'อุ่นละมุน (Warm Amber)' },
                    { id: 'custom-image', label: 'ภาพแนบ (Custom Image)' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleUpdateBgStyle(item.id as AppBackgroundStyle)}
                      className={`p-2.5 rounded-xl border text-center transition-all text-[11px] font-medium ${
                        tempTheme.backgroundStyle === item.id
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={handleResetDefault}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>คืนค่าเริ่มต้น (Reset Default)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-xs cursor-pointer"
          >
            ใช้งานการตั้งค่านี้ (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
