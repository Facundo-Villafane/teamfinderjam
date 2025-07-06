// src/components/admin/OverviewTab.jsx - Con botón de refresh y estadísticas mejoradas
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BarChart3, 
  Calendar, 
  ExternalLink, 
  RefreshCw,
  Vote,
  MessageSquare,
  TrendingUp,
  Clock
} from 'lucide-react';
import { StatCard } from './StatCard';
import { getJamParticipationStats } from '../../firebase/participants';
import { getAdminVotingResults } from '../../firebase/themes';

export const OverviewTab = ({ stats, jams, onRefresh }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [jamStats, setJamStats] = useState({});
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const activeJam = jams.find(j => j.active) || null;

  // Cargar estadísticas adicionales para la jam activa
  const loadJamSpecificStats = async () => {
    if (!activeJam?.id) return;

    try {
      const [participationStats, votingResults] = await Promise.all([
        getJamParticipationStats(activeJam.id),
        getAdminVotingResults(activeJam.id)
      ]);

      setJamStats({
        participants: participationStats.totalParticipants,
        recentJoins: participationStats.recentJoins,
        totalVotes: votingResults.totalVotes,
        uniqueVoters: votingResults.uniqueVoters
      });
    } catch (error) {
      console.error('Error loading jam-specific stats:', error);
    }
  };

  // Refresh manual
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        onRefresh?.(), // Refresh general stats
        loadJamSpecificStats() // Refresh jam-specific stats
      ]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing stats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      loadJamSpecificStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [activeJam?.id]);

  // Cargar stats de jam al cambiar jam activa
  useEffect(() => {
    loadJamSpecificStats();
  }, [activeJam?.id]);

  return (
    <div className="space-y-6">
      {/* Header con botón de refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Panel de Control</h2>
          <p className="text-gray-400">
            Última actualización: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Usuarios con Posts" 
          value={stats.totalUsers || 0} 
          icon={MessageSquare} 
          color="bg-blue-500"
          subtitle="Usuarios que han publicado"
        />
        <StatCard 
          title="Total Posts" 
          value={stats.totalPosts || 0} 
          icon={BarChart3} 
          color="bg-green-500"
          subtitle="Publicaciones de equipo"
        />
        <StatCard 
          title="Jams Activas" 
          value={stats.activeJams || 0} 
          icon={Calendar} 
          color="bg-orange-500"
          subtitle="Game jams en curso"
        />
        <StatCard 
          title="Total Jams" 
          value={stats.totalJams || 0} 
          icon={Users} 
          color="bg-purple-500"
          subtitle="Jams creadas históricamente"
        />
      </div>

      {/* Estadísticas de la jam activa */}
      {activeJam && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Estadísticas de la Jam Activa
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Participantes</p>
                  <p className="text-2xl font-bold text-white">
                    {jamStats.participants || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Nuevos Hoy</p>
                  <p className="text-2xl font-bold text-green-400">
                    {jamStats.recentJoins || 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Votos</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {jamStats.totalVotes || 0}
                  </p>
                </div>
                <Vote className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Votantes</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {jamStats.uniqueVoters || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información de la jam activa */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Jam Activa</h3>
        {activeJam ? (
          <div className="space-y-4">
            <div className="border border-gray-600 rounded-lg p-4">
              <div className="flex items-center gap-4 mb-3">
                <img 
                  src={activeJam.bannerUrl || 'https://via.placeholder.com/128x64/374151/9CA3AF?text=No+Banner'} 
                  alt={activeJam.name} 
                  className="h-16 w-32 object-cover rounded border border-gray-600" 
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-lg">{activeJam.name}</h4>
                  <p className="text-gray-300 text-sm">{activeJam.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-gray-400">
                      📅 {activeJam.startDate} → {activeJam.endDate}
                    </span>
                    {activeJam.selectedTheme && (
                      <span className="text-sm text-green-400 font-medium">
                        🏆 Tema: {activeJam.selectedTheme.title}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                {activeJam.jamLink && (
                  <a 
                    href={activeJam.jamLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Ver jam original
                  </a>
                )}
                
                <span className="text-gray-400">
                  Estado de votación: {activeJam.themeVotingClosed ? '🔒 Cerrada' : '🗳️ Abierta'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-500" />
            <p className="text-gray-400">No hay jams activas</p>
            <p className="text-gray-500 text-sm">Crea una nueva jam para comenzar</p>
          </div>
        )}
      </div>

      {/* Acciones rápidas */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-orange-400" />
            <h4 className="font-medium text-white mb-1">Gestionar Jams</h4>
            <p className="text-gray-400 text-sm">Crear, editar y activar jams</p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <Vote className="w-8 h-8 mx-auto mb-2 text-purple-400" />
            <h4 className="font-medium text-white mb-1">Temas y Votación</h4>
            <p className="text-gray-400 text-sm">Administrar temas y resultados</p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <h4 className="font-medium text-white mb-1">Migración</h4>
            <p className="text-gray-400 text-sm">Migrar usuarios existentes</p>
          </div>
        </div>
      </div>
    </div>
  );
};