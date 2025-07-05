// src/components/gamejam/AppHeader.jsx
import React from 'react';
import { User, LogOut, LogIn, Settings } from 'lucide-react';

export const AppHeader = ({ user, isAdmin, onSignIn, onSignOut, onOpenAdmin }) => (
  <header className="flex justify-between items-center mb-8">
    <div className="text-center flex-1">
      <h1 className="text-4xl font-bold text-white mb-2">Game Jam Team Finder</h1>
      <p className="text-orange-200">Find your perfect team for the game jam!</p>
    </div>
    {user && (
      <div className="flex items-center gap-4 text-white">
        <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
          <User className="w-6 h-6" />
        </div>
        <span className="hidden md:inline">{user.displayName}</span>
        {isAdmin && (
          <button
            onClick={onOpenAdmin}
            className="p-2 hover:bg-orange-800 rounded-lg transition-colors"
            title="Admin Dashboard"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={onSignOut}
          className="p-2 hover:bg-orange-800 rounded-lg transition-colors"
          title="Sign out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    )}
    {!user && (
      <button
        onClick={onSignIn}
        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg font-medium transition-colors text-white"
      >
        <LogIn className="w-5 h-5" />
        Sign In
      </button>
    )}
  </header>
);