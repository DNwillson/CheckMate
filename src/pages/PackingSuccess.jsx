import React from 'react';
import { Sun, Smile, ArrowRight } from 'lucide-react';

const PackingSuccess = ({ onHome, theme }) => {
  return (
    <div className={`h-full flex flex-col items-center justify-center p-8 ${theme.success} relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-[#E9EDC9]/50 to-transparent"></div>
      <div className="absolute top-20 right-10 w-32 h-32 bg-[#FEFAE0] rounded-full blur-3xl opacity-60 animate-pulse"></div>

      <div className="z-10 flex flex-col items-center text-center animate-fade-in">
        <div className="relative mb-12 animate-float">
           <div className="w-40 h-40 bg-[#FEFAE0] rounded-full flex items-center justify-center shadow-2xl shadow-[#CCD5AE]/50">
              <Sun size={80} className={theme.primaryText} strokeWidth={1.5} />
           </div>
           <div className="absolute -bottom-4 -right-2 bg-white p-3 rounded-full shadow-lg rotate-12">
              <Smile size={32} className={theme.success} />
           </div>
        </div>

        <h2 className={`text-3xl font-bold mb-4 ${theme.textMain} tracking-tight`}>All Set!</h2>
        <p className={`${theme.textSub} text-lg mb-16 font-medium`}>
          Everything is packed.<br/>Enjoy the sunshine and breeze today!
        </p>

        <button onClick={onHome} className={`bg-[#FEFAE0] ${theme.primaryText} px-12 py-5 rounded-[20px] font-bold text-lg shadow-xl hover:bg-white transition-all active:scale-95 flex items-center space-x-2`}>
          <span>Let's Go</span>
          <ArrowRight size={20}/>
        </button>
      </div>
    </div>
  );
};

export default PackingSuccess;