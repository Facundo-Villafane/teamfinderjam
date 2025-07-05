import React from 'react';
import { Edit3, Trash2, ExternalLink, LinkIcon } from 'lucide-react';

export const JamCard = ({ jam, onEdit, onDelete, onToggleActive }) => (
  <div className="bg-white rounded-lg p-6 shadow">
    <div className="flex items-start justify-between">
      <div className="flex gap-4 flex-1">
        <img 
          src={jam.bannerUrl || 'https://via.placeholder.com/160x80/orange/white?text=No+Banner'} 
          alt={jam.name} 
          className="h-20 w-40 object-cover rounded" 
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-lg">{jam.name}</h4>
            {jam.active && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                ACTIVA
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-2">{jam.description}</p>
          <div className="text-sm text-gray-500 space-y-1">
            <p><strong>Tema:</strong> {jam.theme || 'No definido'}</p>
            <p><strong>Fechas:</strong> {jam.startDate} → {jam.endDate}</p>
            {jam.jamLink && (
              <a href={jam.jamLink} target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 hover:underline flex items-center gap-1">
                <LinkIcon className="w-3 h-3" />
                {jam.jamLink}
              </a>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onToggleActive(jam.id)}
          className={`px-3 py-1 rounded text-sm font-medium ${
            jam.active 
              ? 'bg-red-100 text-red-800 hover:bg-red-200'
              : 'bg-green-100 text-green-800 hover:bg-green-200'
          }`}
        >
          {jam.active ? 'Desactivar' : 'Activar'}
        </button>
        <button
          onClick={() => onEdit(jam)}
          className="p-2 text-blue-600 hover:bg-blue-100 rounded"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(jam.id)}
          className="p-2 text-red-600 hover:bg-red-100 rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);