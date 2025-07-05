import React, { useState } from 'react';
import { Save, X, Palette, Brain, Heart, Zap, Smile, Target, Star, Paintbrush } from 'lucide-react';

const categoryOptions = [
  { name: 'Filosóficas / Introspectivas', color: '#8B5CF6', icon: Brain },
  { name: 'Emocionales / Poéticas', color: '#EF4444', icon: Heart },
  { name: 'Meta / Deconstructivas', color: '#06B6D4', icon: Zap },
  { name: 'Absurdas / Humorísticas', color: '#F59E0B', icon: Smile },
  { name: 'Mecánicas de Juego', color: '#10B981', icon: Target },
  { name: 'Narrativas', color: '#F97316', icon: Star },
  { name: 'Visuales / Estéticas', color: '#EC4899', icon: Paintbrush }
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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {theme ? 'Editar Tema' : 'Crear Nuevo Tema'}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Título del Tema *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className={`w-full p-3 border-2 rounded-lg transition-colors ${
                errors.title 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:border-blue-500'
              } focus:outline-none`}
              placeholder="Ej: Te convertiste en lo que odiabas"
              maxLength={100}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <X className="w-3 h-3" />
                {errors.title}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {formData.title.length}/100 caracteres
            </p>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className={`w-full p-3 border-2 rounded-lg h-28 resize-none transition-colors ${
                errors.description 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:border-blue-500'
              } focus:outline-none`}
              placeholder="Describe la temática y da contexto para inspirar a los desarrolladores..."
              maxLength={300}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <X className="w-3 h-3" />
                {errors.description}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {formData.description.length}/300 caracteres
            </p>
          </div>

          {/* Categorías */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Categoría (Opcional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categoryOptions.map((category) => {
                const IconComponent = category.icon;
                const isSelected = formData.category === category.name;
                
                return (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() => handleCategoryChange(category.name, category.color)}
                    className={`p-4 rounded-lg border-2 text-left transition-all duration-200 hover:scale-[1.02] ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: category.color }}
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {category.name}
                        </span>
                        {isSelected && (
                          <div className="flex items-center gap-1 mt-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-xs text-blue-600 font-medium">Seleccionada</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Categoría personalizada */}
            <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">Categoría Personalizada</span>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={formData.category && !categoryOptions.find(c => c.name === formData.category) ? formData.category : ''}
                  onChange={(e) => handleCategoryChange(e.target.value, formData.categoryColor)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Nombre de categoría personalizada"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Color:</span>
                  <input
                    type="color"
                    value={formData.categoryColor || '#6B7280'}
                    onChange={(e) => setFormData({...formData, categoryColor: e.target.value})}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vista previa */}
          {formData.title && (
            <div className="border-t pt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Vista Previa:</h4>
              <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-3 mb-3">
                  <h5 className="font-bold text-lg text-gray-900">{formData.title}</h5>
                  {formData.category && (
                    <span 
                      className="text-xs px-3 py-1 rounded-full text-white font-medium"
                      style={{ backgroundColor: formData.categoryColor || '#6B7280' }}
                    >
                      {formData.category}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{formData.description}</p>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-6 border-t">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-semibold transition-colors"
            >
              <Save className="w-4 h-4" />
              {theme ? 'Actualizar Tema' : 'Crear Tema'}
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 font-semibold transition-colors"
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