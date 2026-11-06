import React, { useState } from 'react';
import { User, Lock, UserPlus, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { LuxuryDabernaLogo } from '../LuxuryDabernaLogo';

interface AuthModalProps {
  onLogin: (username: string, password?: string) => Promise<void>;
  onRegister: (username: string, fullname: string, phone: string, password?: string) => Promise<void>;
  errorNotice: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  onLogin, 
  onRegister, 
  errorNotice 
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [loginInput, setLoginInput] = useState({ username: '', password: '' });
  const [registerInput, setRegisterInput] = useState({ 
    username: '', 
    fullname: '', 
    phone: '', 
    password: '',
    confirmPassword: ''
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (!loginInput.username.trim() || !loginInput.password) {
      setValidationError('لطفاً نام کاربری و رمز عبور را وارد نمایید.');
      return;
    }
    setLoading(true);
    try {
      await onLogin(loginInput.username.trim(), loginInput.password);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (!registerInput.username.trim() || !registerInput.password) {
      setValidationError('نام کاربری و رمز عبور الزامی است.');
      return;
    }
    if (registerInput.password.length < 6) {
      setValidationError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }
    if (registerInput.password !== registerInput.confirmPassword) {
      setValidationError('رمز عبور و تکرار آن یکسان نیستند.');
      return;
    }

    setLoading(true);
    try {
      await onRegister(
        registerInput.username.trim(), 
        registerInput.fullname.trim(), 
        registerInput.phone.trim(),
        registerInput.password
      );
    } finally {
      setLoading(false);
    }
  };

  const activeError = validationError || errorNotice;

  return (
    <main className="max-w-md mx-auto px-4 mt-6 sm:mt-12">
      <div className="bg-gradient-to-b from-[#22234A]/95 via-[#11162B] to-[#0A0D1A] border-2 border-[#20D6C2]/40 hover:border-[#20D6C2]/70 transition-all rounded-3xl p-5 sm:p-8 shadow-[0_0_50px_rgba(32,214,194,0.2)] backdrop-blur-2xl relative overflow-hidden">
        
        {/* Top luminous accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#20D6C2] via-[#9575FF] to-[#FF7185] animate-pulse" />
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#20D6C2]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-5 sm:mb-6">
          <div className="flex justify-center mb-2.5">
            <LuxuryDabernaLogo />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1 flex items-center justify-center gap-2">
            <span>دبرنا لند</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20D6C2] to-[#9575FF]">VIP</span>
          </h2>
          <p className="text-xs text-[#EAF2FF]/70">
            ورود به بازی دبرنا • احراز هویت با نام کاربری و رمز عبور تأیید شده
          </p>
        </div>

        {activeError && (
          <div className="mb-4 p-3 rounded-2xl bg-[#FF7185]/15 border border-[#FF7185]/40 text-[#FF7185] text-xs text-center font-bold">
            {activeError}
          </div>
        )}

        {/* Tab Toggle */}
        <div className="flex bg-[#11162B] p-1.5 rounded-2xl border border-[#22234A] mb-5 text-xs font-bold">
          <button 
            type="button"
            onClick={() => {
              setValidationError(null);
              setAuthMode('login');
            }}
            className={`flex-1 py-2 rounded-xl transition cursor-pointer ${
              authMode === 'login' 
                ? 'bg-gradient-to-r from-[#20D6C2] to-[#1ABBA8] text-[#11162B] shadow-[0_0_15px_rgba(32,214,194,0.3)] font-black' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ورود به حساب
          </button>
          <button 
            type="button"
            onClick={() => {
              setValidationError(null);
              setAuthMode('register');
            }}
            className={`flex-1 py-2 rounded-xl transition cursor-pointer ${
              authMode === 'register' 
                ? 'bg-gradient-to-r from-[#9575FF] to-[#7B59F5] text-white shadow-[0_0_15px_rgba(149,117,255,0.3)] font-black' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ثبت‌نام جدید
          </button>
        </div>

        {authMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-bold">نام کاربری تأیید شده</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="نام کاربری حساب خود را وارد کنید"
                  value={loginInput.username}
                  onChange={(e) => setLoginInput({ ...loginInput, username: e.target.value })}
                  className="w-full bg-[#11162B] border border-[#22234A] focus:border-[#20D6C2] rounded-2xl px-4 py-2.5 text-white focus:outline-none pr-10 transition-colors"
                  required
                />
                <User className="w-4 h-4 text-slate-500 absolute top-3 right-3" />
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-bold">رمز عبور</label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="رمز عبور حساب"
                  value={loginInput.password}
                  onChange={(e) => setLoginInput({ ...loginInput, password: e.target.value })}
                  className="w-full bg-[#11162B] border border-[#22234A] focus:border-[#20D6C2] rounded-2xl px-4 py-2.5 text-white focus:outline-none pr-10 transition-colors"
                  required
                />
                <Lock className="w-4 h-4 text-slate-500 absolute top-3 right-3" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#20D6C2] to-[#9575FF] text-[#11162B] font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(32,214,194,0.25)] hover:brightness-105 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'در حال بررسی...' : 'ورود با نام کاربری و رمز عبور'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-bold">نام کاربری (حداقل ۳ کاراکتر)</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="مثال: شاهین_VIP"
                  value={registerInput.username}
                  onChange={(e) => setRegisterInput({ ...registerInput, username: e.target.value })}
                  className="w-full bg-[#11162B] border border-[#22234A] focus:border-[#9575FF] rounded-2xl px-4 py-2 text-white focus:outline-none pr-10 transition-colors"
                  required
                />
                <User className="w-4 h-4 text-slate-500 absolute top-2.5 right-3" />
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-bold">نام و نام خانوادگی</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="مثال: شاهین محمدی"
                  value={registerInput.fullname}
                  onChange={(e) => setRegisterInput({ ...registerInput, fullname: e.target.value })}
                  className="w-full bg-[#11162B] border border-[#22234A] focus:border-[#9575FF] rounded-2xl px-4 py-2 text-white focus:outline-none pr-10 transition-colors"
                />
                <UserPlus className="w-4 h-4 text-slate-500 absolute top-2.5 right-3" />
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-bold">شماره همراه (اختیاری)</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="09123456789"
                  value={registerInput.phone}
                  onChange={(e) => setRegisterInput({ ...registerInput, phone: e.target.value })}
                  className="w-full bg-[#11162B] border border-[#22234A] focus:border-[#9575FF] rounded-2xl px-4 py-2 text-white focus:outline-none pr-10 transition-colors"
                />
                <Phone className="w-4 h-4 text-slate-500 absolute top-2.5 right-3" />
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-bold">رمز عبور (حداقل ۶ کاراکتر)</label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="رمز عبور"
                  value={registerInput.password}
                  onChange={(e) => setRegisterInput({ ...registerInput, password: e.target.value })}
                  className="w-full bg-[#11162B] border border-[#22234A] focus:border-[#9575FF] rounded-2xl px-4 py-2 text-white focus:outline-none pr-10 transition-colors"
                  required
                />
                <Lock className="w-4 h-4 text-slate-500 absolute top-2.5 right-3" />
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-bold">تکرار رمز عبور</label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="تکرار رمز عبور"
                  value={registerInput.confirmPassword}
                  onChange={(e) => setRegisterInput({ ...registerInput, confirmPassword: e.target.value })}
                  className="w-full bg-[#11162B] border border-[#22234A] focus:border-[#9575FF] rounded-2xl px-4 py-2 text-white focus:outline-none pr-10 transition-colors"
                  required
                />
                <CheckCircle2 className="w-4 h-4 text-slate-500 absolute top-2.5 right-3" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#9575FF] via-[#20D6C2] to-[#9575FF] text-[#11162B] font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(149,117,255,0.3)] hover:brightness-105 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'در حال ثبت نام...' : 'ثبت‌نام و ایجاد حساب کاربری'}
            </button>
          </form>
        )}

        <div className="mt-5 pt-3.5 border-t border-[#22234A] flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-[#20D6C2]" />
          <span>پایگاه‌داده واقعی • امنیت رمزنگاری پسوردها با الگوریتم Scrypt</span>
        </div>
      </div>
    </main>
  );
};
