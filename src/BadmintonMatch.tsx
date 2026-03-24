/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  MoreHorizontal, 
  CircleDot, 
  X,
  Delete
} from 'lucide-react';

interface SetScore {
  a: number;
  b: number;
  entered: boolean;
}

interface MatchState {
  playerA: { name: string; avatar: string }[];
  playerB: { name: string; avatar: string }[];
  sets: SetScore[];
  scorer: { name: string; avatar: string };
}

export default function BadmintonMatch() {
  const [match, setMatch] = useState<MatchState>({
    scorer: { name: "多喝咖啡少喝水", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=scorer" },
    playerA: [
      { name: "1号多喝咖...", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=p1" },
      { name: "2号跑不动...", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=p2" },
    ],
    playerB: [
      { name: "3号Dillon...", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=p3" },
      { name: "4号胖虎喵", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=p4" },
    ],
    sets: [
      { a: 0, b: 0, entered: false },
      { a: 0, b: 0, entered: false },
      { a: 0, b: 0, entered: false },
    ],
  });

  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);
  const [tempScore, setTempScore] = useState<{ a: string; b: string; active: 'a' | 'b' }>({ a: '', b: '', active: 'a' });

  const setWinners = useMemo(() => {
    return match.sets.map(s => {
      if (!s.entered) return null;
      if (s.a > s.b) return 'A';
      if (s.b > s.a) return 'B';
      return null;
    });
  }, [match.sets]);

  const winsA = setWinners.filter(w => w === 'A').length;
  const winsB = setWinners.filter(w => w === 'B').length;
  const isFinished = winsA >= 2 || winsB >= 2;

  const lastEnteredIndex = useMemo(() => {
    for (let i = match.sets.length - 1; i >= 0; i--) {
      if (match.sets[i].entered) return i;
    }
    return 0;
  }, [match.sets]);

  const openModal = (index: number) => {
    const set = match.sets[index];
    setTempScore({ 
      a: set.entered ? set.a.toString() : '', 
      b: set.entered ? set.b.toString() : '', 
      active: 'a' 
    });
    setEditingSetIndex(index);
  };

  const closeModal = () => setEditingSetIndex(null);

  const handleKeyClick = (key: string) => {
    setTempScore(prev => {
      const current = prev[prev.active];
      if (key === 'delete') {
        return { ...prev, [prev.active]: current.slice(0, -1) };
      }
      if (current.length >= 2) return prev;
      return { ...prev, [prev.active]: current + key };
    });
  };

  const confirmScore = () => {
    if (editingSetIndex === null) return;
    const newSets = [...match.sets];
    newSets[editingSetIndex] = {
      a: parseInt(tempScore.a) || 0,
      b: parseInt(tempScore.b) || 0,
      entered: true
    };
    
    // Logic: If 2-0, clear the 3rd set
    const w1 = newSets[0].entered ? (newSets[0].a > newSets[0].b ? 'A' : 'B') : null;
    const w2 = newSets[1].entered ? (newSets[1].a > newSets[1].b ? 'A' : 'B') : null;
    if (w1 && w2 && w1 === w2) {
      newSets[2] = { a: 0, b: 0, entered: false };
    }

    setMatch({ ...match, sets: newSets });
    closeModal();
  };

  return (
    <div className="min-h-screen bg-[#F0F4FF] font-sans text-[#333]">
      {/* Status Bar Space */}
      <div className="h-10" />

      {/* Navbar */}
      <div className="px-4 flex items-center justify-between mb-4">
        <ChevronLeft className="w-6 h-6 text-gray-600" />
        <h1 className="text-lg font-bold">对阵详情</h1>
        <div className="flex items-center space-x-2 bg-white/50 rounded-full px-2 py-1 border border-gray-200">
          <MoreHorizontal className="w-5 h-5 text-gray-700" />
          <div className="w-px h-4 bg-gray-300" />
          <CircleDot className="w-5 h-5 text-gray-700" />
        </div>
      </div>

      <div className="px-4 space-y-4 pb-20">
        {/* Match Info Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-center text-lg font-bold mb-4">本场三局两胜，10分制</h2>
          <div className="bg-[#EBF2FF] rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src={match.scorer.avatar} className="w-8 h-8 rounded-full bg-gray-200" referrerPolicy="no-referrer" />
              <span className="text-sm text-gray-500">记分员 <span className="text-gray-700 font-medium">{match.scorer.name}</span><span className="text-orange-500 ml-1">[我]</span></span>
            </div>
          </div>
        </div>

        {/* VS Section */}
        <div className="flex items-center justify-between relative">
          {/* Team A */}
          <div className={`flex-1 bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center space-y-3 transition-all ${winsA > winsB && isFinished ? 'ring-2 ring-orange-400 bg-orange-50/30' : ''}`}>
            <div className="flex -space-x-2">
              {match.playerA.map((p, i) => (
                <div key={i} className="relative">
                  <img src={p.avatar} className="w-12 h-12 rounded-full border-2 border-white bg-gray-100" referrerPolicy="no-referrer" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-white">
                    <span className="text-[8px] text-white">♂</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-gray-500 flex space-x-1">
              {match.playerA.map((p, i) => <span key={i} className="truncate max-w-[60px]">{p.name}</span>)}
            </div>
            {winsA > winsB && isFinished && (
              <div className="absolute -top-2 left-4 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">获胜</div>
            )}
          </div>

          {/* VS Badge */}
          <div className="z-10 mx-[-10px]">
            {isFinished ? (
              <div className="w-16 h-16 bg-blue-600 rounded-full flex flex-col items-center justify-center text-white shadow-lg border-4 border-[#F0F4FF]">
                <span className="text-xl font-black leading-none">{winsA}:{winsB}</span>
                <span className="text-[8px] opacity-80">总比分</span>
              </div>
            ) : (
              <div className="italic font-black text-3xl text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-600 drop-shadow-sm">VS</div>
            )}
          </div>

          {/* Team B */}
          <div className={`flex-1 bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center space-y-3 transition-all ${winsB > winsA && isFinished ? 'ring-2 ring-orange-400 bg-orange-50/30' : ''}`}>
            <div className="flex -space-x-2">
              {match.playerB.map((p, i) => (
                <div key={i} className="relative">
                  <img src={p.avatar} className="w-12 h-12 rounded-full border-2 border-white bg-gray-100" referrerPolicy="no-referrer" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-white">
                    <span className="text-[8px] text-white">♂</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-gray-500 flex space-x-1">
              {match.playerB.map((p, i) => <span key={i} className="truncate max-w-[60px]">{p.name}</span>)}
            </div>
            {winsB > winsA && isFinished && (
              <div className="absolute -top-2 right-4 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">获胜</div>
            )}
          </div>
        </div>

        {/* Scores List */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`font-bold ${isFinished ? 'text-gray-800' : 'text-green-500'}`}>
              {isFinished ? '已结束' : '进行中'}
            </h3>
            {(match.sets[0].entered || isFinished) && (
              <button 
                onClick={() => openModal(lastEnteredIndex)}
                className="text-orange-500 text-sm border border-orange-500 px-3 py-1 rounded-full font-medium active:scale-95 transition-transform"
              >
                修改比分
              </button>
            )}
          </div>

          <div className="space-y-3">
            {match.sets.map((set, idx) => {
              // Logic for visibility
              const w1 = setWinners[0];
              const w2 = setWinners[1];
              const is2_0 = w1 && w2 && w1 === w2;
              
              const isVisible = idx === 0 || 
                               (idx === 1 && match.sets[0].entered) || 
                               (idx === 2 && match.sets[1].entered && !is2_0);

              if (!isVisible) return null;

              return (
                <div 
                  key={idx} 
                  onClick={() => set.entered && openModal(idx)}
                  className={`bg-gray-50 rounded-xl p-4 flex items-center justify-between transition-colors ${set.entered ? 'cursor-pointer active:bg-gray-200' : ''}`}
                >
                  <span className="text-gray-400 text-sm font-medium">第{idx + 1}局</span>
                  {set.entered ? (
                    <div className="flex items-center space-x-2 text-lg font-bold">
                      <span className={set.a > set.b ? 'text-orange-500' : 'text-gray-800'}>{set.a}</span>
                      <span className="text-gray-300">:</span>
                      <span className={set.b > set.a ? 'text-orange-500' : 'text-gray-800'}>{set.b}</span>
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(idx);
                      }}
                      className="text-orange-400 text-sm font-medium"
                    >
                      填写比分
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Score Entry Modal */}
      <AnimatePresence>
        {editingSetIndex !== null && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-white rounded-t-[32px] p-6 pb-10 space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="w-6" />
                <h3 className="text-lg font-bold">填写比分</h3>
                <X className="w-6 h-6 text-gray-400 cursor-pointer" onClick={closeModal} />
              </div>

              {/* Modal VS Section */}
              <div className="flex items-center justify-center space-x-6 py-2">
                <div className="flex -space-x-2">
                  {match.playerA.map((p, i) => (
                    <img key={i} src={p.avatar} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100" referrerPolicy="no-referrer" />
                  ))}
                </div>
                <div className="italic font-black text-2xl text-blue-500">VS</div>
                <div className="flex -space-x-2">
                  {match.playerB.map((p, i) => (
                    <img key={i} src={p.avatar} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100" referrerPolicy="no-referrer" />
                  ))}
                </div>
              </div>

              {/* Score Inputs */}
              <div className="flex items-center justify-center space-x-4">
                <div 
                  onClick={() => setTempScore(p => ({ ...p, active: 'a' }))}
                  className={`w-32 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all ${tempScore.active === 'a' ? 'bg-white border-2 border-orange-500 text-orange-500 shadow-md' : 'bg-gray-100 text-gray-400'}`}
                >
                  {tempScore.a || '0'}
                </div>
                <span className="text-2xl font-bold text-gray-300">:</span>
                <div 
                  onClick={() => setTempScore(p => ({ ...p, active: 'b' }))}
                  className={`w-32 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all ${tempScore.active === 'b' ? 'bg-white border-2 border-orange-500 text-orange-500 shadow-md' : 'bg-gray-100 text-gray-400'}`}
                >
                  {tempScore.b || '0'}
                </div>
              </div>

              {/* Confirm Button */}
              <button 
                onClick={confirmScore}
                className="w-full h-14 bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-full font-bold text-lg shadow-lg active:scale-95 transition-transform"
              >
                确认修改
              </button>

              {/* Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2 pt-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'delete'].map((key, i) => (
                  <button
                    key={i}
                    onClick={() => key !== '' && handleKeyClick(key.toString())}
                    className={`h-14 rounded-xl flex items-center justify-center text-xl font-bold active:bg-gray-200 transition-colors ${key === '' ? 'invisible' : 'bg-gray-50'}`}
                  >
                    {key === 'delete' ? <Delete className="w-6 h-6" /> : key}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
