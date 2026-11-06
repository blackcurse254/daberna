import React, { useState } from 'react';
import { User, LogOut, Edit3, History } from 'lucide-react';
import { UserInfo, Transaction } from '../../types';

interface ProfileViewProps {
  userInfo: UserInfo;
  balance: number;
  transactions: Transaction[];
  onOpenWallet: () => void;
  onLogout: () => void;
  onSaveProfile: (data: { fullname: string; phone: string; email: string }) => Promise<void>;
  notice: string | null;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userInfo,
  balance,
  transactions,
  onOpenWallet,
  onLogout,
  onSaveProfile,
  notice
}) => {
  const [fullname, setFullname] = useState(userInfo.fullname || '');
  const [phone, setPhone] = useState(userInfo.phone || '');
  const [email, setEmail] = useState(userInfo.email || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveProfile({ fullname, phone, email });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 mt-8">
      <div className="space-y-6">
        
        {/* Futuristic Cyber Player ID Card */}
        <div className="bg-gradient-to-r from-[#22234A] via-[#11162B] to-[#22234A] rounded-3xl border border-[#9575FF]/30 p-6 sm:p-8 shadow-2xl backdrop-blur relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#20D6C2] to-transparent" />

          <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#20D6C2] to-[#9575FF] p-0.5 shadow-xl shadow-[#9575FF]/20">
                <div className="w-full h-full bg-[#11162B] rounded-[14px] flex items-center justify-center">
                  <User className="w-8 h-8 text-[#20D6C2]" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-black text-[#EAF2FF]">{userInfo.fullname || userInfo.username}</h2>
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-[#9575FF]/20 text-[#20D6C2] border border-[#20D6C2]/40 shadow-[0_0_8px_rgba(32,214,194,0.3)]">
                    {userInfo.vipLevel}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#20D6C2]/15 text-[#20D6C2] border border-[#20D6C2]/30 hidden xs:inline">
                    Cloud SQL
                  </span>
                </div>
                <p className="text-xs text-[#EAF2FF]/60 mt-1 font-mono">شناسه: @{userInfo.username} • {userInfo.email || 'بدون ایمیل'}</p>
                <p className="text-[10px] text-[#9575FF] mt-1">عضویت از: {userInfo.joinedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={onLogout}
                className="px-4 py-2.5 rounded-2xl bg-[#22234A] border border-[#FF7185]/30 text-[#FF7185] font-bold text-xs hover:bg-[#FF7185]/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> خروج از حساب
              </button>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#22234A]/70 p-5 rounded-2xl border border-[#9575FF]/20 shadow-lg">
            <span className="text-xs text-[#EAF2FF]/60 block mb-1">موجودی سکه رایگان</span>
            <span className="text-2xl font-black text-[#20D6C2]">
              {balance.toLocaleString('fa-IR')} <span className="text-xs font-normal text-[#EAF2FF]/80">سکه</span>
            </span>
          </div>
          <div className="bg-[#22234A]/70 p-5 rounded-2xl border border-[#9575FF]/20 shadow-lg">
            <span className="text-xs text-[#EAF2FF]/60 block mb-1">تعداد بازی‌ها / بردها</span>
            <span className="text-2xl font-black text-[#EAF2FF]">
              {userInfo.totalGames} <span className="text-xs text-[#9575FF] font-bold">({userInfo.totalWins} برد)</span>
            </span>
          </div>
          <div className="bg-[#22234A]/70 p-5 rounded-2xl border border-[#9575FF]/20 shadow-lg">
            <span className="text-xs text-[#EAF2FF]/60 block mb-1">مجموع امتیاز و سکه‌های کسب‌شده</span>
            <span className="text-2xl font-black text-[#20D6C2]">
              {userInfo.totalEarned.toLocaleString('fa-IR')} <span className="text-xs font-normal text-[#EAF2FF]/80">سکه</span>
            </span>
          </div>
        </div>

        {/* Forms & Transactions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Edit Profile */}
          <div className="bg-[#22234A]/60 rounded-3xl border border-[#9575FF]/20 p-6 shadow-xl">
            <h3 className="text-sm font-black text-[#20D6C2] mb-4 flex items-center gap-2">
              <Edit3 className="w-4 h-4" /> ویرایش اطلاعات شخصی
            </h3>
            {notice && (
              <div className="mb-3 p-2.5 rounded-xl bg-[#20D6C2]/15 border border-[#20D6C2]/40 text-[11px] text-[#20D6C2] font-bold">
                {notice}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[#EAF2FF]/70 block mb-1.5 font-bold">نام و نام خانوادگی</label>
                <input 
                  type="text" 
                  value={fullname} 
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full bg-[#11162B] border border-[#22234A] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#20D6C2]"
                />
              </div>
              <div>
                <label className="text-[#EAF2FF]/70 block mb-1.5 font-bold">شماره همراه</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#11162B] border border-[#22234A] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#20D6C2]"
                />
              </div>
              <div>
                <label className="text-[#EAF2FF]/70 block mb-1.5 font-bold">پست الکترونیکی (ایمیل)</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#11162B] border border-[#22234A] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#20D6C2]"
                />
              </div>
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#20D6C2] to-[#9575FF] text-[#11162B] font-black hover:brightness-125 transition cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </button>
            </form>
          </div>

          {/* Transactions List */}
          <div className="bg-[#22234A]/60 rounded-3xl border border-[#9575FF]/20 p-6 shadow-xl">
            <h3 className="text-sm font-black text-[#9575FF] mb-4 flex items-center gap-2">
              <History className="w-4 h-4" /> کارنامه و سوابق امتیازات
            </h3>
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto">
              {transactions.map((t) => (
                <div key={t.id} className="bg-[#11162B] p-3 rounded-2xl border border-[#22234A] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#EAF2FF] block">{t.type}</span>
                    <span className="text-[10px] text-[#EAF2FF]/40">{t.date}</span>
                  </div>
                  <div className="text-left">
                    <span className={`font-black block ${t.amount > 0 ? 'text-[#20D6C2]' : 'text-[#FF7185]'}`}>
                      {t.amount > 0 ? `+${t.amount.toLocaleString('fa-IR')}` : t.amount.toLocaleString('fa-IR')} سکه
                    </span>
                    <span className="text-[9px] text-[#EAF2FF]/50">{t.status}</span>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="text-center py-8 text-[#EAF2FF]/40 text-xs">
                  هنوز هیچ تراکنشی ثبت نشده است.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
};
