
import React from "react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  borderGradient: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  gradient,
  borderGradient
}) => (
  <div className={`relative group p-6 rounded-xl bg-gradient-to-br ${gradient} backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl`}>
    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${borderGradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl`} />
    <div className="relative z-10">
      <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-4 text-cyan-400">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
      <p className="text-white/60 leading-relaxed">{description}</p>
    </div>
  </div>
);

export default FeatureCard;
