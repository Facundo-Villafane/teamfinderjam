// src/components/admin/JamEditor.jsx
import React, { useState } from 'react';
import { Save, X } from 'lucide-react';

export const JamEditor = ({ jam, onSave, onCancel }) => {
  const [formData, setFormData] = useState(jam || {
    name: '',
    description: '',
    bannerUrl: '',
    jamLink: '',
    startDate: '',
    endDate: '',
    theme: ''
  });

  const handleSubmit = () => {
    if (formData.name && formData.description) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">
          {jam ? 'Editar Jam' : 'Nueva Jam'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de la Jam</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-2 border rounded-lg"
              placeholder="GMTK Game Jam 2025"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-2 border rounded-lg h-20"
              placeholder="Descripción de la jam..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tema</label>
            <input
              type="text"
              value={formData.theme}
              onChange={(e) => setFormData({...formData, theme: e.target.value})}
              className="w-full p-2 border rounded-lg"
              placeholder="Role Reversal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL del Banner</label>
            <input
              type="url"
              value={formData.bannerUrl}
              onChange={(e) => setFormData({...formData, bannerUrl: e.target.value})}
              className="w-full p-2 border rounded-lg"
              placeholder="https://example.com/banner.jpg"
            />
            {formData.bannerUrl && (
              <img 
                src={formData.bannerUrl} 
                alt="Preview" 
                className="mt-2 h-20 object-cover rounded"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Link a la Jam</label>
            <input
              type="url"
              value={formData.jamLink}
              onChange={(e) => setFormData({...formData, jamLink: e.target.value})}
              className="w-full p-2 border rounded-lg"
              placeholder="https://itch.io/jam/example"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha Inicio</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha Fin</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};