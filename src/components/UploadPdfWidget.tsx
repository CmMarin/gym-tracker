'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function UploadPdfWidget() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    const uploadPromise = async () => {
      const res = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to import routine');
      }
      return data;
    };

    try {
      await toast.promise(uploadPromise(), {
        loading: 'Processing with AI...',
        success: 'Workout plans imported successfully! Refresh to see them.',
        error: (err: Error) => `Error: ${err.message}`
      });
    } catch {
      // Empty
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-white shadow-[0_4px_0_theme(colors.gray.200)] rounded-2xl p-6 border-2 border-gray-100 mt-6 animate-in fade-in duration-300">
      <h3 className="text-xl font-bold text-slate-800 mb-4">Import Routine (PDF)</h3>
      <p className="text-sm text-slate-500 mb-4">Upload a PDF of your workout routine and AI will automatically convert it.</p>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 mb-4"
      />
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleUpload}
        disabled={!file || loading}
        className="bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing with AI...' : 'Upload PDF'}
      </motion.button>
    </div>
  );
}
