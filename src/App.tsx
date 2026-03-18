/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  Upload,
  Download,
  FileSpreadsheet,
  Calendar,
  AlertCircle,
  ChevronRight,
  Trash2,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Candidate {
  id: string;
  name: string;
  module: string;
  email: string;
}

export default function App() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [place, setPlace] = useState('Pune');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [generatingCandidate, setGeneratingCandidate] = useState<Candidate | null>(null);
  const masterCertificateRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Base64 Logo to ensure reliable rendering
  const logoBase64 = "data:image/png;base64,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";

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (jsonData.length === 0) {
          setError('The Excel file appears to be empty.');
          return;
        }

        const extracted: Candidate[] = jsonData.map((row, index) => {
          const keys = Object.keys(row);
          const nameKey = keys.find(k => k.toLowerCase().trim().includes('name'));
          const moduleKey = keys.find(k => {
            const ck = k.toLowerCase().trim();
            return ck.includes('module') || ck.includes('course');
          });
          const emailKey = keys.find(k => k.toLowerCase().trim().includes('email'));

          return {
            id: `cand-${index}-${Date.now()}`,
            name: nameKey ? row[nameKey]?.toString().trim() : 'Unknown',
            module: moduleKey ? row[moduleKey]?.toString().trim() : 'General Internship',
            email: emailKey ? row[emailKey]?.toString().trim() : '',
          };
        }).filter(c => c.name !== 'Unknown');

        if (extracted.length === 0) {
          setError('Could not find candidate names in Excel.');
          return;
        }

        setCandidates(extracted);
        setSelectedCandidate(extracted[0]);
      } catch (err) {
        setError('Failed to process Excel file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const generateImageInternal = async (candidate: Candidate, skipDownload = false) => {
    setGeneratingCandidate(candidate);
    await new Promise(resolve => setTimeout(resolve, 800));
    if (!masterCertificateRef.current) throw new Error('Capture ref not found');

    try {
      const dataUrl = await toPng(masterCertificateRef.current, {
        width: 1123,
        height: 794,
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      if (skipDownload) return dataUrl;

      const link = document.createElement('a');
      link.download = `Certificate_${candidate.name.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating image:', err);
      throw err;
    }
  };

  const generatePNG = async (candidate: Candidate) => {
    setIsGenerating(true);
    setError(null);
    try {
      await generateImageInternal(candidate);
    } catch (err) {
      setError('Failed to generate PNG.');
    } finally {
      setIsGenerating(false);
      setGeneratingCandidate(null);
    }
  };

  const generateAllPNGs = async () => {
    if (candidates.length === 0) return;
    setIsGenerating(true);
    setProgress(0);
    const zip = new JSZip();
    try {
      for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        const dataUrl = await generateImageInternal(candidate, true);
        if (dataUrl) {
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
          zip.file(`Certificate_${candidate.name.replace(/\s+/g, '_')}.png`, base64Data, { base64: true });
        }
        setProgress(Math.round(((i + 1) / candidates.length) * 100));
        // Small delay to ensure browser doesn't freeze and state updates
        await new Promise(r => setTimeout(r, 100));
      }
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `Certificates_${new Date().toISOString().split('T')[0]}.zip`);
    } catch (err) {
      console.error('Error batch generating:', err);
      setError('Batch download failed.');
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setGeneratingCandidate(null);
    }
  };

  const emailAllCandidates = async () => {
    if (candidates.length === 0) return;
    const candidatesWithEmail = candidates.filter(c => c.email);
    if (candidatesWithEmail.length === 0) {
      setError('No candidates with email addresses found.');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    let successCount = 0;

    try {
      for (let i = 0; i < candidatesWithEmail.length; i++) {
        const candidate = candidatesWithEmail[i];
        const dataUrl = await generateImageInternal(candidate, true);
        
        if (dataUrl) {
          const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ candidate, imageData: dataUrl }),
          });

          if (response.ok) successCount++;
        }
        
        setProgress(Math.round(((i + 1) / candidatesWithEmail.length) * 100));
        await new Promise(r => setTimeout(r, 500)); // Rate limiting
      }
      alert(`Emails sent successfully to ${successCount} candidates.`);
    } catch (err) {
      console.error('Error batch emailing:', err);
      setError('Batch email sending failed.');
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setGeneratingCandidate(null);
    }
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '[Date]';

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      {/* Hidden Master Certificate for Capture */}
      <div style={{ position: 'fixed', left: '-10000px', top: 0 }}>
        <div ref={masterCertificateRef} className="certificate-container" style={{ transform: 'none', margin: 0 }}>
          <div className="geometric-shape diamond w-64 h-64 -top-32 -left-32 opacity-80" style={{ backgroundColor: '#BFDBFE' }} />
          <div className="geometric-shape diamond w-48 h-48 top-10 left-40 opacity-60" style={{ backgroundColor: '#BFDBFE' }} />
          <div className="geometric-shape diamond w-96 h-96 -bottom-48 -right-48 opacity-80" style={{ backgroundColor: '#BFDBFE' }} />
          <div className="geometric-shape diamond w-32 h-32 bottom-20 right-60 opacity-60" style={{ backgroundColor: '#BFDBFE' }} />
          <div className="relative z-10 h-full flex flex-col items-center p-16 text-center">
            <div className="mb-12">
              <img 
                src="/FQTS.png" 
                alt="First Quad Logo" 
                className="h-32 object-contain"
                onError={(e) => console.error("Logo failed to load", e)}
              />
            </div>
            <h1 className="font-display font-black text-6xl tracking-[0.15em] mb-4" style={{ color: '#2563EB' }}>INTERNSHIP CERTIFICATE</h1>
            <p className="font-display font-bold text-sm tracking-[0.3em] uppercase mb-12" style={{ color: '#64748B' }}>This is to certify that</p>
            <h2 className="font-serif italic text-7xl mb-10 px-20 border-b-2 pb-4 inline-block" style={{ color: '#0F172A', borderColor: '#F1F5F9' }}>
              {generatingCandidate?.name || selectedCandidate?.name || 'Candidate Name'}
            </h2>
            <div className="max-w-3xl mx-auto leading-relaxed text-lg" style={{ color: '#475569' }}>
              <p className="mb-4">has successfully completed a <span className="font-bold uppercase" style={{ color: '#0F172A' }}>{generatingCandidate?.module || selectedCandidate?.module || 'General Internship'}</span> at <span className="font-bold" style={{ color: '#0F172A' }}>First Quad Tech Solutions</span> from <span className="font-bold" style={{ color: '#0F172A' }}>{formatDate(startDate)}</span> to <span className="font-bold" style={{ color: '#0F172A' }}>{formatDate(endDate)}</span>.</p>
              <p>During the internship period, he showed dedication, enthusiasm, and a willingness to learn while performing the assigned tasks. We found {generatingCandidate?.name || selectedCandidate?.name || 'the candidate'} to be sincere, hardworking, and responsible.</p>
            </div>
            <div className="mt-auto w-full flex justify-between items-end text-left">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94A3B8' }}>Date: <span style={{ color: '#475569' }}>{formatDate(issueDate)}</span></p>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94A3B8' }}>Place: <span style={{ color: '#475569' }}>{place}</span></p>
              </div>
              <p className="font-display font-bold text-[10px] uppercase" style={{ color: '#94A3B8' }}>First Quad Tech Solutions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/FQTS.png" className="h-16 object-contain" alt="Logo" />
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="cursor-pointer bg-white border border-slate-200 px-6 py-2.5 rounded-full flex items-center gap-2 font-semibold text-slate-700 shadow-sm hover:border-blue-400">
              <Upload size={18} className="text-blue-600" />
              Upload Excel
              <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
            </label>
            {candidates.length > 0 && (
              <>
                <button onClick={generateAllPNGs} disabled={isGenerating || !startDate || !endDate} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full flex items-center gap-2 font-semibold shadow-lg text-sm disabled:bg-slate-300">
                  <Download size={18} />
                  {isGenerating ? `Generating ${progress}%` : `Download All (ZIP)`}
                </button>
                <button onClick={emailAllCandidates} disabled={isGenerating || !startDate || !endDate} className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-full flex items-center gap-2 font-semibold text-sm disabled:bg-slate-300">
                  <Mail size={18} />
                  {isGenerating ? `Sending ${progress}%` : 'Email All (SMTP)'}
                </button>
              </>
            )}
          </div>
        </header>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-8 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 font-medium">
              <AlertCircle size={20} />
              {error}
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800"><Calendar size={20} className="text-blue-600" /> Configuration</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Start Date</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">End Date</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Issue Date</label>
                  <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Place</label>
                  <input type="text" value={place} onChange={e => setPlace(e.target.value)} placeholder="e.g. Pune" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FileSpreadsheet size={20} className="text-blue-600" /> Candidates</h2>
                <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full">{candidates.length}</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
                {candidates.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <Upload size={32} />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Upload Excel to see list</p>
                  </div>
                ) : (
                  candidates.map(c => (
                    <button key={c.id} onClick={() => setSelectedCandidate(c)} className={cn("w-full p-4 text-left flex items-center justify-between group", selectedCandidate?.id === c.id ? "bg-blue-50" : "hover:bg-slate-50")}>
                      <div>
                        <p className={cn("font-bold text-sm", selectedCandidate?.id === c.id ? "text-blue-700" : "text-slate-700")}>{c.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{c.module}</p>
                      </div>
                      <ChevronRight size={16} className={cn("transition-all", selectedCandidate?.id === c.id ? "text-blue-600 translate-x-1" : "text-slate-300")} />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">Preview</h2>
                {selectedCandidate && (
                  <button onClick={() => generatePNG(selectedCandidate)} disabled={isGenerating || !startDate || !endDate} className="text-blue-600 font-bold text-sm flex items-center gap-1.5 hover:underline disabled:text-slate-400">
                    <Download size={16} /> Download Selected
                  </button>
                )}
              </div>

              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative overflow-hidden rounded-xl shadow-2xl border border-white/20 bg-white">
                  <div className="origin-top-left" style={{ transform: 'scale(0.6)', marginBottom: '-317px' }}>
                    <div className="certificate-container">
                      <div className="geometric-shape diamond w-64 h-64 -top-32 -left-32 opacity-80" style={{ backgroundColor: '#BFDBFE' }} />
                      <div className="geometric-shape diamond w-48 h-48 top-10 left-40 opacity-60" style={{ backgroundColor: '#BFDBFE' }} />
                      <div className="geometric-shape diamond w-96 h-96 -bottom-48 -right-48 opacity-80" style={{ backgroundColor: '#BFDBFE' }} />
                      <div className="geometric-shape diamond w-32 h-32 bottom-20 right-60 opacity-60" style={{ backgroundColor: '#BFDBFE' }} />
                      <div className="relative z-10 h-full flex flex-col items-center p-16 text-center">
                        <div className="mb-12">
              <img 
                src="/FQTS.png" 
                alt="First Quad Logo" 
                className="h-32 object-contain"
                onError={(e) => console.error("Logo failed to load", e)}
              />
            </div>
                        <h1 className="font-display font-black text-6xl tracking-[0.15em] mb-4" style={{ color: '#2563EB' }}>INTERNSHIP CERTIFICATE</h1>
                        <p className="font-display font-bold text-sm tracking-[0.3em] uppercase mb-12" style={{ color: '#64748B' }}>This is to certify that</p>
                        <h2 className="font-serif italic text-7xl mb-10 px-20 border-b-2 pb-4 inline-block" style={{ color: '#0F172A', borderColor: '#F1F5F9' }}>{selectedCandidate?.name || 'Candidate Name'}</h2>
                        <div className="max-w-3xl mx-auto leading-relaxed text-lg" style={{ color: '#475569' }}>
                          <p className="mb-4">has successfully completed a <span className="font-bold uppercase" style={{ color: '#0F172A' }}>{selectedCandidate?.module || 'General Internship'}</span> at <span className="font-bold" style={{ color: '#0F172A' }}>First Quad Tech Solutions</span> from <span className="font-bold" style={{ color: '#0F172A' }}>{formatDate(startDate)}</span> to <span className="font-bold" style={{ color: '#0F172A' }}>{formatDate(endDate)}</span>.</p>
                          <p>During the internship period, he showed dedication, enthusiasm, and a willingness to learn while performing the assigned tasks. We found {selectedCandidate?.name || 'the candidate'} to be sincere, hardworking, and responsible.</p>
                        </div>
                        <div className="mt-auto w-full flex justify-between items-end text-left">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94A3B8' }}>Date: <span style={{ color: '#475569' }}>{formatDate(issueDate)}</span></p>
                            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94A3B8' }}>Place: <span style={{ color: '#475569' }}>{place}</span></p>
                          </div>
                          <p className="font-display font-bold text-[10px] uppercase" style={{ color: '#94A3B8' }}>First Quad Tech Solutions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {(!startDate || !endDate) && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-xl z-20">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 text-center max-w-xs">
                      <AlertCircle className="text-amber-500 mx-auto mb-3" size={32} />
                      <p className="text-slate-900 font-bold mb-1">Dates Required</p>
                      <p className="text-slate-500 text-sm">Please select dates to enable generation.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
