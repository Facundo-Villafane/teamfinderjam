// src/components/gamejam/Navigation.jsx
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
          ? 'bg-orange-600 text-white'
          : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
      }`}
    >
      Browse Teams
    </button>
    {!userPost || !user ? (
      <button
        onClick={onCreatePostClick}
        className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
          currentView === 'create'
            ? 'bg-orange-600 text-white'
            : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
        }`}
      >
        <Plus className="w-5 h-5" />
        Create Post
      </button>
    ) : (
      <div className="text-orange-200 px-6 py-3">
        You already have a post for this edition
      </div>
    )}
  </nav>
);