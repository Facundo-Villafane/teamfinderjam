// src/components/gamejam/SkillSelector.jsx
import React from 'react';

export const SkillSelector = ({ 
  title, 
  skills, 
  selectedSkills, 
  onToggleSkill, 
  activeColor = 'bg-orange-500' 
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
              ? `${activeColor} text-white`
              : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
          }`}
        >
          {skill}
        </button>
      ))}
    </div>
  </div>
);