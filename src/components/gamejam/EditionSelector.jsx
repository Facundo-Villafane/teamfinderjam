// src/components/gamejam/EditionSelector.jsx - Actualizado para usar jams reales
import React from 'react';
import { Filter } from 'lucide-react';

export const EditionSelector = ({ currentJam, jams, onJamChange, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center mb-6">
        <div className="bg-orange-900 p-2 rounded-lg text-orange-200">
          Loading jams...
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center mb-6">
      <div className="flex items-center gap-2 bg-orange-900 p-2 rounded-lg">
        <Filter className="w-5 h-5 text-orange-200" />
        <span className="text-orange-200 font-medium">Game Jam:</span>
        <select
          value={currentJam?.id || ''}
          onChange={(e) => onJamChange(e.target.value)}
          className="bg-white text-gray-900 px-3 py-1 rounded"
        >
          {jams.map(jam => (
            <option key={jam.id} value={jam.id}>
              {jam.name} {jam.active ? '(Active)' : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};