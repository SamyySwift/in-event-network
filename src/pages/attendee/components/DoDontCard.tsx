
import React from "react";
import { Check, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface DoDontCardProps {
  dos: string[];
  donts: string[];
}

const DoDontCard: React.FC<DoDontCardProps> = ({ dos, donts }) => (
  <div className="glass-card mt-2 mb-2 bg-white/80 dark:bg-zinc-900/70 rounded-xl shadow-lg px-5 py-7 animate-fade-in border border-gray-200 dark:border-gray-700">
    <div className="flex flex-col md:flex-row gap-7 md:gap-12 justify-center items-start">
      <div className="w-full md:w-1/2">
        <h3 className="font-semibold text-green-800/80 dark:text-green-200/80 text-base mb-2 flex items-center gap-2">
          <Check className="h-5 w-5 text-emerald-400 bg-zinc-100/80 dark:bg-zinc-800/70 rounded-full p-0.5" />
          Do's
        </h3>
        <ul className="space-y-1.5">
          {dos.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm hover:scale-[1.03] transition-all">
              <Check className="h-4 w-4 text-emerald-300 dark:text-emerald-400 bg-transparent" />
              <span className="text-zinc-700 dark:text-zinc-100">{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <Separator orientation="vertical" className="hidden md:block h-40 mx-2" />
      <div className="w-full md:w-1/2">
        <h3 className="font-semibold text-rose-800/80 dark:text-rose-200/80 text-base mb-2 flex items-center gap-2">
          <X className="h-5 w-5 text-rose-400 bg-zinc-100/80 dark:bg-zinc-800/70 rounded-full p-0.5" />
          Don'ts
        </h3>
        <ul className="space-y-1.5">
          {donts.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm hover:scale-[1.03] transition-all">
              <X className="h-4 w-4 text-rose-300 dark:text-rose-400 bg-transparent" />
              <span className="text-zinc-700 dark:text-zinc-100">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
    <div className="mt-7 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm text-center font-medium">
      By attending this event, you confirm you have reviewed and will follow all guidelines.
    </div>
  </div>
);

export default DoDontCard;
