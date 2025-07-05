// src/components/gamejam/ThemeVoting.jsx - Sistema de votación dinámico
import React, { useState, useEffect } from 'react';
import { Vote, Trophy, Users, Clock, CheckCircle, Lock } from 'lucide-react';

export const ThemeVoting = ({ currentJam, user, onSignIn }) => {
  const [themes, setThemes] = useState([]);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votingResults, setVotingResults] = useState({});
  const [votingClosed, setVotingClosed] = useState(false);
  const [winnerTheme, setWinnerTheme] = useState(null);

  // Cargar temas y votos desde Firebase
  useEffect(() => {
    if (currentJam?.id) {
      loadThemes();
      loadVotingResults();
      if (user) loadUserVote();
    }
  }, [currentJam, user]);

  const loadThemes = async () => {
    try {
      // Aquí llamarías a Firebase para obtener los temas de la jam actual
      const themesData = await getThemesByJam(currentJam.id);
      setThemes(themesData || []);
      setVotingClosed(currentJam.themeVotingClosed || false);
      setWinnerTheme(currentJam.selectedTheme || null);
    } catch (error) {
      console.error('Error loading themes:', error);
      setThemes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadVotingResults = async () => {
    try {
      const results = await getVotingResults(currentJam.id);
      setVotingResults(results || {});
    } catch (error) {
      console.error('Error loading voting results:', error);
    }
  };

  const loadUserVote = async () => {
    try {
      const vote = await getUserVote(user.uid, currentJam.id);
      setUserVote(vote?.themeId || null);
    } catch (error) {
      console.error('Error loading user vote:', error);
    }
  };

  const handleVote = async (themeId) => {
    if (!user) {
      if (window.confirm('Necesitas iniciar sesión para votar. ¿Quieres hacerlo ahora?')) {
        onSignIn();
      }
      return;
    }

    if (votingClosed) {
      alert('La votación ya está cerrada');
      return;
    }

    try {
      // Guardar voto en Firebase
      await saveVote(user.uid, currentJam.id, themeId, userVote);
      setUserVote(themeId);
      
      // Recargar resultados
      await loadVotingResults();
      
    } catch (error) {
      console.error('Error saving vote:', error);
      alert('Error al guardar el voto. Intenta de nuevo.');
    }
  };

  const getTotalVotes = () => {
    return Object.values(votingResults).reduce((total, count) => total + count, 0);
  };

  const getVotePercentage = (themeId) => {
    const total = getTotalVotes();
    if (total === 0) return 0;
    return Math.round(((votingResults[themeId] || 0) / total) * 100);
  };

  const getMostVotedTheme = () => {
    if (Object.keys(votingResults).length === 0) return null;
    
    return Object.entries(votingResults).reduce((max, [themeId, votes]) => {
      return votes > (max.votes || 0) ? { themeId, votes } : max;
    }, {});
  };

  if (loading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
        <div className="text-center text-gray-400">
          <Clock className="w-8 h-8 mx-auto mb-2 animate-spin" />
          <p>Cargando votación de temas...</p>
        </div>
      </div>
    );
  }

  if (!themes || themes.length === 0) {
    return null; // No mostrar si no hay temas configurados
  }

  const totalVotes = getTotalVotes();
  const mostVoted = getMostVotedTheme();

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8 text-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Vote className="w-6 h-6" style={{ color: '#0fc064' }} />
          <h2 className="text-2xl font-bold">
            {votingClosed ? 'Tema Seleccionado' : 'Votación de Tema'}
          </h2>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-2 text-gray-300">
            <Users className="w-4 h-4" />
            <span className="text-sm">{totalVotes} votos</span>
          </div>
          {votingClosed && (
            <div className="flex items-center gap-2 text-red-400">
              <Lock className="w-4 h-4" />
              <span className="text-sm">Votación cerrada</span>
            </div>
          )}
        </div>
      </div>

      {votingClosed && winnerTheme && (
        <div className="bg-gradient-to-r from-yellow-900 to-orange-900 border border-yellow-600 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold text-yellow-200">Tema Ganador</h3>
          </div>
          <h4 className="text-xl font-bold text-white">{winnerTheme.title}</h4>
          <p className="text-yellow-100 text-sm mt-1">{winnerTheme.description}</p>
        </div>
      )}

      <div className="space-y-4">
        {themes.map((theme) => {
          const voteCount = votingResults[theme.id] || 0;
          const percentage = getVotePercentage(theme.id);
          const isUserVote = userVote === theme.id;
          const isWinning = mostVoted?.themeId === theme.id && totalVotes > 0;

          return (
            <div
              key={theme.id}
              className={`relative border rounded-lg p-4 transition-all cursor-pointer ${
                votingClosed
                  ? 'border-gray-600 cursor-default'
                  : isUserVote
                  ? 'border-green-500 bg-green-900 bg-opacity-20'
                  : 'border-gray-600 hover:border-gray-500'
              } ${isWinning ? 'ring-2 ring-yellow-500' : ''}`}
              onClick={() => !votingClosed && handleVote(theme.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-lg">{theme.title}</h4>
                    {isUserVote && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                    {isWinning && totalVotes > 0 && (
                      <Trophy className="w-5 h-5 text-yellow-400" />
                    )}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {theme.description}
                  </p>
                  
                  {theme.category && (
                    <div className="mt-2">
                      <span 
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ 
                          backgroundColor: theme.categoryColor || '#6B7280',
                          color: 'white'
                        }}
                      >
                        {theme.category}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-right ml-4">
                  <div className="text-lg font-bold">{voteCount}</div>
                  <div className="text-sm text-gray-400">
                    {percentage}%
                  </div>
                </div>
              </div>

              {/* Barra de progreso */}
              {totalVotes > 0 && (
                <div className="mt-3">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: isWinning ? '#EAB308' : '#0fc064'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!user && !votingClosed && (
        <div className="mt-6 text-center bg-gray-900 border border-gray-600 rounded-lg p-4">
          <p className="text-gray-300 mb-3">
            ¡Inicia sesión para votar por tu tema favorito!
          </p>
          <button
            onClick={onSignIn}
            className="px-6 py-2 rounded-lg font-medium transition-colors text-white"
            style={{ backgroundColor: '#0fc064' }}
          >
            Iniciar Sesión para Votar
          </button>
        </div>
      )}

      {user && userVote && !votingClosed && (
        <div className="mt-4 text-center text-green-400 text-sm">
          ✅ Ya votaste. Puedes cambiar tu voto haciendo click en otro tema.
        </div>
      )}
    </div>
  );
};

// Funciones de Firebase (estas las implementarías en tu firebase/firestore.js)
const getThemesByJam = async (jamId) => {
  // Implementar: obtener temas de una jam específica
  return [];
};

const getVotingResults = async (jamId) => {
  // Implementar: obtener conteo de votos por tema
  return {};
};

const getUserVote = async (userId, jamId) => {
  // Implementar: obtener el voto del usuario para esta jam
  return null;
};

const saveVote = async (userId, jamId, themeId, previousVote) => {
  // Implementar: guardar/actualizar voto del usuario
  // Si previousVote existe, actualizar en lugar de crear nuevo
};