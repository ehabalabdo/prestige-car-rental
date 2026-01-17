import React, { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import Modal from './Modal';

interface LogoUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoChange?: (logoData: string) => void;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ isOpen, onClose, onLogoChange }) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    const savedLogo = localStorage.getItem('prestige_logo');
    if (savedLogo) {
      setLogoPreview(savedLogo);
    }
  }, [isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // تحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صحيح');
      return;
    }

    // تحقق من حجم الملف (أقل من 2 ميجابايت)
    if (file.size > 2 * 1024 * 1024) {
      alert('حجم الملف كبير جداً (الحد الأقصى 2 ميجابايت)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const logoData = event.target?.result as string;
      setLogoPreview(logoData);
      localStorage.setItem('prestige_logo', logoData);
      onLogoChange?.(logoData);
      alert('تم حفظ الشعار بنجاح!');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    localStorage.removeItem('prestige_logo');
    onLogoChange?.('');
    alert('تم حذف الشعار');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تحميل شعار البرنامج">
      <div className="space-y-6">
        {/* Preview */}
        <div className="bg-black-900/50 p-6 rounded-xl border border-white/10 min-h-48 flex items-center justify-center">
          {logoPreview ? (
            <img src={logoPreview} alt="Logo Preview" className="max-w-full max-h-40 object-contain" />
          ) : (
            <div className="text-center">
              <div className="inline-flex p-4 bg-white/5 rounded-full text-gray-400 mb-3">
                <Upload size={32} />
              </div>
              <p className="text-gray-400 text-sm">لم يتم تحميل شعار بعد</p>
            </div>
          )}
        </div>

        {/* Upload Input */}
        <div>
          <label className="block text-gray-400 mb-3 text-sm font-bold">
            اختر صورة الشعار
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="w-full px-4 py-3 bg-black-900 border-2 border-dashed border-gold-500/50 rounded-lg text-white cursor-pointer hover:border-gold-500 transition-colors text-sm"
          />
          <p className="text-xs text-gray-500 mt-2">
            الأنواع المدعومة: JPG, PNG, GIF, SVG
            <br />
            الحد الأقصى للحجم: 2 ميجابايت
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {logoPreview && (
            <button
              onClick={handleRemoveLogo}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-3 rounded-lg font-bold transition-colors"
            >
              <X size={16} />
              حذف الشعار
            </button>
          )}
          <button
            onClick={onClose}
            className={`${logoPreview ? 'flex-1' : 'w-full'} bg-gold-500 text-black-900 hover:bg-gold-600 px-4 py-3 rounded-lg font-bold transition-colors`}
          >
            إغلاق
          </button>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-400">
          💡 سيتم حفظ الشعار تلقائياً في البرنامج ولن تحتاج لتحميله مرة أخرى
        </div>
      </div>
    </Modal>
  );
};

export default LogoUpload;
