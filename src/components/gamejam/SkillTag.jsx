// src/components/gamejam/SkillTag.jsx
import React from 'react';

export const SkillTag = ({ skill, active = false }) => (
  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
    active 
      ? 'bg-orange-500 text-white' 
      : 'bg-orange-100 text-orange-800'
  }`}>
    {skill}
  </span>
);