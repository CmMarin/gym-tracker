import { motion } from 'framer-motion';
import { Flame, Calculator, Sparkles, RefreshCw, CheckCircle2, ChevronLeft } from 'lucide-react';
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
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="bg-[var(--color-white)] p-8 rounded-[2rem] shadow-xl w-full max-w-md border-b-4 border-gray-200 flex flex-col items-center"
    >
      <div className="flex flex-col items-center gap-2 mb-2 text-center">
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-3xl font-extrabold text-slate-800">
            {currentExercise?.name}
          </h2>
          <button 
            onClick={handleOpenSwap}
            className="p-2 -mr-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors self-start mt-1 relative group"
            title="Swap Exercise"
          >
            <RefreshCw size={16} />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] uppercase font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Swap (Bench Taken)</span>
          </button>
        </div>
        {currentExercise?.isProgressionSuggested && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-green-50 text-green-700 border border-green-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">
              Overload Applied (+2.5kg)
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center gap-3 mb-8 w-full">
        <p className="text-slate-500 font-medium">
          {currentSetIndex !== -1
            ? currentSet?.isWarmup
              ? 'Warm-up Set'
              : `Set ${previousWorkingSets + 1} of ${totalWorkingSets}`
            : 'All sets done!'}
        </p>
        {currentSetIndex !== -1 && (
          <button
            onClick={() => handleUpdateSet('isWarmup', !currentSet?.isWarmup)}
            className={`flex items-center justify-center gap-1 px-3 py-1.5 w-full max-w-[200px] rounded-full text-sm font-bold transition-all ${currentSet?.isWarmup ? 'bg-orange-100 text-orange-600 border-2 border-orange-200' : 'bg-gray-100 text-gray-400 border-2 border-transparent hover:bg-gray-200'}`}
          >
            <Flame size={16} className={currentSet?.isWarmup ? 'text-orange-500' : 'text-gray-400'} />
            Mark as Warm-up
          </button>
        )}
      </div>

      {currentSetIndex !== -1 && (
        <div className="w-full flex gap-4 mb-4">
          <div className="flex-1 relative">
            <label className="flex items-center justify-center gap-1 text-sm font-bold text-[var(--color-slate-400)] uppercase mb-2 text-center w-full">
              Weight (kg)
              <button
                onClick={() => setShowPlateCalc(!showPlateCalc)}
                className={`transition-colors p-1 rounded-md ${showPlateCalc ? 'bg-[var(--color-indigo-500)] text-[var(--color-white)] shadow-sm' : 'text-[var(--color-indigo-400)] hover:text-[var(--color-indigo-600)] bg-[var(--color-indigo-50)]'}`}
                title="Calculate Plates"
              >
                <Calculator size={14} />
              </button>
            </label>
            <div className="flex items-stretch bg-[var(--color-gray-100)] rounded-2xl overflow-hidden border-2 border-[var(--color-gray-100)] focus-within:border-[var(--color-indigo-400)] transition-all h-[72px]">
              {currentSetIndex !== -1 && (
                <button
                  onClick={() => handleUpdateSet('weight', Math.max(0, Number(currentSet?.weight || 0) - 2.5))}
                  className="w-10 sm:w-12 bg-[var(--color-indigo-500)] hover:bg-[var(--color-indigo-400)] text-[var(--color-white)] text-sm font-black active:bg-[var(--color-indigo-600)] transition-colors flex items-center justify-center shrink-0 border-r border-[var(--color-indigo-400)]"
                >
                  -2.5
                </button>
              )}
              <input
                type="number"
                placeholder="0"
                value={currentSet?.weight || ''}
                onChange={(e) => handleUpdateSet('weight', e.target.value)}
                className="w-full min-w-0 text-center text-2xl sm:text-3xl font-black text-[var(--color-slate-700)] bg-transparent focus:outline-none"
              />
              {currentSetIndex !== -1 && (
                <button
                  onClick={() => handleUpdateSet('weight', Number(currentSet?.weight || 0) + 2.5)}
                  className="w-10 sm:w-12 bg-[var(--color-indigo-500)] hover:bg-[var(--color-indigo-400)] text-[var(--color-white)] text-sm font-black active:bg-[var(--color-indigo-600)] transition-colors flex items-center justify-center shrink-0 border-l border-[var(--color-indigo-400)]"
                >
                  +2.5
                </button>
              )}
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-bold text-[var(--color-slate-400)] uppercase mb-2 text-center">
              Reps
            </label>
            <input
              type="number"
              placeholder={currentExercise?.targetReps?.toString() || '0'}
              value={currentSet?.reps || ''}
              onChange={(e) => handleUpdateSet('reps', e.target.value)}
              className="w-full h-[72px] text-center text-3xl font-black text-[var(--color-slate-700)] bg-[var(--color-gray-100)] border-2 border-[var(--color-gray-100)] rounded-2xl focus:outline-none focus:border-[var(--color-indigo-400)] transition-all"
            />
          </div>
        </div>
      )}

      {showPlateCalc && currentSet?.weight && Number(currentSet.weight) > 0 && (
        <div className="mb-4 w-full bg-[var(--color-slate-50)] pt-3 pb-2 rounded-2xl text-center border-2 border-[var(--color-slate-100)] overflow-hidden">
          <p className="text-[var(--color-slate-400)] text-[10px] uppercase font-black tracking-widest mb-1 z-10 relative">
            Plates per side (20kg bar)
          </p>
          <VisualBarbell weight={Number(currentSet.weight)} />
        </div>
      )}

      <div className="flex w-full gap-3">
        <button
          onClick={handleCompleteSet}
          disabled={isFinishing || currentSetIndex === -1}
          className={`flex-[3] ${isFinishing ? 'bg-indigo-300' : 'bg-indigo-500 hover:bg-indigo-400'} text-[var(--color-white)] font-black text-xl py-5 rounded-2xl shadow-[0_6px_0_0_var(--color-indigo-600)] active:shadow-[0_0px_0_0_var(--color-indigo-600)] active:translate-y-[6px] transition-all flex justify-center items-center space-x-2`}
        >
          {isFinishing ? (
            <div className="w-6 h-6 border-4 border-[var(--color-white)] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <CheckCircle2 size={28} />
              <span>{currentSetIndex !== -1 ? 'COMPLETE SET' : 'EXERCISE DONE'}</span>
            </>
          )}
        </button>
        {currentSetIndex !== -1 && (
          <button
            onClick={() => setShowSkipConfirm(true)}
            disabled={isFinishing}
            className="flex-1 flex justify-center items-center bg-gray-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 font-bold rounded-2xl shadow-[0_6px_0_0_var(--color-gray-300)] active:shadow-[0_0px_0_0_var(--color-gray-300)] active:translate-y-[6px] transition-all border-2 border-transparent hover:border-rose-200"
            title="Skip Set"
          >
            SKIP
          </button>
        )}
      </div>

      {isLastSet && nextExercise && (
        <div className="w-full mt-6 bg-indigo-50 border-2 border-dashed border-indigo-200 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase text-indigo-400 mb-0.5 tracking-wider">Up Next</p>
            <p className="font-bold text-indigo-900 leading-tight pr-2">{nextExercise.name}</p>
          </div>
          <div className="text-right whitespace-nowrap bg-indigo-200/50 px-3 py-1 rounded-xl">
            <span className="font-black text-indigo-700">{nextExercise.sets.length}</span>
            <span className="text-[10px] font-bold uppercase text-indigo-500 ml-1">Sets</span>
          </div>
        </div>
      )}

      {hasPreviousSet && (
        <button
          onClick={handleGoBack}
          className="mt-6 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1 w-full p-2"
        >
          <ChevronLeft size={16} /> Go Back
        </button>
      )}
    </motion.div>
  );
}