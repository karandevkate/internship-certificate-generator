import React from 'react';

interface SignatureBlockProps {
  align?: 'left' | 'center' | 'right';
}

const SignatureBlock: React.FC<SignatureBlockProps> = ({ align = 'right' }) => {
  const alignClass = align === 'left' ? 'items-start' : align === 'center' ? 'items-center' : 'items-end';
  const stampAlignClass = align === 'left' ? '-left-12' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0';

  return (
    <div className={`flex flex-col ${alignClass} gap-1 relative scale-90 origin-bottom ${align === 'left' ? '-ml-8' : ''}`}>
      <div className={`signature-stamp absolute -top-24 ${stampAlignClass} pointer-events-none border-none`}>
        <img src="/Stamp.png" alt="Stamp" className="mt-5 w-35 h-35 object-contain opacity-80" />
      </div>
      <div className="relative pt-6">
        <div className="w-40 h-0.5 bg-slate-400/50 mt-2" />
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mt-2 text-left w-full">DIRECTOR</p>
    </div>
  );
};


export default SignatureBlock;
