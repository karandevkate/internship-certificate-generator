import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
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
  Mail,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Candidate } from './types';
import CertificateTemplate from './components/CertificateTemplate';
import LetterTemplate from './components/LetterTemplate';
import { calculateDuration } from './utils/helpers';

// --- Sub-components ---

const FormInput = ({ label, value, onChange, placeholder, required, type = "text" }: any) => (
  <div>
    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input 
      type={type} 
      required={required}
      value={value} 
      onChange={e => onChange(e.target.value)} 
      placeholder={placeholder} 
      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium"
    />
  </div>
);

// --- Main App Component ---

export default function App() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [place, setPlace] = useState('Pune');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [generatingCandidate, setGeneratingCandidate] = useState<Candidate | null>(null);
  const masterCertificateRef = useRef<HTMLDivElement>(null);
  const masterLetterRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'certificate' | 'letter'>('certificate');

  // Manual Input State
  const [manualName, setManualName] = useState('');
  const [manualSalutation, setManualSalutation] = useState('Ms.');
  const [manualModule, setManualModule] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualCollege, setManualCollege] = useState('');
  const [manualDegree, setManualDegree] = useState('');
  const [manualBranch, setManualBranch] = useState('');
  const [manualBoard, setManualBoard] = useState('');
  const [manualEducationStatus, setManualEducationStatus] = useState<'pursuing' | 'graduated'>('pursuing');
  const [showManualForm, setShowManualForm] = useState(false);

  const addManualCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName || !manualModule) {
      setError('Name and Work Area / Module are required.');
      return;
    }

    const calculatedDuration = calculateDuration(startDate, endDate);

    const newCandidate: Candidate = {
      id: `manual-${Date.now()}`,
      name: manualName,
      salutation: manualSalutation,
      email: manualEmail,
      college: manualCollege,
      degree: manualDegree,
      branch: manualBranch,
      board: manualBoard,
      workArea: manualModule,
      duration: calculatedDuration,
      educationStatus: manualEducationStatus,
    };

    setCandidates([...candidates, newCandidate]);
    setSelectedCandidate(newCandidate);
    setManualName('');
    setManualModule('');
    setManualEmail('');
    setShowManualForm(false);
    setError(null);
  };

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
          const collegeKey = keys.find(k => k.toLowerCase().trim().includes('college'));
          const degreeKey = keys.find(k => k.toLowerCase().trim().includes('degree') || k.toLowerCase().trim().includes('qualification'));
          const branchKey = keys.find(k => k.toLowerCase().trim().includes('branch') || k.toLowerCase().trim().includes('stream'));
          const boardKey = keys.find(k => k.toLowerCase().trim().includes('board') || k.toLowerCase().trim().includes('univ'));
          const workAreaKey = keys.find(k => {
            const ck = k.toLowerCase().trim();
            return ck.includes('module') || ck.includes('course') || ck.includes('work') || ck.includes('area');
          });
          const emailKey = keys.find(k => k.toLowerCase().trim().includes('email'));
          const durationKey = keys.find(k => k.toLowerCase().trim().includes('duration'));
          const salutationKey = keys.find(k => k.toLowerCase().trim().includes('salutation') || k.toLowerCase().trim().includes('gender'));
          const statusKey = keys.find(k => k.toLowerCase().trim().includes('status') || k.toLowerCase().trim().includes('education'));

          let salutation = 'Ms.';
          if (salutationKey) {
            const val = row[salutationKey]?.toString().toLowerCase();
            if (val.includes('mr') || val === 'male') salutation = 'Mr.';
          }

          let educationStatus: 'pursuing' | 'graduated' = 'pursuing';
          if (statusKey) {
            const val = row[statusKey]?.toString().toLowerCase();
            if (val.includes('graduate') || val.includes('complete')) educationStatus = 'graduated';
          }

          return {
            id: `cand-${index}-${Date.now()}`,
            name: nameKey ? row[nameKey]?.toString().trim() : 'Unknown',
            salutation: salutation,
            email: emailKey ? row[emailKey]?.toString().trim() : '',
            college: collegeKey ? row[collegeKey]?.toString().trim() : '',
            degree: degreeKey ? row[degreeKey]?.toString().trim() : '',
            branch: branchKey ? row[branchKey]?.toString().trim() : '',
            board: boardKey ? row[boardKey]?.toString().trim() : '',
            workArea: workAreaKey ? row[workAreaKey]?.toString().trim() : '',
            duration: durationKey ? row[durationKey]?.toString().trim() : '',
            educationStatus: educationStatus,
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

  const generateImageInternal = async (candidate: Candidate, type: 'certificate' | 'letter', skipDownload = false) => {
    setGeneratingCandidate(candidate);
    await new Promise(resolve => setTimeout(resolve, 800));
    const ref = type === 'certificate' ? masterCertificateRef : masterLetterRef;
    if (!ref.current) throw new Error(`${type} ref not found`);

    try {
      const dataUrl = await toPng(ref.current, {
        width: type === 'certificate' ? 1123 : 794,
        height: type === 'certificate' ? 794 : 1123,
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      if (skipDownload) return dataUrl;

      const link = document.createElement('a');
      link.download = `${type.charAt(0).toUpperCase() + type.slice(1)}_${candidate.name.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(`Error generating ${type}:`, err);
      throw err;
    }
  };

  const generateAndEmail = async (candidate: Candidate) => {
    if (!candidate.email) {
      setError(`No email found for ${candidate.name}`);
      return;
    }
    
    setIsGenerating(true);
    try {
      const certData = await generateImageInternal(candidate, 'certificate', true);
      const letterData = await generateImageInternal(candidate, 'letter', true);
      
      if (certData && letterData) {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidate, certData, letterData }),
        });

        if (response.ok) {
          alert(`Email sent successfully to ${candidate.name}`);
        } else {
          throw new Error('Failed to send email');
        }
      }
    } catch (err) {
      console.error('Error emailing candidate:', err);
      setError(`Failed to email ${candidate.name}`);
    } finally {
      setIsGenerating(false);
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
        const certData = await generateImageInternal(candidate, 'certificate', true);
        const letterData = await generateImageInternal(candidate, 'letter', true);
        
        if (certData && letterData) {
          const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ candidate, certData, letterData }),
          });

          if (response.ok) successCount++;
        }
        
        setProgress(Math.round(((i + 1) / candidatesWithEmail.length) * 100));
        await new Promise(r => setTimeout(r, 500)); 
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

  const generateAllPNGs = async () => {
    if (candidates.length === 0) return;
    setIsGenerating(true);
    setProgress(0);
    const zip = new JSZip();
    try {
      for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        const certData = await generateImageInternal(candidate, 'certificate', true);
        if (certData) {
          zip.file(`Certificate_${candidate.name.replace(/\s+/g, '_')}.png`, certData.replace(/^data:image\/png;base64,/, ""), { base64: true });
        }
        const letterData = await generateImageInternal(candidate, 'letter', true);
        if (letterData) {
          zip.file(`Letter_${candidate.name.replace(/\s+/g, '_')}.png`, letterData.replace(/^data:image\/png;base64,/, ""), { base64: true });
        }
        setProgress(Math.round(((i + 1) / candidates.length) * 100));
        await new Promise(r => setTimeout(r, 100));
      }
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `Documents_${new Date().toISOString().split('T')[0]}.zip`);
    } catch (err) {
      setError('Batch download failed.');
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setGeneratingCandidate(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      {/* Hidden Masters for Capture */}
      <div style={{ position: 'fixed', left: '-10000px', top: 0 }}>
        <div ref={masterCertificateRef}>
          <CertificateTemplate candidate={generatingCandidate} startDate={startDate} endDate={endDate} issueDate={issueDate} place={place} />
        </div>
        <div ref={masterLetterRef}>
          <LetterTemplate candidate={generatingCandidate} startDate={startDate} endDate={endDate} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <img src="/FQTS.png" className="h-16 object-contain" alt="Logo" />
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setShowManualForm(!showManualForm)} className="bg-white border border-slate-200 px-6 py-2.5 rounded-full flex items-center gap-2 font-semibold text-slate-700 shadow-sm hover:border-blue-400">
              <Plus size={18} className="text-blue-600" /> Add Single
            </button>
            <label className="cursor-pointer bg-white border border-slate-200 px-6 py-2.5 rounded-full flex items-center gap-2 font-semibold text-slate-700 shadow-sm hover:border-blue-400">
              <Upload size={18} className="text-blue-600" /> Upload Excel
              <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
            </label>
            {candidates.length > 0 && (
              <>
                <button onClick={generateAllPNGs} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full flex items-center gap-2 font-semibold shadow-lg text-sm disabled:bg-slate-300">
                  <Download size={18} /> {isGenerating ? `Generating ${progress}%` : `Download All (ZIP)`}
                </button>
                <button onClick={emailAllCandidates} disabled={isGenerating} className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-full flex items-center gap-2 font-semibold text-sm disabled:bg-slate-300">
                  <Mail size={18} /> {isGenerating ? `Sending ${progress}%` : 'Email All'}
                </button>
              </>
            )}
          </div>
        </header>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 font-medium">
            <AlertCircle size={20} /> {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800"><Calendar size={20} className="text-blue-600" /> Configuration</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="Start Date" type="date" value={startDate} onChange={setStartDate} />
                  <FormInput label="End Date" type="date" value={endDate} onChange={setEndDate} />
                </div>
                <FormInput label="Issue Date" type="date" value={issueDate} onChange={setIssueDate} />
                <FormInput label="Place" value={place} onChange={setPlace} placeholder="e.g. Pune" />
              </div>
            </div>

            <AnimatePresence>
              {showManualForm && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-hidden">
                  <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800"><Plus size={20} className="text-blue-600" /> Add Candidate</h2>
                  <form onSubmit={addManualCandidate} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Salutation</label>
                        <select value={manualSalutation} onChange={e => setManualSalutation(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium">
                          <option>Mr.</option><option>Ms.</option><option>Mrs.</option>
                        </select>
                      </div>
                      <div className="col-span-2"><FormInput label="Full Name" required value={manualName} onChange={setManualName} placeholder="e.g. Rahul Sharma" /></div>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl">
                      <label className="text-sm font-bold text-slate-600">Status:</label>
                      {['pursuing', 'graduated'].map(s => (
                        <label key={s} className="flex items-center gap-2 text-sm cursor-pointer capitalize">
                          <input type="radio" name="educationStatus" checked={manualEducationStatus === s} onChange={() => setManualEducationStatus(s as any)} className="text-blue-600 focus:ring-blue-500" /> {s}
                        </label>
                      ))}
                    </div>
                    <FormInput label="College Name" value={manualCollege} onChange={setManualCollege} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormInput label="Degree / Qualification" value={manualDegree} onChange={setManualDegree} />
                      <FormInput label="Board / Univ" value={manualBoard} onChange={setManualBoard} />
                    </div>
                    <FormInput label="Branch / Stream" value={manualBranch} onChange={setManualBranch} />
                    <FormInput label="Work Area / Module" required value={manualModule} onChange={setManualModule} placeholder="e.g. Cloud Technology" />
                    <FormInput label="Email (Optional)" type="email" value={manualEmail} onChange={setManualEmail} placeholder="rahul@example.com" />
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-colors">Add Candidate</button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FileSpreadsheet size={20} className="text-blue-600" /> Candidates</h2>
                <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full">{candidates.length}</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
                {candidates.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-sm font-medium"><Upload size={32} className="mx-auto mb-4 text-slate-300" /> Upload Excel to see list</div>
                ) : (
                  candidates.map(c => (
                    <button key={c.id} onClick={() => setSelectedCandidate(c)} className={`w-full p-4 text-left flex items-center justify-between group ${selectedCandidate?.id === c.id ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                      <div><p className={`font-bold text-sm ${selectedCandidate?.id === c.id ? "text-blue-700" : "text-slate-700"}`}>{c.name}</p><p className="text-xs text-slate-400 font-medium">{c.workArea}</p></div>
                      <ChevronRight size={16} className={`transition-all ${selectedCandidate?.id === c.id ? "text-blue-600 translate-x-1" : "text-slate-300"}`} />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-8">
            <div className="sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                  {['certificate', 'letter'].map(t => (
                    <button key={t} onClick={() => setPreviewType(t as any)} className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${previewType === t ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-700"}`}>{t}</button>
                  ))}
                </div>
                {selectedCandidate && (
                  <div className="flex items-center gap-4">
                    <button onClick={() => generateAndEmail(selectedCandidate)} disabled={isGenerating || !selectedCandidate.email} className="text-slate-700 font-bold text-sm flex items-center gap-1.5 hover:underline disabled:text-slate-300"><Mail size={16} /> Email Documents</button>
                    <button onClick={() => generateImageInternal(selectedCandidate, previewType)} disabled={isGenerating} className="text-blue-600 font-bold text-sm flex items-center gap-1.5 hover:underline disabled:text-slate-400"><Download size={16} /> Download {previewType}</button>
                  </div>
                )}
              </div>
              <div className="relative group flex justify-center">
                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative overflow-hidden rounded-xl shadow-2xl border border-white/20 bg-white">
                  <div className="origin-top transition-transform duration-500" style={{ transform: previewType === 'certificate' ? 'scale(0.6)' : 'scale(0.45)', marginBottom: previewType === 'certificate' ? '-310px' : '-610px' }}>
                    {previewType === 'certificate' ? <CertificateTemplate candidate={selectedCandidate} startDate={startDate} endDate={endDate} issueDate={issueDate} place={place} /> : <LetterTemplate candidate={selectedCandidate} startDate={startDate} endDate={endDate} />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
