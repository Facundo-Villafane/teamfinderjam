// src/components/gamejam/Navigation.jsx - Versión en Español
import React from 'react';
import { Plus } from 'lucide-react';

export const Navigation = ({ 
  currentView, 
  onViewChange, 
  userPost, 
  user, 
  onCreatePostClick 
}) => (
  <nav className="flex justify-center gap-4 mb-8">
    <button
      onClick={() => onViewChange('browse')}
      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
        currentView === 'browse'
          ? 'text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
      style={currentView === 'browse' ? { backgroundColor: '#0fc064' } : {}}
    >
      Explorar Equipos
    </button>
    {!userPost || !user ? (
      <button
        onClick={onCreatePostClick}
        className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
          currentView === 'create'
            ? 'text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
        style={currentView === 'create' ? { backgroundColor: '#0fc064' } : {}}
      >
        <Plus className="w-5 h-5" />
        Crear Publicación
      </button>
    ) : (
      <div className="text-gray-400 px-6 py-3">
        Ya tienes una publicación para esta edición
      </div>
    )}
  </nav>
);