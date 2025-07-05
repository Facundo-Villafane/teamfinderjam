// src/components/admin/ThemeEditor.jsx - Editor de temas
import React, { useState } from 'react';
import { Save, X, Palette } from 'lucide-react';

const categoryOptions = [
  { name: '🧠 Filosóficas / Introspectivas', color: '#8B5CF6' },
  { name: '😭 Emocionales / Poéticas', color: '#EF4444' },
  { name: '🔮 Meta / Deconstructivas', color: '#06B6D4' },
  { name: '🤡 Absurdas / Humorísticas', color: '#F59E0B' },
  { name: '🎯 Mecánicas de Juego', color: '#10B981' },
  { name: '🌟 Narrativas', color: '#F97316' },
  { name: '🎨 Visuales / Estéticas', color: '#EC4899' }
];

export const ThemeEditor = ({ theme, currentJam, onSave, onCancel }) => {
  const [formData, setFormData] = useState(theme || {
    title: '',
    description: '',
    category: '',
    categoryColor: '',
    jamId: currentJam?.id || ''
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }
    
    if (formData.description.length > 300) {
      newErrors.description = 'La descripción no puede exceder 300 caracteres';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSave({
        ...formData,
        jamId: currentJam.id,
        title: formData.title.trim(),
        description: formData.description.trim()
      });
    }
  };

  const handleCategoryChange = (categoryName, categoryColor) => {
    setFormData({
      ...formData,
      category: categoryName,
      categoryColor: categoryColor
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">
          {theme ? 'Editar Tema' : 'Nuevo Tema'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Título del Tema *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className={`w-full p-3 border rounded-lg ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Te convertiste en lo que odiabas"
              maxLength={100}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {formData.title.length}/100 caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Descripción *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className={`w-full p-3 border rounded-lg h-24 resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe la temática y da contexto para inspirar a los desarrolladores..."
              maxLength={300}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {formData.description.length}/300 caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">
              Categoría (Opcional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {categoryOptions.map((category) => (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => handleCategoryChange(category.name, category.color)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    formData.category === category.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Opción personalizada */}
            <div className="mt-3 p-3 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Categoría personalizada</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.category && !categoryOptions.find(c => c.name === formData.category) ? formData.category : ''}
                  onChange={(e) => handleCategoryChange(e.target.value, formData.categoryColor)}
                  className="flex-1 p-2 border border-gray-300 rounded text-sm"
                  placeholder="Nombre de categoría personalizada"
                />
                <input
                  type="color"
                  value={formData.categoryColor || '#6B7280'}
                  onChange={(e) => setFormData({...formData, categoryColor: e.target.value})}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          {formData.title && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Vista previa:</h4>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <h5 className="font-bold text-lg">{formData.title}</h5>
                  {formData.category && (
                    <span 
                      className="text-xs px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: formData.categoryColor || '#6B7280' }}
                    >
                      {formData.category}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm">{formData.description}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {theme ? 'Actualizar' : 'Crear'} Tema
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2"
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