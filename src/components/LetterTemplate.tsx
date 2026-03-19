import React from 'react';
import { Candidate } from '../types';
import SignatureBlock from './SignatureBlock';
import { formatDate } from '../utils/helpers';

interface LetterTemplateProps {
  candidate: Candidate | null;
  startDate: string;
  endDate: string;
}

const LetterTemplate: React.FC<LetterTemplateProps> = ({
  candidate,
  startDate,
  endDate
}) => {
  return (
    <div className="letter-container bg-white relative">
      {/* Letter Head Background */}
      <img src="/Letter head.png" alt="Letter Head" className="absolute inset-0 w-full h-full object-fill pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full pt-48">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold border-b-2 border-slate-800 inline-block pb-1 tracking-widest uppercase">INTERNSHIP COMPLETION LETTER</h1>
        </div>

        <div className="space-y-6 text-slate-800 leading-[1.6] text-[15px] px-6 text-justify">
          <p className="font-bold text-lg mb-8 text-left">Dear {candidate?.salutation || 'Ms.'} {candidate?.name || 'Candidate Name'},</p>

          <p>Congratulations on completing your internship with <span className="font-bold">FIRST QUAD TECH SOLUTIONS</span>. Your dedication and hard work have been commendable. Throughout your internship, you consistently demonstrated exceptional skills, professionalism, and a strong work ethic. Your contributions to our organization have been invaluable.</p>

          <p>We appreciate your efforts in successfully completing assigned projects and tasks between <span className="font-bold">{formatDate(startDate)} to {formatDate(endDate)}</span>. Your attention to detail, ability to meet deadlines, and high-quality work have been impressive. Thank you for your positive attitude and collaboration with the team. Your ability to work well with others and contribute to our success has been greatly appreciated.</p>

          <p>We are confident that you have a bright future ahead. On behalf of <span className="font-bold">FIRST QUAD TECH SOLUTIONS</span> we wish you every success in your future endeavors. Please feel free to reach out if you need any further assistance or if you require any documentation from our organization.</p>
        </div>

        <div className="mt-16 px-6 text-left">
          <SignatureBlock align="left" className="mt-6" />
          <div className="mt-1 space-y-1">
            <p className="font-bold text-slate-600">Regards,</p>
            <p className="font-black text-black-600 tracking-wider">FIRST QUAD TECH SOLUTIONS</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LetterTemplate;
