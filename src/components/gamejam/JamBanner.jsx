// src/components/gamejam/JamBanner.jsx - Con participación y tema ganador
import React, { useState, useEffect } from 'react';
import { Calendar, ExternalLink, Trophy, Users, Clock, UserPlus, UserCheck } from 'lucide-react';
import { useJamParticipation } from '../../hooks/useJamParticipation';

export const JamBanner = ({ jam, user, onSignIn }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const {
    isJoined,
    loading: participationLoading,
    joining,
    participationStats,
    handleJoinJam: originalHandleJoinJam,
    handleLeaveJam,
    getRestrictionMessage
  } = useJamParticipation(user, jam);

  // Wrapper para manejar el join y notificar a otros componentes
  const handleJoinJam = async () => {
    const success = await originalHandleJoinJam()
    if (success) {
      // Notificar a otros componentes que el usuario se unió
      window.dispatchEvent(new CustomEvent('jam-joined'))
      console.log('Usuario se unió exitosamente, evento disparado')
    }
    return success
  }

  // Actualizar el tiempo cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, []);

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
    const now = currentTime; // Usar el estado actualizado
    const start = new Date(jam.startDate);
    const end = new Date(jam.endDate);
    
    // Función para calcular diferencia de tiempo
    const getTimeDifference = (targetDate) => {
      const diff = targetDate.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        return `${days}d ${hours}h`;
      } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        return `${minutes}m`;
      } else {
        return 'Ahora';
      }
    };
    
    // Función para obtener tiempo restante hasta el final
    const getTimeRemaining = () => {
      const diff = end.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        return `${days}d ${hours}h`;
      } else if (hours > 0) {
        return `${hours}h`;
      } else if (minutes > 0) {
        return `${minutes}m`;
      } else {
        return 'Últimos minutos';
      }
    };

    if (now < start) {
      // Jam aún no ha comenzado
      const timeToStart = getTimeDifference(start);
      return { 
        text: `INICIA EN ${timeToStart}`, 
        color: '#0fc064', 
        icon: '⏰'
      };
    } else if (now >= start && now <= end) {
      // Jam está en curso
      const timeRemaining = getTimeRemaining();
      return { 
        text: `EN CURSO - ${timeRemaining}`, 
        color: '#0fc064', 
        icon: '🔴'
      };
    } else {
      // Jam terminada
      const daysSinceEnd = Math.floor((now.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));
      return { 
        text: `FINALIZADA - Hace ${daysSinceEnd === 0 ? 'hoy' : daysSinceEnd + 'd'}`, 
        color: '#6b7280', 
        icon: '🏁'
      };
    }
  };

  // Función para determinar qué mostrar como tema
  const getThemeDisplay = () => {
    if (jam.selectedTheme) {
      return {
        text: jam.selectedTheme.title,
        subtitle: 'Tema oficial de la jam',
        color: '#fbbf24', // Amarillo dorado para tema ganador
        icon: '👑'
      };
    }
    if (jam.themeVotingClosed && !jam.selectedTheme) {
      return {
        text: 'Votación cerrada',
        subtitle: 'Esperando selección del organizador',
        color: '#8b5cf6', // Púrpura
        icon: '⏳'
      };
    }
    if (jam.themes && jam.themes.length > 0) {
      return {
        text: 'Votación en curso',
        subtitle: 'Ve a votar por tu tema favorito',
        color: '#0fc064', // Verde
        icon: '🗳️'
      };
    }
    return {
      text: 'Próximamente',
      subtitle: 'Los temas se anunciarán pronto',
      color: '#6b7280', // Gris
      icon: '📋'
    };
  };

  const status = getStatusInfo();
  const themeInfo = getThemeDisplay();

  // Botón de participación
  const renderParticipationButton = () => {
    // Si no hay usuario, mostrar botón de iniciar sesión
    if (!user) {
      return (
        <button
          onClick={onSignIn}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg text-white hover:opacity-90"
          style={{ backgroundColor: '#0fc064' }}
        >
          <UserPlus className="w-5 h-5" />
          Iniciar Sesión para Unirse
        </button>
      );
    }

    // Si está cargando la verificación de participación
    if (participationLoading) {
      return (
        <button 
          disabled
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold bg-gray-600 text-gray-300 cursor-not-allowed"
        >
          <Clock className="w-5 h-5 animate-spin" />
          Verificando...
        </button>
      );
    }

    // Si ya está unido a la jam
    if (isJoined) {
      return (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-900 border border-green-600">
            <UserCheck className="w-5 h-5 text-green-400" />
            <span className="text-green-200 font-semibold">Participando</span>
          </div>
          
          <button
            onClick={handleLeaveJam}
            disabled={joining}
            className="px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
          >
            {joining ? 'Saliendo...' : 'Salir de la Jam'}
          </button>
        </div>
      );
    }

    // Si está logueado pero NO unido a la jam
    return (
      <button
        onClick={handleJoinJam}
        disabled={joining}
        className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg text-white hover:opacity-90 disabled:opacity-50 disabled:transform-none"
        style={{ backgroundColor: '#0fc064' }}
      >
        <UserPlus className="w-5 h-5" />
        {joining ? 'Uniéndose...' : 'Unirse a la Jam'}
      </button>
    );
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden mb-8 text-white relative">
      {/* Imagen de banner como fondo si existe */}
      {jam.bannerUrl && (
        <div className="relative">
          <img 
            src={jam.bannerUrl} 
            alt={jam.name}
            className="w-full h-48 md:h-56 lg:h-64 object-cover"
          />
        </div>
      )}
      
      {/* Background pattern para cuando no hay imagen */}
      {!jam.bannerUrl && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent transform rotate-12 translate-x-1/2"></div>
        </div>
      )}
      
      <div className={`${jam.bannerUrl ? 'absolute inset-0' : ''} relative p-6 flex flex-col justify-center`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <Trophy className="w-7 h-7" style={{ color: '#0fc064' }} />
              <h1 className="text-3xl md:text-4xl font-bold">{jam.name}</h1>
              <span 
                className="text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"
                style={{ backgroundColor: status.color }}
              >
                <span>{status.icon}</span>
                {status.text}
              </span>
            </div>
            
            <p className="text-gray-200 text-lg mb-4 max-w-3xl">{jam.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6">
              {/* Tema de la jam */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: themeInfo.color }}></div>
                <span className="font-semibold">Tema:</span>
                <div className="flex items-center gap-1">
                  <span>{themeInfo.icon}</span>
                  <span className="font-bold" style={{ color: themeInfo.color }}>
                    {themeInfo.text}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-300" />
                <span className="font-semibold">Duración:</span>
                <span>{jam.startDate} → {jam.endDate}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-300" />
                <span className="font-semibold">Participantes:</span>
                <span style={{ color: '#0fc064' }}>{participationStats.totalParticipants}</span>
                {participationStats.recentJoins > 0 && (
                  <span className="text-green-400 text-xs">
                    (+{participationStats.recentJoins} hoy)
                  </span>
                )}
              </div>
            </div>

            {/* Mensaje sobre el tema si hay información adicional */}
            {themeInfo.subtitle && (
              <div className="mb-4 p-3 bg-gray-700 bg-opacity-50 rounded-lg border-l-4" 
                   style={{ borderColor: themeInfo.color }}>
                <p className="text-sm text-gray-300">{themeInfo.subtitle}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-600">
          {/* Botón de participación */}
          {renderParticipationButton()}
          
          {/* Enlace a la jam oficial */}
          {jam.jamLink && (
            <a 
              href={jam.jamLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all duration-200 border-2 border-gray-500 text-white hover:border-gray-400 hover:bg-gray-700"
            >
              <ExternalLink className="w-5 h-5" />
              Página Oficial
            </a>
          )}
        </div>
      </div>
    </div>
  );
};