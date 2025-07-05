// src/components/admin/JamsTab.jsx
import React from 'react';
import { Plus } from 'lucide-react';
import { JamCard } from './JamCard';

export const JamsTab = ({ jams, onCreateJam, onEditJam, onDeleteJam, onToggleActive }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold">Gestión de Jams</h3>
      <button
        onClick={onCreateJam}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Nueva Jam
      </button>
    </div>

    <div className="space-y-4">
      {jams.map(jam => (
        <JamCard
          key={jam.id}
          jam={jam}
          onEdit={onEditJam}
          onDelete={onDeleteJam}
          onToggleActive={onToggleActive}
        />
      ))}
      {jams.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <p>No hay jams creadas aún</p>
        </div>
      )}
    </div>
  </div>
);