
import React from "react";
import { Check, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface DoDontCardProps {
  dos: string[];
  donts: string[];
}

const DoDontCard: React.FC<DoDontCardProps> = ({ dos, donts }) => (
  <div className="glass-card mt-1 mb-4 bg-gradient-to-br from-primary-100/60 via-white/80 to-pink-100/50 dark:from-gray-900 dark:via-primary-900/40 dark:to-indigo-900/30 rounded-2xl shadow-2xl px-6 py-8 animate-fade-in">
    <div className="flex flex-col md:flex-row gap-10 md:gap-24 justify-center items-start">
      <div className="w-full md:w-1/2">
        <h3 className="font-bold text-green-700 text-lg mb-3 flex items-center gap-2">
          <Check className="h-6 w-6 text-green-500 bg-white/70 rounded-full p-1 shadow" />
          Do's
        </h3>
        <ul className="space-y-2">
          {dos.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2 text-base hover:scale-105 transition-all">
              <Check className="h-5 w-5 text-green-600 bg-green-100 rounded-full" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <Separator orientation="vertical" className="hidden md:block h-44 mx-3" />
      <div className="w-full md:w-1/2">
        <h3 className="font-bold text-red-700 text-lg mb-3 flex items-center gap-2">
          <X className="h-6 w-6 text-red-500 bg-white/70 rounded-full p-1 shadow" />
          Don'ts
        </h3>
        <ul className="space-y-2">
          {donts.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2 text-base hover:scale-105 transition-all">
              <X className="h-5 w-5 text-red-600 bg-red-100 rounded-full" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
    <div className="mt-9 px-4 py-3 rounded-xl bg-primary-100/60 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 shadow text-primary-900 dark:text-primary-100 text-base text-center font-medium">
      By attending this event, you acknowledge that you have read and agree to follow all rules and guidelines. Thank you for your cooperation!
    </div>
  </div>
);

export default DoDontCard;
