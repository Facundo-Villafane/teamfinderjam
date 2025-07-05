// src/components/gamejam/JamBanner.jsx - Banner mejorado
import React from 'react';
import { Calendar, ExternalLink, Trophy, Users, Clock } from 'lucide-react';

export const JamBanner = ({ jam }) => {
  if (!jam) return null;

  const isActive = jam.active;
  const today = new Date();
  const startDate = new Date(jam.startDate);
  const endDate = new Date(jam.endDate);
  
  // Calcular estado de la jam
  let jamStatus = 'upcoming';
  if (today >= startDate && today <= endDate) {
    jamStatus = 'active';
  } else if (today > endDate) {
    jamStatus = 'ended';
  }

  const getStatusInfo = () => {
    switch (jamStatus) {
      case 'active':
        return { text: 'LIVE NOW', color: 'bg-green-500', icon: '🔴' };
      case 'upcoming':
        return { text: 'UPCOMING', color: 'bg-blue-500', icon: '⏰' };
      case 'ended':
        return { text: 'ENDED', color: 'bg-gray-500', icon: '🏁' };
      default:
        return { text: 'ACTIVE', color: 'bg-orange-500', icon: '🎮' };
    }
  };

  const status = getStatusInfo();

  return (
    <div className="bg-gradient-to-r from-orange-800 to-amber-800 rounded-lg p-6 mb-8 text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent transform rotate-12 translate-x-1/2"></div>
      </div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-7 h-7 text-yellow-400" />
              <h1 className="text-3xl font-bold">{jam.name}</h1>
              <span className={`${status.color} text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1`}>
                <span>{status.icon}</span>
                {status.text}
              </span>
            </div>
            
            <p className="text-orange-100 text-lg mb-4 max-w-2xl">{jam.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {jam.theme && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="font-semibold">Theme:</span>
                  <span className="text-yellow-200 font-bold">{jam.theme}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-300" />
                <span className="font-semibold">Duration:</span>
                <span>{jam.startDate} → {jam.endDate}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-300" />
                <span className="font-semibold">Find your team below!</span>
              </div>
            </div>
          </div>
          
          {jam.bannerUrl && (
            <div className="ml-6 hidden lg:block">
              <img 
                src={jam.bannerUrl} 
                alt={jam.name}
                className="h-32 w-64 object-cover rounded-lg shadow-lg border-2 border-orange-600"
              />
            </div>
          )}
        </div>
        
        {jam.jamLink && (
          <div className="pt-4 border-t border-orange-600">
            <a 
              href={jam.jamLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 px-6 py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <ExternalLink className="w-5 h-5" />
              Visit Official Jam Page
            </a>
          </div>
        )}
      </div>
    </div>
  );
};