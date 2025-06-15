
import React from "react";
import { Check, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

interface DoDontCardProps {
  dos: string[];
  donts: string[];
}

const DoDontCard: React.FC<DoDontCardProps> = ({ dos, donts }) => (
  <Card className="rounded-2xl border-0 bg-gradient-to-br from-green-50/80 to-blue-50/80 dark:from-zinc-800/90 dark:to-zinc-900/80 shadow-2xl mt-4 mb-2 px-0 py-0 overflow-visible relative">
    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-primary/5 dark:from-zinc-900/30 dark:to-zinc-800/50 z-0"></div>
    <CardContent className="relative z-10 px-8 py-9">
      <div className="flex flex-col md:flex-row gap-10 md:gap-16 justify-center items-start">
        <div className="w-full md:w-1/2">
          <h3 className="font-semibold text-green-800/90 dark:text-green-200/80 text-lg mb-3 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
              <Check className="h-5 w-5 text-white" />
            </span>
            Do's
          </h3>
          <ul className="space-y-2">
            {dos.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-base hover:scale-[1.03] transition-all">
                <Check className="h-4 w-4 text-emerald-400 dark:text-emerald-300" />
                <span className="text-zinc-800 dark:text-zinc-100">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <Separator orientation="vertical" className="hidden md:block h-44 mx-2 border-l-2 border-dashed border-zinc-200 dark:border-zinc-700" />
        <div className="w-full md:w-1/2">
          <h3 className="font-semibold text-rose-800/90 dark:text-rose-100/80 text-lg mb-3 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center">
              <X className="h-5 w-5 text-white" />
            </span>
            Don'ts
          </h3>
          <ul className="space-y-2">
            {donts.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-base hover:scale-[1.03] transition-all">
                <X className="h-4 w-4 text-rose-400 dark:text-rose-300" />
                <span className="text-zinc-800 dark:text-zinc-100">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-8 px-4 py-3 rounded-lg bg-white/70 dark:bg-zinc-800/80 border border-zinc-100 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-base text-center font-medium shadow">
        By attending this event, you confirm you have reviewed and will follow all guidelines.
      </div>
    </CardContent>
  </Card>
);

export default DoDontCard;
