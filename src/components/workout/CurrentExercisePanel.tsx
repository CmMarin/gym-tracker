import { motion } from 'framer-motion';
import { RefreshCw, ChevronLeft, ChevronDown, Check, TrendingUp, Droplet, Monitor, Target } from 'lucide-react';
import { VisualBarbell } from './VisualBarbell';

export default function CurrentExercisePanel({
  currentExercise,
  currentSetIndex,
  previousWorkingSets,
  totalWorkingSets,
  currentSet,
  handleOpenSwap,
  handleUpdateSet,
  handleCompleteSet,
  showPlateCalc,
  setShowPlateCalc,
  isFinishing,
  setShowSkipConfirm,
  isLastSet,
  nextExercise,
  hasPreviousSet,
  handleGoBack
}: any) {
  return (
    <motion.div
      key={currentExercise?.id + '-' + currentSetIndex}
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -50, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="w-full max-w-md flex flex-col items-center bg-transparent z-10 flex-1"
    >
      <div className="w-full flex items-start justify-between mb-4">
        <h2 className="text-3xl sm:text-[34px] font-black text-[var(--color-slate-800)] leading-[1.1] pr-4 tracking-tight max-w-[85%]">
          {currentExercise?.name}
        </h2>
        <button 
          onClick={handleOpenSwap}
          className="w-11 h-11 shrink-0 rounded-2xl bg-[var(--color-white)]/60 backdrop-blur-md border border-[var(--color-white)] flex items-center justify-center text-[var(--color-indigo-500)] hover:scale-110 active:scale-95 transition-all relative group shadow-sm shadow-[var(--color-indigo-200)]/30"
          title="Swap Exercise"
        >
          <RefreshCw size={18} strokeWidth={2.5} />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--color-slate-800)] text-[var(--color-white)] text-[10px] uppercase font-bold py-1 px-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-md">Swap</span>
        </button>
      </div>
      
      <div className="self-start mb-8 min-h-[30px]">
        {currentExercise?.isProgressionSuggested && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-200">
            <TrendingUp size={12} strokeWidth={3} />
            <span className="text-[11px] font-bold tracking-wide">
              Overload Applied (+2.5kg)
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between w-full mb-8">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] text-[var(--color-slate-500)] font-black tracking-widest uppercase">Set</span>
          <div className="flex gap-2">
            {[...Array(totalWorkingSets)].map((_, i) => (
              <div 
                key={i} 
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                  i < previousWorkingSets 
                    ? 'bg-[var(--color-indigo-500)] scale-110 shadow-[0_0_10px_var(--color-theme-shadow)]'
                    : i === previousWorkingSets 
                      ? 'bg-[var(--color-indigo-400)] scale-125 animate-pulse' 
                      : 'bg-[var(--color-gray-200)]'
                }`}
              />
            ))}
          </div>
        </div>
        
        {currentSetIndex !== -1 && (
          <button
            onClick={() => handleUpdateSet('isWarmup', !currentSet?.isWarmup)}
            className={`flex items-center gap-2 px-4 py-2 rounded-[14px] text-sm font-bold transition-all active:scale-95 ${
              currentSet?.isWarmup 
                ? 'bg-orange-100/80 backdrop-blur-sm text-orange-500 border border-orange-200 shadow-[0_4px_12px_rgba(249,115,22,0.1)]' 
                : 'bg-[var(--color-white)]/60 backdrop-blur-sm text-[var(--color-slate-500)] border border-[var(--color-white)]/80 hover:bg-[var(--color-white)] shadow-[0_4px_12px_rgba(0,0,0,0.02)]'
            }`}
          >
            <Droplet size={14} className={currentSet?.isWarmup ? '' : 'text-[var(--color-slate-400)]'} strokeWidth={2.5} /> 
            Mark as Warm-up
          </button>
        )}
      </div>

      {currentSetIndex !== -1 && (
        <div className="w-full flex flex-col gap-4 mb-6">
          {currentExercise?.category === 'Cardio' ? (
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="bg-[var(--color-white)]/60 backdrop-blur-xl rounded-[1.5rem] p-4 flex flex-col shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[var(--color-white)]/80 focus-within:border-[var(--color-indigo-400)] text-center transition-all">
                <label className="text-[10px] font-black text-[var(--color-slate-500)] uppercase mb-2 tracking-widest">Duration (sec)</label>
                <input type="number" placeholder="300" value={currentSet?.duration || ''} onChange={(e) => handleUpdateSet('duration', e.target.value)} className="w-full text-center text-3xl font-black text-[var(--color-slate-800)] bg-transparent focus:outline-none placeholder:text-[var(--color-gray-200)]" />
              </div>
              <div className="bg-[var(--color-white)]/60 backdrop-blur-xl rounded-[1.5rem] p-4 flex flex-col shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[var(--color-white)]/80 focus-within:border-[var(--color-indigo-400)] text-center transition-all">
                <label className="text-[10px] font-black text-[var(--color-slate-500)] uppercase mb-2 tracking-widest">Speed</label>
                <input type="number" placeholder="1.0" step="0.1" value={currentSet?.speed || ''} onChange={(e) => handleUpdateSet('speed', e.target.value)} className="w-full text-center text-3xl font-black text-[var(--color-slate-800)] bg-transparent focus:outline-none placeholder:text-[var(--color-gray-200)]" />
              </div>
              <div className="bg-[var(--color-white)]/60 backdrop-blur-xl rounded-[1.5rem] p-4 flex flex-col shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[var(--color-white)]/80 focus-within:border-[var(--color-indigo-400)] text-center transition-all">
                <label className="text-[10px] font-black text-[var(--color-slate-500)] uppercase mb-2 tracking-widest">Incline</label>
                <input type="number" placeholder="0" step="0.5" value={currentSet?.incline || ''} onChange={(e) => handleUpdateSet('incline', e.target.value)} className="w-full text-center text-3xl font-black text-[var(--color-slate-800)] bg-transparent focus:outline-none placeholder:text-[var(--color-gray-200)]" />
              </div>
              <div className="bg-[var(--color-white)]/60 backdrop-blur-xl rounded-[1.5rem] p-4 flex flex-col shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[var(--color-white)]/80 focus-within:border-[var(--color-indigo-400)] text-center transition-all">
                <label className="text-[10px] font-black text-[var(--color-slate-500)] uppercase mb-2 tracking-widest">Level</label>
                <input type="number" placeholder="1" value={currentSet?.level || ''} onChange={(e) => handleUpdateSet('level', e.target.value)} className="w-full text-center text-3xl font-black text-[var(--color-slate-800)] bg-transparent focus:outline-none placeholder:text-[var(--color-gray-200)]" />
              </div>
            </div>
          ) : (
            <div className="w-full flex gap-4">
              <div className="flex-1 bg-[var(--color-white)]/60 backdrop-blur-xl rounded-[2rem] p-5 flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-[var(--color-white)]/80 focus-within:border-[var(--color-indigo-400)] focus-within:shadow-[0_8px_32px_var(--color-theme-shadow)] transition-all">
                <label className="flex items-center gap-1.5 text-[10px] font-black text-[var(--color-slate-500)] uppercase mb-4 tracking-widest">
                  Weight (KG) <Monitor size={12} strokeWidth={2.5} className="ml-1 text-[var(--color-indigo-400)]" />
                </label>
                <div className="flex items-center justify-between mt-auto">
                  <button
                    onClick={() => handleUpdateSet('weight', Math.max(0, Number(currentSet?.weight || 0) - 2.5))}
                    className="w-10 h-10 flex items-center justify-center font-black text-2xl text-[var(--color-indigo-500)] pb-1 hover:bg-[var(--color-indigo-50)] rounded-full hover:scale-110 active:scale-90 transition-all focus:outline-none"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentSet?.weight || ''}
                    onChange={(e) => handleUpdateSet('weight', e.target.value)}
                    className="w-full min-w-0 text-center text-4xl font-black text-[var(--color-slate-800)] bg-transparent focus:outline-none placeholder:text-[var(--color-gray-200)]"
                  />
                  <button
                    onClick={() => handleUpdateSet('weight', Number(currentSet?.weight || 0) + 2.5)}
                    className="w-10 h-10 flex items-center justify-center font-black text-xl text-[var(--color-indigo-500)] hover:bg-[var(--color-indigo-50)] rounded-full hover:scale-110 active:scale-90 transition-all focus:outline-none"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-[var(--color-white)]/60 backdrop-blur-xl rounded-[2rem] p-5 flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-[var(--color-white)]/80 focus-within:border-[var(--color-indigo-400)] focus-within:shadow-[0_8px_32px_var(--color-theme-shadow)] transition-all">
                <label className="block text-[10px] font-black text-[var(--color-slate-500)] uppercase mb-4 tracking-widest">
                  Reps
                </label>
                <div className="flex items-center justify-between mt-auto">
                  <button
                    onClick={() => handleUpdateSet('reps', Math.max(0, Number(currentSet?.reps || 0) - 1))}
                    className="w-10 h-10 flex items-center justify-center font-black text-2xl text-[var(--color-indigo-500)] pb-1 hover:bg-[var(--color-indigo-50)] rounded-full hover:scale-110 active:scale-90 transition-all focus:outline-none"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    placeholder={currentExercise?.targetReps?.toString() || '0'}
                    value={currentSet?.reps || ''}
                    onChange={(e) => handleUpdateSet('reps', e.target.value)}
                    className="w-full text-center text-4xl font-black text-[var(--color-slate-800)] bg-transparent focus:outline-none placeholder:text-[var(--color-gray-200)]"
                  />
                  <button
                    onClick={() => handleUpdateSet('reps', Number(currentSet?.reps || 0) + 1)}
                    className="w-10 h-10 flex items-center justify-center font-black text-xl text-[var(--color-indigo-500)] hover:bg-[var(--color-indigo-50)] rounded-full hover:scale-110 active:scale-90 transition-all focus:outline-none"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {currentSetIndex !== -1 && currentExercise?.category !== 'Cardio' && (
        <div className="w-full mb-8 relative">
          <div className="absolute -top-3 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-gray-200)] to-transparent opacity-50" />
          <button 
            onClick={() => setShowPlateCalc(!showPlateCalc)}
            className="w-full flex items-center justify-between text-[var(--color-slate-500)] hover:text-[var(--color-indigo-500)] py-2 transition-colors"
          >
            <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase">
              <Target size={12} strokeWidth={2.5} /> Plates per side (20kg bar)
            </div>
            <ChevronDown size={14} className={`transform transition-transform ${showPlateCalc ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}

      {showPlateCalc && currentSet?.weight && Number(currentSet.weight) > 0 && (
        <div className="mb-8 w-full bg-[var(--color-white)]/60 backdrop-blur-xl p-4 rounded-2xl border border-[var(--color-white)]/80 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          <VisualBarbell weight={Number(currentSet.weight)} />
        </div>
      )}

      <div className="w-full flex flex-col gap-4 mt-2 z-10 pb-4">
        <button
          onClick={handleCompleteSet}
          disabled={isFinishing || currentSetIndex === -1}
          className={`w-full ${isFinishing ? 'bg-[var(--color-indigo-300)]' : 'bg-[var(--color-indigo-500)] hover:bg-[var(--color-indigo-600)]'} text-[var(--color-white)] font-black text-lg sm:text-xl py-4 sm:py-5 rounded-[1.25rem] transition-all flex justify-center items-center gap-2 shadow-[0_6px_0_0_var(--color-button-shadow)] hover:shadow-[0_8px_16px_var(--color-theme-shadow)] active:shadow-[0_0px_0_0_var(--color-button-shadow)] active:translate-y-[6px] hover:-translate-y-1`}
        >
          {isFinishing ? (
            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <Check className="w-6 h-6 animate-pulse" strokeWidth={3} />
              {currentSetIndex !== -1 ? 'COMPLETE SET' : 'EXERCISE DONE'}
            </>
          )}
        </button>

        {currentSetIndex !== -1 && (
          <button
            onClick={() => setShowSkipConfirm(true)}
            disabled={isFinishing}
            className="w-full text-[var(--color-slate-400)] hover:text-[var(--color-rose-500)] font-bold text-sm transition-colors py-2 text-center"
          >
            Skip this set
          </button>
        )}
      </div>

      {isLastSet && nextExercise && (
        <div className="w-full mt-2 mb-6 bg-[var(--color-indigo-50)]/50 backdrop-blur-md border border-[var(--color-indigo-100)]/80 p-4 rounded-[1.25rem] flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase text-[var(--color-indigo-400)] mb-1 tracking-widest">Up Next</p>
            <p className="font-bold text-[var(--color-slate-800)] leading-tight pr-2">{nextExercise.name}</p>
          </div>
          <div className="text-right whitespace-nowrap bg-[var(--color-indigo-100)]/80 px-3 py-1.5 rounded-xl border border-[var(--color-indigo-200)]/50">
            <span className="font-black text-[var(--color-indigo-600)]">{nextExercise.sets.length}</span>
            <span className="text-[10px] font-bold uppercase text-[var(--color-indigo-500)] ml-1.5">Sets</span>
          </div>
        </div>
      )}

      {hasPreviousSet && (
        <button
          onClick={handleGoBack}
          className="mt-2 mb-6 text-sm font-bold text-[var(--color-slate-400)] hover:text-[var(--color-slate-600)] transition-colors flex items-center justify-center gap-1 w-full py-2"
        >
          <ChevronLeft size={16} /> Go Back
        </button>
      )}
    </motion.div>
  );
}