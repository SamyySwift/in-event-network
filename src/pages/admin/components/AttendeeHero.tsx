
import React from 'react';
import AttendeeStatsCards from './AttendeeStatsCards';

type AttendeeHeroProps = {
  eventName: string;
  total: number;
  technical: number;
  business: number;
  loading: boolean;
};

const AttendeeHero: React.FC<AttendeeHeroProps> = ({
  eventName,
  total,
  technical,
  business,
  loading,
}) => {
  return (
    <div className="p-8 rounded-2xl bg-gradient-to-br from-primary-100 via-purple-100 to-blue-50 text-primary-900 dark:text-white shadow-2xl shadow-primary/10 mb-2 relative overflow-hidden">
      <div className="absolute -top-12 -right-10 w-56 h-56 bg-white/10 rounded-full opacity-40 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-14 -left-14 w-36 h-36 bg-white/20 rounded-full opacity-30 pointer-events-none" />
      <div className="relative z-10">
        <h1 className="text-4xl font-bold tracking-tight">Attendees</h1>
        <p className="mt-2 max-w-2xl text-primary-700 dark:text-primary-100">
          Manage attendees for <span className="font-semibold">{eventName}</span>.
        </p>
        <div className="mt-6">
          <AttendeeStatsCards total={total} technical={technical} business={business} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default AttendeeHero;
