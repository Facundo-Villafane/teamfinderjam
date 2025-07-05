// src/components/admin/ThemesTab.jsx - Administración de temas
import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Vote, Trophy, Lock, Unlock, BarChart3 } from 'lucide-react';

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
        <p>Selecciona una jam activa para gestionar temas</p>
      </div>
    );
  }

  const totalVotes = getTotalVotes();
  const sortedThemes = getSortedThemesByVotes();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Temas para: {currentJam.name}</h3>
          <p className="text-gray-600 text-sm">
            {themes.length} temas • {totalVotes} votos totales
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowResults(!showResults)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              showResults 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            {showResults ? 'Ver Lista' : 'Ver Resultados'}
          </button>
          
          <button
            onClick={() => onToggleVoting(currentJam.id)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              currentJam.themeVotingClosed
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {currentJam.themeVotingClosed ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {currentJam.themeVotingClosed ? 'Reabrir Votación' : 'Cerrar Votación'}
          </button>
          
          <button
            onClick={onCreateTheme}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Tema
          </button>
        </div>
      </div>

      {/* Vista de Resultados */}
      {showResults ? (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-6 shadow">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Resultados de Votación
            </h4>
            
            {totalVotes === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aún no hay votos registrados
              </p>
            ) : (
              <div className="space-y-4">
                {sortedThemes.map((theme, index) => {
                  const votes = votingResults[theme.id] || 0;
                  const percentage = getVotePercentage(theme.id);
                  const isWinner = index === 0 && votes > 0;
                  
                  return (
                    <div
                      key={theme.id}
                      className={`border rounded-lg p-4 ${
                        isWinner ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">#{index + 1}</span>
                          <h5 className="font-semibold">{theme.title}</h5>
                          {isWinner && <Trophy className="w-4 h-4 text-yellow-500" />}
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold">{votes} votos</span>
                          <span className="text-sm text-gray-600">{percentage}%</span>
                          
                          {!currentJam.selectedTheme && isWinner && votes > 0 && (
                            <button
                              onClick={() => onSelectWinner(theme)}
                              className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                            >
                              Seleccionar Ganador
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full ${
                            isWinner ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      
                      <p className="text-gray-600 text-sm">{theme.description}</p>
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
          {currentJam.selectedTheme && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800">Tema Ganador Seleccionado</h4>
              </div>
              <h5 className="font-bold text-lg">{currentJam.selectedTheme.title}</h5>
              <p className="text-yellow-700 text-sm">{currentJam.selectedTheme.description}</p>
            </div>
          )}
          
          {themes.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <Vote className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">No hay temas configurados</p>
              <p className="text-sm">Crea el primer tema para que los participantes puedan votar</p>
            </div>
          ) : (
            themes.map(theme => (
              <div key={theme.id} className="bg-white rounded-lg p-6 shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-lg">{theme.title}</h4>
                      {theme.category && (
                        <span 
                          className="text-xs px-2 py-1 rounded-full text-white"
                          style={{ backgroundColor: theme.categoryColor || '#6B7280' }}
                        >
                          {theme.category}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{theme.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Creado: {theme.createdAt?.toLocaleDateString()}</span>
                      <span>Votos: {votingResults[theme.id] || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditTheme(theme)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                      title="Editar tema"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteTheme(theme.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded"
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