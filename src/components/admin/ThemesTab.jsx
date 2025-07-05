import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Vote, Trophy, Lock, Unlock, BarChart3, Calendar, Users } from 'lucide-react';

export const ThemesTab = ({ 
  currentJam, 
  themes, 
  votingResults,
  onCreateTheme, 
  onEditTheme, 
  onDeleteTheme,
  onToggleVoting,
  onSelectWinner
}) => {
  const [showResults, setShowResults] = useState(false);

  const getTotalVotes = () => {
    return Object.values(votingResults || {}).reduce((total, count) => total + count, 0);
  };

  const getVotePercentage = (themeId) => {
    const total = getTotalVotes();
    if (total === 0) return 0;
    return Math.round(((votingResults[themeId] || 0) / total) * 100);
  };

  const getSortedThemesByVotes = () => {
    return [...themes].sort((a, b) => {
      const votesA = votingResults[a.id] || 0;
      const votesB = votingResults[b.id] || 0;
      return votesB - votesA;
    });
  };

  if (!currentJam) {
    return (
      <div className="text-center text-gray-500 py-12">
        <Vote className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold mb-2">No hay jam activa</h3>
        <p>Selecciona una jam activa para gestionar temas</p>
      </div>
    );
  }

  const totalVotes = getTotalVotes();
  const sortedThemes = getSortedThemesByVotes();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">Gestión de Temas</h3>
          <p className="text-gray-600 flex items-center gap-4 mt-1">
            <span className="flex items-center gap-1">
              <Vote className="w-4 h-4" />
              {themes.length} temas
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {totalVotes} votos totales
            </span>
          </p>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium" 
               style={{ backgroundColor: '#0fc064', color: 'white' }}>
            <Calendar className="w-3 h-3" />
            {currentJam.name}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowResults(!showResults)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] ${
              showResults 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            {showResults ? 'Ver Lista' : 'Ver Resultados'}
          </button>
          
          <button
            onClick={() => onToggleVoting(currentJam.id)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] ${
              currentJam.themeVotingClosed
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                : 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
            }`}
          >
            {currentJam.themeVotingClosed ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {currentJam.themeVotingClosed ? 'Reabrir Votación' : 'Cerrar Votación'}
          </button>
          
          <button
            onClick={onCreateTheme}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Nuevo Tema
          </button>
        </div>
      </div>

      {/* Vista de Resultados */}
      {showResults ? (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h4 className="font-bold text-lg mb-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              Resultados de Votación
            </h4>
            
            {totalVotes === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium">Aún no hay votos registrados</p>
                <p className="text-gray-400 text-sm">Los resultados aparecerán cuando los usuarios empiecen a votar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedThemes.map((theme, index) => {
                  const votes = votingResults[theme.id] || 0;
                  const percentage = getVotePercentage(theme.id);
                  const isWinner = index === 0 && votes > 0;
                  
                  return (
                    <div
                      key={theme.id}
                      className={`border-2 rounded-xl p-4 transition-all duration-200 ${
                        isWinner 
                          ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-lg' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${
                            isWinner ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}>
                            #{index + 1}
                          </div>
                          <h5 className="font-bold text-lg">{theme.title}</h5>
                          {isWinner && <Trophy className="w-5 h-5 text-yellow-500" />}
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-xl font-bold">{votes}</div>
                            <div className="text-sm text-gray-500">votos</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-blue-600">{percentage}%</div>
                          </div>
                          
                          {!currentJam.selectedTheme && isWinner && votes > 0 && (
                            <button
                              onClick={() => onSelectWinner(theme)}
                              className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 transition-colors font-semibold"
                            >
                              Seleccionar Ganador
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            isWinner ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      
                      <p className="text-gray-600">{theme.description}</p>
                      {theme.category && (
                        <div className="mt-2">
                          <span 
                            className="text-xs px-2 py-1 rounded-full text-white font-medium"
                            style={{ backgroundColor: theme.categoryColor || '#6B7280' }}
                          >
                            {theme.category}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Vista de Lista */
        <div className="space-y-4">
          {/* Tema ganador */}
          {currentJam.selectedTheme && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-lg text-yellow-800">Tema Ganador Seleccionado</h4>
              </div>
              <h5 className="font-bold text-xl mb-2">{currentJam.selectedTheme.title}</h5>
              <p className="text-yellow-700">{currentJam.selectedTheme.description}</p>
            </div>
          )}
          
          {/* Lista de temas */}
          {themes.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Vote className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No hay temas configurados</h3>
              <p className="text-gray-500 mb-6">Crea el primer tema para que los participantes puedan votar</p>
              <button
                onClick={onCreateTheme}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto transition-colors font-semibold"
              >
                <Plus className="w-4 h-4" />
                Crear Primer Tema
              </button>
            </div>
          ) : (
            themes.map(theme => (
              <div key={theme.id} className="bg-white rounded-xl p-6 shadow-lg border hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="font-bold text-lg">{theme.title}</h4>
                      {theme.category && (
                        <span 
                          className="text-xs px-3 py-1 rounded-full text-white font-medium"
                          style={{ backgroundColor: theme.categoryColor || '#6B7280' }}
                        >
                          {theme.category}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4 leading-relaxed">{theme.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Creado: {theme.createdAt?.toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Votos: {votingResults[theme.id] || 0}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => onEditTheme(theme)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Editar tema"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteTheme(theme.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Eliminar tema"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};