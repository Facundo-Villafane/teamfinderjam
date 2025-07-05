// src/components/gamejam/SkillSelector.jsx - Con nuevos colores
import React from 'react';

export const SkillSelector = ({ 
  title, 
  skills, 
  selectedSkills, 
  onToggleSkill, 
  activeColor = '#0fc064' 
}) => (
  <div>
    <label className="block mb-3 font-semibold">{title}</label>
    <div className="flex flex-wrap gap-2">
      {skills.map(skill => (
        <button
          key={skill}
          type="button"
          onClick={() => onToggleSkill(skill)}
          className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedSkills.includes(skill)
              ? 'text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          style={selectedSkills.includes(skill) ? { backgroundColor: activeColor } : {}}
        >
          {skill}
        </button>
      ))}
    </div>
  </div>
);