// src/components/gamejam/ThemeVoting.jsx - Sistema de múltiples votos corregido
import React, { useState, useEffect } from 'react';
import { 
  Vote, 
  Trophy, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  Users,
  Grid3X3,
  List,
  UserPlus,
  Shield,
  Star,
  StarOff,
  Info
} from 'lucide-react';
import { 
  getThemesByJam, 
  getUserVotes, 
  addVote,
  removeVote,
  getRemainingVotes,
  getVotingResults 
} from '../../firebase/themes';
import { useJamParticipation } from '../../hooks/useJamParticipation';

export const ThemeVoting = ({ currentJam, user, onSignIn }) => {
  const [themes, setThemes] = useState([]);
  const [userVotes, setUserVotes] = useState([]); // Array de IDs de temas votados
  const [remainingVotes, setRemainingVotes] = useState(4);
  const [votingResults, setVotingResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [submittingVote, setSubmittingVote] = useState(false);
  const [expandedThemes, setExpandedThemes] = useState(new Set());
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grouped'

  // Hook de participación
  const {
    isJoined,
    loading: participationLoading,
    joining,
    handleJoinJam,
    canVote,
    getRestrictionMessage
  } = useJamParticipation(user, currentJam);

  // ✅ FUNCIONES AUXILIARES PRIMERO (antes de usarlas)
  const getThemesByCategory = () => {
    const grouped = {};
    themes.forEach(theme => {
      const category = theme.category || 'Sin Categoría';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(theme);
    });
    return grouped;
  };

  const getVotePercentage = (themeId) => {
    if (!showResults) return 0;
    const totalVotes = Object.values(votingResults).reduce((sum, count) => sum + count, 0);
    if (totalVotes === 0) return 0;
    const votes = votingResults[themeId] || 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const toggleThemeExpansion = (themeId) => {
    const newExpanded = new Set(expandedThemes);
    if (newExpanded.has(themeId)) {
      newExpanded.delete(themeId);
    } else {
      newExpanded.add(themeId);
    }
    setExpandedThemes(newExpanded);
  };

  // ✅ CÁLCULOS (después de las funciones auxiliares)
  const totalUserVotes = userVotes.length;
  const votingClosed = currentJam?.themeVotingClosed || false;
  const winnerTheme = currentJam?.selectedTheme || null;
  const groupedThemes = getThemesByCategory();
  const showResults = winnerTheme !== null; // Solo mostrar resultados cuando hay ganador

  // Cargar datos de temas
  useEffect(() => {
    loadThemeData();
  }, [currentJam?.id]);

  // Verificar votos del usuario cuando cambia el usuario o la jam
  useEffect(() => {
    if (user && currentJam?.id && isJoined) {
      loadUserVotes();
    } else {
      setUserVotes([]);
      setRemainingVotes(4);
    }
  }, [user, currentJam?.id, isJoined]);

  const loadThemeData = async () => {
    if (!currentJam?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [themesData, resultsData] = await Promise.all([
        getThemesByJam(currentJam.id),
        getVotingResults(currentJam.id) // Solo muestra resultados si hay ganador
      ]);
      
      setThemes(themesData);
      setVotingResults(resultsData);
    } catch (error) {
      console.error('Error loading theme data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserVotes = async () => {
    try {
      const votes = await getUserVotes(user.uid, currentJam.id);
      const voteThemeIds = votes.map(vote => vote.themeId);
      setUserVotes(voteThemeIds);
      
      const remaining = await getRemainingVotes(user.uid, currentJam.id);
      setRemainingVotes(remaining);
    } catch (error) {
      console.error('Error loading user votes:', error);
    }
  };

  const handleVoteToggle = async (themeId) => {
    if (!canVote()) {
      const message = getRestrictionMessage('votar');
      alert(message);
      return;
    }

    if (submittingVote) return;

    const isCurrentlyVoted = userVotes.includes(themeId);

    try {
      setSubmittingVote(true);
      
      if (isCurrentlyVoted) {
        // Remover voto
        await removeVote(user.uid, currentJam.id, themeId);
        setUserVotes(prev => prev.filter(id => id !== themeId));
        setRemainingVotes(prev => prev + 1);
      } else {
        // Verificar si puede agregar más votos
        if (remainingVotes <= 0) {
          alert('Ya has usado todos tus votos (máximo 4). Remueve algún voto para votar por otro tema.');
          return;
        }
        
        // Agregar voto
        await addVote(user.uid, currentJam.id, themeId);
        setUserVotes(prev => [...prev, themeId]);
        setRemainingVotes(prev => prev - 1);
      }
      
      // Solo recargar resultados si hay un tema ganador (para mostrar resultados finales)
      if (currentJam.selectedTheme) {
        const newResults = await getVotingResults(currentJam.id);
        setVotingResults(newResults);
      }
    } catch (error) {
      console.error('Error toggling vote:', error);
      alert(error.message || 'Error al procesar el voto. Intenta de nuevo.');
    } finally {
      setSubmittingVote(false);
    }
  };

  // Renderizar botón de "Unirse para votar"
  const renderJoinToVoteButton = () => {
    if (!user) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-900 flex items-center justify-center mx-auto mb-4">
            <Vote className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            ¡Únete a la Votación!
          </h3>
          <p className="text-gray-300 mb-4">
            Inicia sesión para votar por tus temas favoritos (hasta 4 votos)
          </p>
          <button
            onClick={onSignIn}
            className="px-6 py-3 rounded-lg font-medium transition-colors text-white"
            style={{ backgroundColor: '#0fc064' }}
          >
            Iniciar Sesión
          </button>
        </div>
      );
    }

    if (!isJoined) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-900 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            ¡Únete a la Jam para Votar!
          </h3>
          <p className="text-gray-300 mb-4">
            Solo los participantes pueden votar por los temas (hasta 4 votos por persona)
          </p>
          <button
            onClick={handleJoinJam}
            disabled={joining}
            className="px-6 py-3 rounded-lg font-medium transition-colors text-white disabled:opacity-50"
            style={{ backgroundColor: '#0fc064' }}
          >
            {joining ? 'Uniéndose...' : 'Unirse a la Jam'}
          </button>
        </div>
      );
    }

    return null;
  };

  // Estados de loading y error
  if (!currentJam) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8 text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
        <p className="text-white">No hay una jam activa en este momento</p>
        <p className="text-gray-400 text-sm">Los temas aparecerán cuando se active una jam</p>
      </div>
    );
  }

  if (loading || participationLoading) {
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
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8 text-center">
        <Vote className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-white mb-2">Aún no hay temas para votar</p>
        <p className="text-gray-400 text-sm">Los organizadores añadirán temas pronto</p>
        {renderJoinToVoteButton()}
      </div>
    );
  }

  // Si el usuario no puede votar, mostrar el botón de unirse
  if (!canVote()) {
    return (
      <div className="space-y-6">
        {/* Header informativo */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
            <Vote className="w-6 h-6" style={{ color: '#0fc064' }} />
            Votación de Temas
          </h2>
          
          {/* Información sobre el sistema de votación */}
          <div className="bg-blue-900 bg-opacity-30 border border-blue-600 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="text-blue-200 text-sm">
                <p className="font-semibold mb-2">Nuevo Sistema de Votación:</p>
                <ul className="space-y-1">
                  <li>• Puedes votar por hasta <strong>4 temas diferentes</strong></li>
                  <li>• Los resultados se mantienen en <strong>secreto</strong> hasta que se anuncie el ganador</li>
                  <li>• Esto mantiene la sorpresa y evita ventajas antes de la jam</li>
                  <li>• Puedes cambiar tus votos mientras la votación esté abierta</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tema ganador si existe */}
          {winnerTheme && (
            <div className="bg-gradient-to-r from-yellow-900 to-orange-900 border border-yellow-600 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h3 className="font-bold text-yellow-200">¡Tema Ganador Revelado!</h3>
              </div>
              <h4 className="text-xl font-bold text-white">{winnerTheme.title}</h4>
              <p className="text-yellow-100 text-sm mt-1">{winnerTheme.description}</p>
            </div>
          )}

          <div className="text-gray-300 text-sm">
            <p>Hay <strong>{themes.length} temas</strong> esperando por tu voto</p>
            {votingClosed && (
              <p className="text-red-300 mt-2">⚠️ La votación está cerrada</p>
            )}
          </div>
        </div>

        {/* Call to action */}
        {renderJoinToVoteButton()}

        {/* Vista previa de temas (sin votación) */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-400" />
            Vista Previa de Temas
          </h3>
          <div className="space-y-3">
            {themes.slice(0, 3).map((theme) => (
              <div key={theme.id} className="border border-gray-600 rounded-lg p-4 opacity-75">
                <h4 className="font-semibold text-gray-300">{theme.title}</h4>
                <p className="text-gray-400 text-sm mt-1">
                  {theme.description.length > 100 
                    ? `${theme.description.substring(0, 100)}...` 
                    : theme.description}
                </p>
                {theme.category && (
                  <span 
                    className="inline-block text-xs px-2 py-1 rounded-full text-white font-medium mt-2"
                    style={{ backgroundColor: theme.categoryColor || '#6B7280' }}
                  >
                    {theme.category}
                  </span>
                )}
              </div>
            ))}
            {themes.length > 3 && (
              <p className="text-gray-400 text-sm text-center">
                Y {themes.length - 3} temas más... ¡Únete para ver todos y votar!
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header de votación */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Vote className="w-6 h-6" style={{ color: '#0fc064' }} />
            Votación de Temas
          </h2>
          
          <div className="flex items-center gap-4">
            {/* Controles de vista */}
            <div className="flex bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grouped')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grouped' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
            
            {votingClosed && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-900 border border-red-600">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-200 font-semibold">Votación cerrada</span>
              </div>
            )}
          </div>
        </div>

        {/* Sistema de votos múltiples - Información */}
        <div className="bg-blue-900 bg-opacity-30 border border-blue-600 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-yellow-400" />
              <div>
                <h3 className="font-semibold text-blue-200">Tus votos: {totalUserVotes}/4</h3>
                <p className="text-blue-300 text-sm">
                  {remainingVotes > 0 
                    ? `Te quedan ${remainingVotes} votos disponibles`
                    : 'Has usado todos tus votos'
                  }
                </p>
              </div>
            </div>
            
            {!votingClosed && (
              <div className="text-right">
                <p className="text-blue-200 text-sm">
                  Puedes votar por hasta 4 temas
                </p>
                <p className="text-blue-300 text-xs">
                  Los resultados se revelarán al final
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tema ganador */}
        {winnerTheme && (
          <div className="bg-gradient-to-r from-yellow-900 to-orange-900 border border-yellow-600 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h3 className="font-bold text-yellow-200">¡Tema Ganador Revelado!</h3>
            </div>
            <h4 className="text-xl font-bold text-white">{winnerTheme.title}</h4>
            <p className="text-yellow-100 text-sm mt-1">{winnerTheme.description}</p>
            
            {/* Mostrar resultados finales si hay ganador */}
            {showResults && votingResults[winnerTheme.id] && (
              <div className="mt-3 pt-3 border-t border-yellow-600">
                <p className="text-yellow-200 text-sm">
                  🏆 Resultado final: {votingResults[winnerTheme.id]} votos
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lista de temas */}
      <div className="space-y-4">
        {viewMode === 'grouped' ? (
          // Vista agrupada por categorías
          Object.entries(groupedThemes).map(([category, categoryThemes]) => (
            <div key={category} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: categoryThemes[0]?.categoryColor || '#6B7280' }}
                />
                {category} ({categoryThemes.length} temas)
              </h3>
              
              <div className="space-y-3">
                {categoryThemes.map((theme) => {
                  const isUserVoted = userVotes.includes(theme.id);
                  const isExpanded = expandedThemes.has(theme.id);
                  const isClickable = !votingClosed && !submittingVote;
                  const voteCount = showResults ? (votingResults[theme.id] || 0) : 0;
                  const percentage = showResults ? getVotePercentage(theme.id) : 0;

                  return (
                    <div
                      key={theme.id}
                      className={`border rounded-lg p-4 transition-all ${
                        isUserVoted 
                          ? 'border-green-500 bg-green-900 bg-opacity-20' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-md font-semibold text-white">{theme.title}</h4>
                            {isUserVoted && (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-600 text-white font-medium">
                                ✓ Votado
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {isExpanded || theme.description.length <= 100 
                              ? theme.description 
                              : `${theme.description.substring(0, 100)}...`
                            }
                          </p>
                          
                          {theme.description.length > 100 && (
                            <button
                              onClick={() => toggleThemeExpansion(theme.id)}
                              className="text-blue-400 hover:text-blue-300 text-xs mt-1 transition-colors"
                            >
                              {isExpanded ? 'Ver menos' : 'Ver más'}
                            </button>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-3">
                          {showResults && (
                            <div className="text-center text-gray-300 text-xs">
                              <div className="font-bold">{voteCount}</div>
                              <div>votos</div>
                            </div>
                          )}
                          
                          {!votingClosed && (
                            <button
                              onClick={() => handleVoteToggle(theme.id)}
                              disabled={!isClickable || (!isUserVoted && remainingVotes <= 0)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                                isUserVoted
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : remainingVotes > 0
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                              }`}
                            >
                              {isUserVoted ? (
                                <>
                                  <Star className="w-3 h-3 fill-current" />
                                  Votado
                                </>
                              ) : remainingVotes > 0 ? (
                                <>
                                  <StarOff className="w-3 h-3" />
                                  Votar
                                </>
                              ) : (
                                <>
                                  <StarOff className="w-3 h-3" />
                                  Sin votos
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Barra de progreso solo si hay resultados */}
                      {showResults && (
                        <div className="w-full bg-gray-700 rounded-full h-1">
                          <div
                            className={`h-1 rounded-full transition-all duration-500 ${
                              isUserVoted ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          // Vista de lista (modo actual)
          themes.map((theme) => {
            const isUserVoted = userVotes.includes(theme.id);
            const isExpanded = expandedThemes.has(theme.id);
            const isClickable = !votingClosed && !submittingVote;
            const voteCount = showResults ? (votingResults[theme.id] || 0) : 0;
            const percentage = showResults ? getVotePercentage(theme.id) : 0;

            return (
              <div
                key={theme.id}
                className={`bg-gray-800 border rounded-lg p-6 transition-all ${
                  isUserVoted 
                    ? 'border-green-500 bg-green-900 bg-opacity-20' 
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{theme.title}</h3>
                      {theme.category && (
                        <span 
                          className="text-xs px-2 py-1 rounded-full text-white font-medium"
                          style={{ backgroundColor: theme.categoryColor || '#6B7280' }}
                        >
                          {theme.category}
                        </span>
                      )}
                      {isUserVoted && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-600 text-white font-medium">
                          ✓ Votado
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-300 leading-relaxed">
                      {isExpanded || theme.description.length <= 150 
                        ? theme.description 
                        : `${theme.description.substring(0, 150)}...`
                      }
                    </p>
                    
                    {theme.description.length > 150 && (
                      <button
                        onClick={() => toggleThemeExpansion(theme.id)}
                        className="text-blue-400 hover:text-blue-300 text-sm mt-2 transition-colors"
                      >
                        {isExpanded ? 'Ver menos' : 'Ver más'}
                      </button>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    {showResults && (
                      <div className="text-center text-gray-300 text-sm">
                        <div className="font-bold">{voteCount}</div>
                        <div className="text-xs">votos</div>
                      </div>
                    )}
                    
                    {!votingClosed && (
                      <button
                        onClick={() => handleVoteToggle(theme.id)}
                        disabled={!isClickable || (!isUserVoted && remainingVotes <= 0)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                          isUserVoted
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : remainingVotes > 0
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        {isUserVoted ? (
                          <>
                            <Star className="w-4 h-4 fill-current" />
                            Votado
                          </>
                        ) : remainingVotes > 0 ? (
                          <>
                            <StarOff className="w-4 h-4" />
                            {submittingVote ? 'Votando...' : 'Votar'}
                          </>
                        ) : (
                          <>
                            <StarOff className="w-4 h-4" />
                            Sin votos disponibles
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Barra de progreso solo si hay resultados */}
                {showResults && (
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isUserVoted ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Información sobre el sistema de votación - Sidebar estilo */}
      {!votingClosed && (
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 border border-indigo-600 rounded-lg p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Info className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-3">
                📋 Guía de Votación
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-indigo-300 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-indigo-100">
                      <strong>Múltiples votos:</strong> Selecciona hasta 4 temas que te inspiren
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-indigo-300 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-indigo-100">
                      <strong>Cambios permitidos:</strong> Puedes agregar o quitar votos en cualquier momento
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-indigo-300 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-indigo-100">
                      <strong>Resultados secretos:</strong> Se revelan cuando se anuncia el ganador
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-indigo-300 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-indigo-100">
                      <strong>Final sorpresa:</strong> El tema se mantiene en misterio hasta el inicio
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-indigo-800 bg-opacity-50 rounded-lg border border-indigo-500">
                <p className="text-indigo-200 text-sm text-center">
                  💡 <strong>Consejo:</strong> Vota por temas que te emocionen y sobre los que tengas ideas para desarrollar
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};