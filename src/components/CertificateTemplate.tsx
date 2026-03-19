import React from 'react';
import { Candidate } from '../types';
import SignatureBlock from './SignatureBlock';
import { formatDate, calculateDuration } from '../utils/helpers';

interface CertificateTemplateProps {
  candidate: Candidate | null;
  startDate: string;
  endDate: string;
  issueDate: string;
  place: string;
}

const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
  candidate,
  startDate,
  endDate,
}) => {
  const duration = candidate?.duration || calculateDuration(startDate, endDate);

  return (
    <div className="certificate-container bg-white flex flex-col items-center justify-center p-4 relative border-[20px] border-[#F1F5F9]">
      {/* Premium Decorative Borders */}
      <div className="absolute inset-2 border-[2px] border-[#E2E8F0]" />
      <div className="absolute inset-4 border-[1px] border-[#CBD5E1]" />
      
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-20 pointer-events-none">
        <div className="absolute top-6 left-6 w-16 h-16 border-t-4 border-l-4 border-[#A07B4A]" />
        <div className="absolute top-10 left-10 w-8 h-8 border-t-2 border-l-2 border-[#A07B4A]" />
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none">
        <div className="absolute top-6 right-6 w-16 h-16 border-t-4 border-r-4 border-[#A07B4A]" />
        <div className="absolute top-10 right-10 w-8 h-8 border-t-2 border-r-2 border-[#A07B4A]" />
      </div>
      <div className="absolute bottom-0 left-0 w-32 h-32 opacity-20 pointer-events-none">
        <div className="absolute bottom-6 left-6 w-16 h-16 border-b-4 border-l-4 border-[#A07B4A]" />
        <div className="absolute bottom-10 left-10 w-8 h-8 border-b-2 border-l-2 border-[#A07B4A]" />
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20 pointer-events-none">
        <div className="absolute bottom-6 right-6 w-16 h-16 border-b-4 border-r-4 border-[#A07B4A]" />
        <div className="absolute bottom-10 right-10 w-8 h-8 border-b-2 border-r-2 border-[#A07B4A]" />
      </div>

      <div className="relative z-10 w-full h-full flex flex-col items-center px-16 text-center">
        {/* Header Section */}
        <div className="mt-8 mb-4 flex items-center gap-4">
          <img 
            src="/FQTS-Short.png" 
            alt="First Quad Logo" 
            className="h-16 object-contain"
          />
          <div className="text-left border-l-2 border-[#E2E8F0] pl-4">
            <h3 className="font-display font-black text-4xl tracking-tight leading-none" style={{ color: '#1E293B' }}>FIRST QUAD</h3>
            <p className="font-display font-bold text-lg tracking-[0.25em] mt-1" style={{ color: '#64748B' }}>TECH SOLUTIONS</p>
          </div>
        </div>

        <div className="w-full flex flex-col items-center mb-6">
          <h1 className="font-display font-medium text-7xl tracking-[0.15em] mb-1" style={{ color: '#0F172A' }}>CERTIFICATE</h1>
          <div className="w-[500px] h-0.5 bg-gradient-to-r from-transparent via-[#A07B4A] to-transparent opacity-60" />
          <h2 className="font-serif text-4xl mt-2 italic font-semibold" style={{ color: '#A07B4A' }}>of Appreciation</h2>
        </div>

        <p className="font-display font-bold text-[10px] tracking-[0.4em] uppercase mb-8 text-[#94A3B8]">This certificate is proudly presented to</p>
        
        <div className="mb-8 relative">
          <h2 className="font-serif italic text-6xl pb-2 inline-block px-12" style={{ color: '#0F172A' }}>
            {candidate?.name || 'Candidate Name'}
          </h2>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#E2E8F0]" />
        </div>

        <div className="max-w-4xl mx-auto leading-relaxed text-base" style={{ color: '#475569' }}>
          <p className="mb-4">
            {candidate?.educationStatus === 'graduated' ? 'A graduate of ' : 'A student of '}
            <span className="font-bold text-[#1E293B] decoration-[#A07B4A] underline underline-offset-4">{candidate?.college || 'College Name'}</span>
            {candidate?.educationStatus === 'graduated' ? ' having completed ' : ' Pursuing '}
            <span className="font-semibold text-[#1E293B]">{candidate?.degree || 'Degree'}</span> in <span className="font-semibold text-[#1E293B]">{candidate?.branch || 'Branch Name'}</span>
            {candidate?.board ? <span className="italic"> under {candidate.board}</span> : ''}, has successfully completed his/her internship.
          </p>
          
          <div className="bg-[#F8FAFC] py-2 px-6 rounded-full inline-block mb-4 border border-[#F1F5F9]">
            <p className="font-bold text-lg" style={{ color: '#1E293B' }}>
              Duration : <span className="text-[#A07B4A]">{formatDate(startDate)} to {formatDate(endDate)}</span> ({duration})
            </p>
          </div>
          
          <p className="max-w-3xl mx-auto italic text-sm">
            Work Area : <span className="font-bold text-[#0F172A] not-italic">{candidate?.workArea || 'Module Name'}</span>
            <br />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold mt-3 block text-[#94A3B8]">We wish them success in all future endeavors</span>
          </p>
        </div>

        {/* Signature Block - Adjusted for visibility */}
        <div className="mt-auto mb-16 w-full flex justify-end items-end pr-24">
          <SignatureBlock align="right" />
        </div>
      </div>
    </div>
  );
};

export default CertificateTemplate;
