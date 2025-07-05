// src/components/gamejam/JamBanner.jsx - Versión en Español
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
        return { text: 'EN VIVO', color: '#0fc064', icon: '🔴' };
      case 'upcoming':
        return { text: 'PRÓXIMAMENTE', color: '#0fc064', icon: '⏰' };
      case 'ended':
        return { text: 'FINALIZADA', color: '#6b7280', icon: '🏁' };
      default:
        return { text: 'ACTIVA', color: '#0fc064', icon: '🎮' };
    }
  };

  const status = getStatusInfo();

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8 text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent transform rotate-12 translate-x-1/2"></div>
      </div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-7 h-7" style={{ color: '#0fc064' }} />
              <h1 className="text-3xl font-bold">{jam.name}</h1>
              <span 
                className="text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"
                style={{ backgroundColor: status.color }}
              >
                <span>{status.icon}</span>
                {status.text}
              </span>
            </div>
            
            <p className="text-gray-300 text-lg mb-4 max-w-2xl">{jam.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {jam.theme && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0fc064' }}></div>
                  <span className="font-semibold">Tema:</span>
                  <span className="font-bold" style={{ color: '#0fc064' }}>{jam.theme}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="font-semibold">Duración:</span>
                <span>{jam.startDate} → {jam.endDate}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="font-semibold">¡Encuentra tu equipo abajo!</span>
              </div>
            </div>
          </div>
          
          {jam.bannerUrl && (
            <div className="ml-6 hidden lg:block">
              <img 
                src={jam.bannerUrl} 
                alt={jam.name}
                className="h-32 w-64 object-cover rounded-lg shadow-lg border-2"
                style={{ borderColor: '#0fc064' }}
              />
            </div>
          )}
        </div>
        
        {jam.jamLink && (
          <div className="pt-4 border-t border-gray-700">
            <a 
              href={jam.jamLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg text-white hover:opacity-90"
              style={{ backgroundColor: '#0fc064' }}
            >
              <ExternalLink className="w-5 h-5" />
              Visitar Página Oficial de la Jam
            </a>
          </div>
        )}
      </div>
    </div>
  );
};