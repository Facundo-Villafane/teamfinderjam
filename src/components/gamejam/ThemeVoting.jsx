import React, { useState, useEffect } from 'react';
import { 
  Vote, Trophy, Users, Clock, CheckCircle, Lock, AlertCircle, 
  ChevronDown, ChevronUp, BarChart3, Eye, Edit3, Filter 
} from 'lucide-react';
import { 
  getThemesByJam, 
  getVotingResults, 
  getUserVote, 
  saveVote 
} from '../../firebase/themes';

export const ThemeVoting = ({ currentJam, user, onSignIn }) => {
  const [themes, setThemes] = useState([]);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votingResults, setVotingResults] = useState({});
  const [submittingVote, setSubmittingVote] = useState(false);
  const [expandedThemes, setExpandedThemes] = useState(new Set());
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped', 'list', 'results'
  const [showResultsWidget, setShowResultsWidget] = useState(true);

  // Cargar temas y votos desde Firebase
  useEffect(() => {
    if (currentJam?.id) {
      loadThemes();
      loadVotingResults();
      if (user) {
        loadUserVote();
      } else {
        setLoading(false);
      }
    }
  }, [currentJam, user]);

  const loadThemes = async () => {
    try {
      const themesData = await getThemesByJam(currentJam.id);
      setThemes(themesData || []);
    } catch (error) {
      console.error('Error loading themes:', error);
      setThemes([]);
    }
  };

  const loadVotingResults = async () => {
    try {
      const results = await getVotingResults(currentJam.id);
      setVotingResults(results || {});
    } catch (error) {
      console.error('Error loading voting results:', error);
      setVotingResults({});
    }
  };

  const loadUserVote = async () => {
    try {
      const vote = await getUserVote(user.uid, currentJam.id);
      setUserVote(vote?.themeId || null);
    } catch (error) {
      console.error('Error loading user vote:', error);
      setUserVote(null);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (themeId) => {
    if (!user) {
      if (window.confirm('Necesitas iniciar sesión para votar. ¿Quieres hacerlo ahora?')) {
        onSignIn();
      }
      return;
    }

    if (currentJam?.themeVotingClosed) {
      alert('La votación ya está cerrada');
      return;
    }

    if (submittingVote) return;

    try {
      setSubmittingVote(true);
      await saveVote(user.uid, currentJam.id, themeId, userVote);
      setUserVote(themeId);
      await loadVotingResults();
    } catch (error) {
      console.error('Error saving vote:', error);
      alert('Error al guardar el voto. Intenta de nuevo.');
    } finally {
      setSubmittingVote(false);
    }
  };

  const toggleExpanded = (themeId) => {
    const newExpanded = new Set(expandedThemes);
    if (newExpanded.has(themeId)) {
      newExpanded.delete(themeId);
    } else {
      newExpanded.add(themeId);
    }
    setExpandedThemes(newExpanded);
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
      return votes > (max.votes || 0) ? { themeId, votes, theme: themes.find(t => t.id === themeId) } : max;
    }, {});
  };

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

  const getTopThemes = (limit = 5) => {
    return themes
      .map(theme => ({
        ...theme,
        votes: votingResults[theme.id] || 0,
        percentage: getVotePercentage(theme.id)
      }))
      .filter(theme => theme.votes > 0)
      .sort((a, b) => b.votes - a.votes)
      .slice(0, limit);
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
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8 text-center">
        <Vote className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-white mb-2">Aún no hay temas para votar</p>
        <p className="text-gray-400 text-sm">Los organizadores añadirán temas pronto</p>
        {!user && (
          <div className="mt-4 p-3 bg-blue-900 border border-blue-600 rounded-lg">
            <p className="text-blue-200 text-sm mb-2">¿Quieres votar cuando estén disponibles?</p>
            <button
              onClick={onSignIn}
              className="px-4 py-2 rounded-lg font-medium transition-colors text-white text-sm"
              style={{ backgroundColor: '#0fc064' }}
            >
              Iniciar Sesión
            </button>
          </div>
        )}
      </div>
    );
  }

  const totalVotes = getTotalVotes();
  const mostVoted = getMostVotedTheme();
  const votingClosed = currentJam?.themeVotingClosed;
  const winnerTheme = currentJam?.selectedTheme;
  const groupedThemes = getThemesByCategory();
  const topThemes = getTopThemes();

  // Si el usuario ya votó, mostrar vista de resultados simplificada
  if (user && userVote && viewMode !== 'list') {
    return (
      <div className="space-y-6">
        {/* Header con voto actual */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold">Tu Voto Registrado</h2>
            </div>
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Cambiar Voto
            </button>
          </div>
          
          {/* Tema votado */}
          {(() => {
            const votedTheme = themes.find(t => t.id === userVote);
            if (!votedTheme) return null;
            
            const voteCount = votingResults[userVote] || 0;
            const percentage = getVotePercentage(userVote);
            
            return (
              <div className="bg-green-900 bg-opacity-30 border border-green-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg">{votedTheme.title}</h3>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">{voteCount} votos</div>
                    <div className="text-sm text-gray-400">{percentage}%</div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">{votedTheme.description}</p>
                {votedTheme.category && (
                  <span 
                    className="inline-block mt-2 text-xs px-2 py-1 rounded-full text-white"
                    style={{ backgroundColor: votedTheme.categoryColor || '#6B7280' }}
                  >
                    {votedTheme.category}
                  </span>
                )}
              </div>
            );
          })()}
        </div>

        {/* Resultados en tiempo real */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-white">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" style={{ color: '#0fc064' }} />
            Resultados en Tiempo Real
          </h3>
          
          <div className="space-y-3">
            {topThemes.map((theme, index) => (
              <div key={theme.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-700">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' : 'bg-gray-500 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold">{theme.title}</h4>
                    {theme.category && (
                      <span className="text-xs text-gray-400">{theme.category}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{theme.votes} votos</div>
                  <div className="text-sm text-gray-400">{theme.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center text-gray-400 text-sm">
            Total de votos: {totalVotes}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header principal */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Vote className="w-6 h-6" style={{ color: '#0fc064' }} />
            <h2 className="text-2xl font-bold">
              {votingClosed ? 'Tema Seleccionado' : 'Votación de Tema'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Selector de vista */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600"
              >
                <option value="grouped">Por Categorías</option>
                <option value="list">Lista Completa</option>
              </select>
            </div>
            
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

        {/* Tema ganador */}
        {votingClosed && winnerTheme && (
          <div className="bg-gradient-to-r from-yellow-900 to-orange-900 border border-yellow-600 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h3 className="font-bold text-yellow-200">Tema Ganador</h3>
            </div>
            <h4 className="text-xl font-bold text-white">{winnerTheme.title}</h4>
            <p className="text-yellow-100 text-sm mt-1">{winnerTheme.description}</p>
          </div>
        )}

        {/* Widget de resultados en tiempo real */}
        {totalVotes > 0 && mostVoted && (
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-600 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-blue-200">Líder Actual</span>
                </div>
                <h4 className="font-bold text-white">{mostVoted.theme?.title}</h4>
                <p className="text-blue-200 text-sm">{mostVoted.votes} votos</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {Math.round((mostVoted.votes / totalVotes) * 100)}%
                </div>
                <div className="text-blue-200 text-sm">del total</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Call to action para usuarios no logueados */}
      {!user && !votingClosed && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-900 flex items-center justify-center mx-auto mb-4">
            <Vote className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            ¡Únete a la Votación!
          </h3>
          <p className="text-gray-300 mb-4">
            Inicia sesión para votar por tu tema favorito y ayuda a decidir el tema de la jam
          </p>
          <button
            onClick={onSignIn}
            className="px-6 py-3 rounded-lg font-medium transition-colors text-white"
            style={{ backgroundColor: '#0fc064' }}
          >
            Iniciar Sesión para Votar
          </button>
        </div>
      )}

      {/* Lista de temas */}
      {user && (
        <div className="space-y-4">
          {viewMode === 'grouped' ? (
            // Vista agrupada por categorías
            Object.entries(groupedThemes).map(([category, categoryThemes]) => (
              <div key={category} className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-white">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: categoryThemes[0]?.categoryColor || '#6B7280' }}
                  />
                  {category} ({categoryThemes.length})
                </h3>
                
                <div className="space-y-3">
                  {categoryThemes.map((theme) => {
                    const voteCount = votingResults[theme.id] || 0;
                    const percentage = getVotePercentage(theme.id);
                    const isUserVote = userVote === theme.id;
                    const isExpanded = expandedThemes.has(theme.id);
                    const isClickable = !votingClosed && !submittingVote;

                    return (
                      <div
                        key={theme.id}
                        className={`border rounded-lg p-4 transition-all ${
                          isUserVote ? 'border-green-500 bg-green-900 bg-opacity-20' : 'border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{theme.title}</h4>
                              {isUserVote && <CheckCircle className="w-4 h-4 text-green-400" />}
                            </div>
                            
                            {!isExpanded && (
                              <p className="text-gray-400 text-sm line-clamp-1">
                                {theme.description.length > 60 
                                  ? `${theme.description.substring(0, 60)}...` 
                                  : theme.description
                                }
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 ml-4">
                            <div className="text-right">
                              <div className="font-bold">{voteCount}</div>
                              <div className="text-xs text-gray-400">{percentage}%</div>
                            </div>
                            
                            {isClickable && (
                              <button
                                onClick={() => handleVote(theme.id)}
                                disabled={submittingVote}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                  isUserVote 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                              >
                                {isUserVote ? 'Votado' : 'Votar'}
                              </button>
                            )}
                            
                            <button
                              onClick={() => toggleExpanded(theme.id)}
                              className="p-1 hover:bg-gray-700 rounded"
                            >
                              {isExpanded ? 
                                <ChevronUp className="w-4 h-4" /> : 
                                <ChevronDown className="w-4 h-4" />
                              }
                            </button>
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-gray-600">
                            <p className="text-gray-300 text-sm leading-relaxed mb-2">
                              {theme.description}
                            </p>
                            
                            {voteCount > 0 && (
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${percentage}%`,
                                    backgroundColor: '#0fc064'
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            // Vista de lista completa (código similar al original pero más compacto)
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-white">
              <div className="space-y-3">
                {themes.map((theme) => {
                  const voteCount = votingResults[theme.id] || 0;
                  const percentage = getVotePercentage(theme.id);
                  const isUserVote = userVote === theme.id;
                  const isExpanded = expandedThemes.has(theme.id);
                  const isClickable = !votingClosed && !submittingVote;

                  return (
                    <div
                      key={theme.id}
                      className={`border rounded-lg p-4 transition-all ${
                        isUserVote ? 'border-green-500 bg-green-900 bg-opacity-20' : 'border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{theme.title}</h4>
                            {theme.category && (
                              <span 
                                className="text-xs px-2 py-1 rounded-full text-white"
                                style={{ backgroundColor: theme.categoryColor || '#6B7280' }}
                              >
                                {theme.category}
                              </span>
                            )}
                            {isUserVote && <CheckCircle className="w-4 h-4 text-green-400" />}
                          </div>
                          
                          {!isExpanded && (
                            <p className="text-gray-400 text-sm">
                              {theme.description.length > 80 
                                ? `${theme.description.substring(0, 80)}...` 
                                : theme.description
                              }
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 ml-4">
                          <div className="text-right">
                            <div className="font-bold">{voteCount}</div>
                            <div className="text-xs text-gray-400">{percentage}%</div>
                          </div>
                          
                          {isClickable && (
                            <button
                              onClick={() => handleVote(theme.id)}
                              disabled={submittingVote}
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                isUserVote 
                                  ? 'bg-green-600 text-white' 
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {isUserVote ? 'Votado' : 'Votar'}
                            </button>
                          )}
                          
                          <button
                            onClick={() => toggleExpanded(theme.id)}
                            className="p-1 hover:bg-gray-700 rounded"
                          >
                            {isExpanded ? 
                              <ChevronUp className="w-4 h-4" /> : 
                              <ChevronDown className="w-4 h-4" />
                            }
                          </button>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <p className="text-gray-300 text-sm leading-relaxed mb-2">
                            {theme.description}
                          </p>
                          
                          {voteCount > 0 && (
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: '#0fc064'
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};