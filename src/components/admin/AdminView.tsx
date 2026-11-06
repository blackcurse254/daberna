import React, { useState } from 'react';
import { 
  Users, Settings, ShieldCheck, Activity, Search,
  LayoutDashboard, SlidersHorizontal, AlertTriangle, Coins,
  UserCheck, Ban, UserCog, RefreshCw, CheckCircle, ToggleLeft, ToggleRight
} from 'lucide-react';
import { UserInfo, AuditLog, SystemErrorLog, PlatformSettings } from '../../types';

interface AdminOverviewData {
  totalUsers: number;
  totalGames: number;
  totalScoreDistributed: number;
  users: UserInfo[];
  rooms: Array<{ id: string; name: string; tag: string; entry: number; badge: string }>;
  settings?: PlatformSettings;
  auditLogs?: AuditLog[];
  errorLogs?: SystemErrorLog[];
}

interface AdminViewProps {
  overview: AdminOverviewData;
  onToggleBan: (userId: number | string) => Promise<void>;
  onToggleRole: (userId: number | string, role: 'PLAYER' | 'ADMIN') => Promise<void>;
  onGrantChips: (userId: number | string, amount: number) => Promise<void>;
  onUpdateRoomEntry: (roomId: string, entry: number) => Promise<void>;
  onUpdateSettings: (settings: Partial<PlatformSettings>) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const AdminView: React.FC<AdminViewProps> = ({
  overview,
  onToggleBan,
  onToggleRole,
  onGrantChips,
  onUpdateRoomEntry,
  onUpdateSettings,
  onRefresh
}) => {
  const [adminTab, setAdminTab] = useState<'overview' | 'users' | 'rooms' | 'settings' | 'logs' | 'errors'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // Settings State
  const [settingsForm, setSettingsForm] = useState<PlatformSettings>(() => {
    return overview.settings || {
      maintenanceMode: false,
      dailyBonusAmount: 50000,
      freeStarterChips: 350000,
      minEntryChips: 20000,
      chatEnabled: true
    };
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGrantPrompt = async (userId: number | string, username: string) => {
    const val = window.prompt(`تعداد سکه رایگان اهدایی به ${username} را وارد کنید:`, '50000');
    if (val && !isNaN(Number(val)) && Number(val) > 0) {
      await onGrantChips(userId, parseInt(val, 10));
    }
  };

  const handleRoomEntryPrompt = async (roomId: string, roomName: string) => {
    const val = window.prompt(`تعداد سکه ورودی جدید برای ${roomName} را وارد کنید:`, '20000');
    if (val && !isNaN(Number(val)) && Number(val) > 0) {
      await onUpdateRoomEntry(roomId, parseInt(val, 10));
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateSettings(settingsForm);
  };

  const filteredUsers = overview.users.filter(u => 
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.fullname.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.phone.includes(userSearch)
  );

  return (
    <main className="max-w-7xl mx-auto px-4 mt-8 space-y-6">
      
      {/* Admin Top Header Banner */}
      <div className="bg-gradient-to-r from-[#22234A] via-[#11162B] to-[#22234A] rounded-3xl border border-[#9575FF]/30 p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#9575FF]/15 border border-[#9575FF]/40 flex items-center justify-center shadow-[0_0_15px_rgba(149,117,255,0.25)]">
            <ShieldCheck className="w-6 h-6 text-[#20D6C2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black text-[#EAF2FF]">کنسول مدیریت عالی Daberna VIP</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#20D6C2]/20 text-[#20D6C2] border border-[#20D6C2]/40">
                100% FREE • SERVER RBAC
              </span>
            </div>
            <p className="text-xs text-[#EAF2FF]/60 mt-0.5">مرکز نظارت بر بازی‌های آنلاین، مدیریت دسترسی‌ها و پایش خطاهای سرور</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5">
          <button 
            type="button"
            onClick={handleRefresh}
            className="p-2.5 rounded-xl bg-[#22234A] border border-[#9575FF]/30 text-[#EAF2FF] hover:text-[#20D6C2] flex items-center gap-1.5 text-xs font-bold cursor-pointer transition shadow"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#20D6C2]' : ''}`} />
            به‌روزرسانی لحظه‌ای
          </button>
          <span className="text-xs font-bold text-[#20D6C2] bg-[#20D6C2]/10 border border-[#20D6C2]/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#20D6C2] animate-pulse" />
            دیتابیس آنلاین
          </span>
        </div>
      </div>

      {/* Main Admin Grid with Sidebar Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          <div className="bg-[#22234A]/70 p-3 rounded-3xl border border-[#9575FF]/20 shadow-xl space-y-1.5">
            <button
              type="button"
              onClick={() => setAdminTab('overview')}
              className={`w-full py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                adminTab === 'overview'
                  ? 'bg-gradient-to-r from-[#20D6C2] to-[#9575FF] text-[#11162B] font-black shadow-md'
                  : 'text-[#EAF2FF]/70 hover:text-white hover:bg-[#11162B]/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>داشبورد آماری</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAdminTab('users')}
              className={`w-full py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                adminTab === 'users'
                  ? 'bg-gradient-to-r from-[#20D6C2] to-[#9575FF] text-[#11162B] font-black shadow-md'
                  : 'text-[#EAF2FF]/70 hover:text-white hover:bg-[#11162B]/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>مدیریت کاربران و نقش‌ها</span>
              </div>
              <span className="text-[10px] text-[#EAF2FF]/50 font-mono">
                {overview.users.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAdminTab('rooms')}
              className={`w-full py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                adminTab === 'rooms'
                  ? 'bg-gradient-to-r from-[#20D6C2] to-[#9575FF] text-[#11162B] font-black shadow-md'
                  : 'text-[#EAF2FF]/70 hover:text-white hover:bg-[#11162B]/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-4 h-4" />
                <span>میزهای بازی و سهمیه</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAdminTab('settings')}
              className={`w-full py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                adminTab === 'settings'
                  ? 'bg-gradient-to-r from-[#20D6C2] to-[#9575FF] text-[#11162B] font-black shadow-md'
                  : 'text-[#EAF2FF]/70 hover:text-white hover:bg-[#11162B]/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4" />
                <span>تنظیمات عمومی پلتفرم</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAdminTab('logs')}
              className={`w-full py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                adminTab === 'logs'
                  ? 'bg-gradient-to-r from-[#20D6C2] to-[#9575FF] text-[#11162B] font-black shadow-md'
                  : 'text-[#EAF2FF]/70 hover:text-white hover:bg-[#11162B]/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4" />
                <span>گزارش رویدادهای سیستم</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAdminTab('errors')}
              className={`w-full py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                adminTab === 'errors'
                  ? 'bg-gradient-to-r from-[#FF7185] to-[#9575FF] text-[#11162B] font-black shadow-md'
                  : 'text-[#EAF2FF]/70 hover:text-white hover:bg-[#11162B]/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#FF7185]" />
                <span>گزارش خطاهای سرور</span>
              </div>
              {overview.errorLogs && overview.errorLogs.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FF7185] text-[#11162B]">
                  {overview.errorLogs.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* OVERVIEW TAB */}
          {adminTab === 'overview' && (
            <div className="space-y-6">
              {/* 4 Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-[#22234A]/80 p-5 rounded-3xl border border-[#9575FF]/20 shadow-lg">
                  <span className="text-[11px] text-[#EAF2FF]/60">کاربران ثبت‌شده کل</span>
                  <p className="text-2xl font-black text-[#20D6C2] mt-1">{overview.totalUsers}</p>
                </div>

                <div className="bg-[#22234A]/80 p-5 rounded-3xl border border-[#9575FF]/20 shadow-lg">
                  <span className="text-[11px] text-[#EAF2FF]/60">تعداد دورهای بازی‌شده</span>
                  <p className="text-2xl font-black text-[#EAF2FF] mt-1">
                    {overview.totalGames.toLocaleString('fa-IR')}
                  </p>
                </div>

                <div className="bg-[#22234A]/80 p-5 rounded-3xl border border-[#9575FF]/20 shadow-lg">
                  <span className="text-[11px] text-[#EAF2FF]/60">مجموع سکه‌های اهدایی</span>
                  <p className="text-2xl font-black text-[#9575FF] mt-1">
                    {overview.totalScoreDistributed.toLocaleString('fa-IR')}
                  </p>
                </div>

                <div className="bg-[#22234A]/80 p-5 rounded-3xl border border-[#9575FF]/20 shadow-lg">
                  <span className="text-[11px] text-[#EAF2FF]/60">وضعیت پلتفرم</span>
                  <p className="text-xl font-black text-[#20D6C2] mt-1">۱۰۰٪ رایگان و امن</p>
                </div>
              </div>

              {/* Status & Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#22234A]/60 p-6 rounded-3xl border border-[#22234A] space-y-3">
                  <h3 className="text-sm font-black text-[#20D6C2] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> سازوکار ضد تقلب و قرعه‌کشی منصفانه
                  </h3>
                  <p className="text-xs text-[#EAF2FF]/70 leading-relaxed">
                    سرور مرجع متمرکز برای استخراج تصادفی اعداد است و ادعای برنده شدن با بررسی ماتریس کارت کاربران اعتبارسنجی می‌شود.
                  </p>
                </div>

                <div className="bg-[#22234A]/60 p-6 rounded-3xl border border-[#22234A] space-y-3">
                  <h3 className="text-sm font-black text-[#9575FF] flex items-center gap-2">
                    <Activity className="w-4 h-4" /> رمزنگاری سشن‌ها و رمزهای عبور
                  </h3>
                  <p className="text-xs text-[#EAF2FF]/70 leading-relaxed">
                    تمام پسوردها با الگوریتم استاندارد Scrypt و سالت تصادفی محافظت شده و توکن‌ها با کلید اختصاصی امضا می‌شوند.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {adminTab === 'users' && (
            <div className="bg-[#22234A]/70 rounded-3xl border border-[#9575FF]/20 p-6 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#20D6C2]" />
                  <h3 className="text-base font-black text-[#EAF2FF]">مدیریت حساب‌های کاربری و نقش‌ها</h3>
                </div>
                
                <div className="relative w-full sm:w-64">
                  <input 
                    type="text" 
                    placeholder="جستجوی کاربر یا شماره..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-[#11162B] border border-[#22234A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#20D6C2] pr-8"
                  />
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute top-2.5 right-2.5" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-[#22234A] text-[#EAF2FF]/60">
                      <th className="pb-3 font-bold">کاربر</th>
                      <th className="pb-3 font-bold">نقش</th>
                      <th className="pb-3 font-bold">موجودی سکه</th>
                      <th className="pb-3 font-bold">بردها</th>
                      <th className="pb-3 font-bold">وضعیت</th>
                      <th className="pb-3 font-bold text-center">اقدامات مدیریتی</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#22234A]/60">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-[#11162B]/50 transition">
                        <td className="py-3.5 font-bold text-white">
                          {u.fullname}
                          <span className="block text-[10px] text-[#EAF2FF]/50 font-normal font-mono">@{u.username}</span>
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            u.isAdmin 
                              ? 'bg-[#FF7185]/20 text-[#FF7185] border border-[#FF7185]/40' 
                              : 'bg-[#22234A] text-slate-300'
                          }`}>
                            {u.isAdmin ? 'مدیر (ADMIN)' : 'بازیکن عادی'}
                          </span>
                        </td>
                        <td className="py-3.5 text-[#20D6C2] font-black font-mono">
                          {u.balance.toLocaleString('fa-IR')} سکه
                        </td>
                        <td className="py-3.5 text-[#9575FF] font-bold">{u.totalWins} بار</td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${u.status === 'فعال' ? 'bg-[#20D6C2]/20 text-[#20D6C2]' : 'bg-[#FF7185]/20 text-[#FF7185]'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              type="button"
                              onClick={() => handleGrantPrompt(u.id!, u.username)}
                              className="px-2.5 py-1 rounded-xl bg-[#20D6C2]/15 border border-[#20D6C2]/30 text-[#20D6C2] hover:bg-[#20D6C2]/25 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                              title="اهدای سکه رایگان"
                            >
                              <Coins className="w-3 h-3" /> اهدای سکه
                            </button>
                            <button 
                              type="button"
                              onClick={() => onToggleRole(u.id!, u.isAdmin ? 'PLAYER' : 'ADMIN')}
                              className="px-2.5 py-1 rounded-xl bg-[#9575FF]/15 border border-[#9575FF]/30 text-[#9575FF] hover:bg-[#9575FF]/25 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                              title="تغییر نقش کاربری"
                            >
                              <UserCog className="w-3 h-3" /> {u.isAdmin ? 'عزل مدیر' : 'ارتقا به مدیر'}
                            </button>
                            <button 
                              type="button"
                              onClick={() => onToggleBan(u.id!)}
                              className={`px-2.5 py-1 rounded-xl border text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                                u.status === 'فعال' 
                                  ? 'bg-[#FF7185]/15 border-[#FF7185]/30 text-[#FF7185] hover:bg-[#FF7185]/25' 
                                  : 'bg-[#20D6C2]/15 border-[#20D6C2]/30 text-[#20D6C2]'
                              }`}
                            >
                              {u.status === 'فعال' ? <Ban className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                              {u.status === 'فعال' ? 'مسدودسازی' : 'رفع مسدودی'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ROOMS TAB */}
          {adminTab === 'rooms' && (
            <div className="bg-[#22234A]/70 rounded-3xl border border-[#9575FF]/20 p-6 shadow-2xl">
              <h3 className="text-base font-black text-[#20D6C2] mb-6 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#20D6C2]" /> تنظیمات ورودی و ظرفیت میزهای دبرنا
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {overview.rooms.map((room) => (
                  <div key={room.id} className="bg-[#11162B] p-5 rounded-2xl border border-[#22234A] space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-white text-sm">{room.name}</h4>
                      <span className="text-[10px] bg-[#9575FF]/20 text-[#20D6C2] px-2 py-0.5 rounded font-black">{room.badge}</span>
                    </div>
                    <div className="text-xs space-y-1">
                      <span className="text-[#EAF2FF]/60 block">ورودی هر کارت:</span>
                      <span className="text-lg font-black text-[#20D6C2] block font-mono">{room.entry.toLocaleString('fa-IR')} سکه</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleRoomEntryPrompt(room.id, room.name)}
                      className="w-full py-2 rounded-xl bg-[#22234A] border border-[#9575FF]/30 text-xs font-bold text-[#EAF2FF] hover:bg-[#9575FF]/20 transition cursor-pointer"
                    >
                      تغییر ورودی سکه
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {adminTab === 'settings' && (
            <div className="bg-[#22234A]/70 rounded-3xl border border-[#9575FF]/20 p-6 shadow-2xl">
              <h3 className="text-base font-black text-[#20D6C2] mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#20D6C2]" /> پیکربندی عمومی سامانه
              </h3>
              
              <form onSubmit={handleSaveSettings} className="space-y-5 text-xs max-w-xl">
                <div>
                  <label className="text-slate-300 block mb-1.5 font-bold">سکه هدیه اولیه برای ثبت‌نام کاربران جدید:</label>
                  <input 
                    type="number"
                    value={settingsForm.freeStarterChips}
                    onChange={(e) => setSettingsForm({ ...settingsForm, freeStarterChips: Number(e.target.value) })}
                    className="w-full bg-[#11162B] border border-[#22234A] rounded-xl px-4 py-2.5 text-white focus:border-[#20D6C2] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1.5 font-bold">میزان پاداش ورود روزانه (Daily Login Bonus):</label>
                  <input 
                    type="number"
                    value={settingsForm.dailyBonusAmount}
                    onChange={(e) => setSettingsForm({ ...settingsForm, dailyBonusAmount: Number(e.target.value) })}
                    className="w-full bg-[#11162B] border border-[#22234A] rounded-xl px-4 py-2.5 text-white focus:border-[#20D6C2] focus:outline-none font-mono"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#11162B] border border-[#22234A]">
                  <div>
                    <span className="font-bold text-white block">فعال‌بودن چت زنده در اتاق‌ها</span>
                    <span className="text-[10px] text-slate-400">امکان ارسال پیام و افکت‌های صوتی بین بازیکنان</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettingsForm({ ...settingsForm, chatEnabled: !settingsForm.chatEnabled })}
                    className="text-[#20D6C2] cursor-pointer"
                  >
                    {settingsForm.chatEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#11162B] border border-[#22234A]">
                  <div>
                    <span className="font-bold text-white block">حالت تعمیر و نگهداری (Maintenance Mode)</span>
                    <span className="text-[10px] text-slate-400">فقط مدیران امکان ورود به سامانه را خواهند داشت</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettingsForm({ ...settingsForm, maintenanceMode: !settingsForm.maintenanceMode })}
                    className="text-[#FF7185] cursor-pointer"
                  >
                    {settingsForm.maintenanceMode ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
                  </button>
                </div>

                <button
                  type="submit"
                  className="py-3 px-6 rounded-2xl bg-gradient-to-r from-[#20D6C2] to-[#9575FF] text-[#11162B] font-black text-xs hover:brightness-110 shadow-lg cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> ذخیره تنظیمات پلتفرم
                </button>
              </form>
            </div>
          )}

          {/* LOGS TAB */}
          {adminTab === 'logs' && (
            <div className="bg-[#22234A]/70 rounded-3xl border border-[#9575FF]/20 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-[#20D6C2] flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#20D6C2]" /> ثبت وقایع امنیتی و رخدادهای سرور (Audit Trail)
                </h3>
                <span className="text-[10px] bg-[#11162B] px-3 py-1 rounded-xl text-[#20D6C2] font-mono border border-[#22234A]">
                  غیرقابل دستکاری
                </span>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {overview.auditLogs && overview.auditLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-2xl bg-[#11162B] border border-[#22234A] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[10px] bg-[#22234A] text-[#20D6C2] px-2.5 py-0.5 rounded-lg font-bold">
                        {log.action}
                      </span>
                      <span className="text-white font-bold">توسط @{log.performedBy}</span>
                      {log.target && <span className="text-[#9575FF]">روی @{log.target}</span>}
                      {log.details && <span className="text-[#EAF2FF]/60 text-[11px]">({log.details})</span>}
                    </div>
                    <span className="text-[10px] text-[#EAF2FF]/40 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString('fa-IR')}
                    </span>
                  </div>
                ))}
                {(!overview.auditLogs || overview.auditLogs.length === 0) && (
                  <div className="text-center py-8 text-[#EAF2FF]/40 text-xs">
                    هنوز رخدادی ثبت نشده است.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ERRORS TAB */}
          {adminTab === 'errors' && (
            <div className="bg-[#22234A]/70 rounded-3xl border border-[#FF7185]/30 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-[#FF7185] flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#FF7185]" /> گزارش خطاهای ثبت‌شده سرور
                </h3>
                <span className="text-[10px] bg-[#FF7185]/20 text-[#FF7185] px-3 py-1 rounded-xl font-bold">
                  {overview.errorLogs ? overview.errorLogs.length : 0} خطا
                </span>
              </div>

              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {overview.errorLogs && overview.errorLogs.map((err) => (
                  <div key={err.id} className="p-3.5 rounded-2xl bg-[#11162B] border border-[#FF7185]/20 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] bg-[#FF7185]/20 text-[#FF7185] px-2 py-0.5 rounded font-bold">
                        {err.level} • {err.endpoint || 'SERVER'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(err.timestamp).toLocaleTimeString('fa-IR')}
                      </span>
                    </div>
                    <p className="text-white font-bold">{err.message}</p>
                    {err.stack && (
                      <pre className="text-[10px] text-slate-400 font-mono bg-black/40 p-2 rounded-xl overflow-x-auto max-h-24">
                        {err.stack}
                      </pre>
                    )}
                  </div>
                ))}
                {(!overview.errorLogs || overview.errorLogs.length === 0) && (
                  <div className="text-center py-8 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" /> وضعیت سرور کاملاً پایدار است و خطایی ثبت نشده است.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

    </main>
  );
};
