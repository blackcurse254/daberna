import React, { useState } from 'react';
import { MessageSquare, Send, Radio } from 'lucide-react';
import { ChatMessage, SoundEffectType } from '../../types';

interface ChatRoomProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onSendSoundReaction: (sound: SoundEffectType, label: string) => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  messages,
  onSendMessage,
  onSendSoundReaction
}) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSendMessage(newMessage.trim());
    setNewMessage('');
  };

  return (
    <div className="bg-[#11162B]/95 rounded-3xl border border-[#22234A] flex flex-col h-[560px] shadow-2xl backdrop-blur overflow-hidden">
      
      {/* Header */}
      <div className="p-3.5 border-b border-[#22234A] flex items-center justify-between bg-[#22234A]/40">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#20D6C2]" />
          <span className="text-xs font-black text-[#EAF2FF]">چت تعاملی اتاق</span>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] text-[#20D6C2] font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#20D6C2] animate-pulse" />
          سرور آنلاین
        </span>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`text-xs p-2.5 rounded-2xl transition-all ${
              msg.isSystem 
                ? 'bg-[#20D6C2]/10 text-[#20D6C2] border border-[#20D6C2]/20 text-center text-[10px] font-medium' 
                : msg.isReaction
                ? 'bg-gradient-to-r from-[#9575FF]/20 to-[#20D6C2]/15 text-[#EAF2FF] border border-[#9575FF]/30'
                : 'bg-[#22234A]/70 text-[#EAF2FF] border border-[#9575FF]/10'
            }`}
          >
            {!msg.isSystem && (
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-[#20D6C2] text-[11px] flex items-center gap-1">
                  {msg.sender}
                  {msg.isReaction && <Radio className="w-3 h-3 text-[#9575FF] animate-pulse" />}
                </span>
                <span className="text-[9px] text-[#EAF2FF]/40 font-mono">{msg.time}</span>
              </div>
            )}
            <p className="leading-relaxed break-words">{msg.text}</p>
          </div>
        ))}
      </div>

      {/* Futuristic Sound Reactions Bar */}
      <div className="px-3 py-2 bg-[#22234A]/50 border-t border-[#22234A] space-y-1.5">
        <span className="text-[9px] text-[#9575FF] font-bold block">ارسال افکت صوتی زنده:</span>
        <div className="grid grid-cols-4 gap-1.5 text-[10px] font-bold">
          <button 
            type="button"
            onClick={() => onSendSoundReaction('cheer', '📣 هورا!')} 
            className="p-1.5 rounded-xl bg-[#11162B] border border-[#22234A] text-[#20D6C2] hover:border-[#20D6C2]/50 hover:bg-[#20D6C2]/10 transition cursor-pointer"
          >
            📣 هورا
          </button>
          <button 
            type="button"
            onClick={() => onSendSoundReaction('coins', '🪙 سکه!')} 
            className="p-1.5 rounded-xl bg-[#11162B] border border-[#22234A] text-[#20D6C2] hover:border-[#20D6C2]/50 hover:bg-[#20D6C2]/10 transition cursor-pointer"
          >
            🪙 سکه
          </button>
          <button 
            type="button"
            onClick={() => onSendSoundReaction('win', '🎺 شیپور!')} 
            className="p-1.5 rounded-xl bg-[#11162B] border border-[#22234A] text-[#20D6C2] hover:border-[#20D6C2]/50 hover:bg-[#20D6C2]/10 transition cursor-pointer"
          >
            🎺 شیپور
          </button>
          <button 
            type="button"
            onClick={() => onSendSoundReaction('mark', '🎲 تاس!')} 
            className="p-1.5 rounded-xl bg-[#11162B] border border-[#22234A] text-[#20D6C2] hover:border-[#20D6C2]/50 hover:bg-[#20D6C2]/10 transition cursor-pointer"
          >
            🎲 تاس
          </button>
        </div>
      </div>

      {/* Emoji Drawer */}
      <div className="px-3 py-1.5 bg-[#11162B] border-t border-[#22234A]/60 flex justify-around">
        {['🔥', '😎', '🎰', '🎉', '💰', '💣'].map(emoji => (
          <button 
            key={emoji} 
            type="button"
            onClick={() => setNewMessage(prev => prev + emoji)}
            className="hover:scale-125 transition text-sm cursor-pointer p-1"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-2.5 bg-[#11162B] border-t border-[#22234A] flex gap-2">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="پیام خود را بنویسید..."
          className="flex-1 bg-[#22234A]/80 border border-[#9575FF]/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#20D6C2]"
          maxLength={150}
        />
        <button 
          type="submit" 
          className="p-2.5 rounded-xl bg-gradient-to-tr from-[#20D6C2] to-[#9575FF] text-[#11162B] hover:brightness-125 transition cursor-pointer"
          title="ارسال پیام"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
