// src/components/gamejam/ToolSelector.jsx - Nuevo componente con iconos
import React from 'react';
import { 
  SiUnity, 
  SiUnrealengine, 
  SiGodotengine,
  SiBlender,
  SiAdobe,
  SiAudacity
} from 'react-icons/si';
import { 
  FaGamepad, 
  FaTools, 
  FaImage, 
  FaMusic, 
  FaCode, 
  FaCube 
} from 'react-icons/fa';

// Mapeo de herramientas a iconos
const toolIcons = {
  'Unity': SiUnity,
  'Unreal Engine': SiUnrealengine,
  'Godot': SiGodotengine,
  'GameMaker': FaGamepad,
  'Construct': FaTools,
  'Phaser': FaCode,
  'Blender': SiBlender,
  'Maya': FaCube,
  'Photoshop': SiAdobe,
  'Aseprite': FaImage,
  'FL Studio': FaMusic,
  'Audacity': SiAudacity
};

export const ToolSelector = ({ 
  title, 
  tools, 
  selectedTools, 
  onToggleTool, 
  activeColor = 'bg-purple-600' 
}) => (
  <div>
    <label className="block mb-3 font-semibold">{title}</label>
    <div className="flex flex-wrap gap-2">
      {tools.map(tool => {
        const IconComponent = toolIcons[tool] || FaTools;
        
        return (
          <button
            key={tool}
            type="button"
            onClick={() => onToggleTool(tool)}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
              selectedTools.includes(tool)
                ? `${activeColor} text-white`
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <IconComponent className="w-3 h-3" />
            {tool}
          </button>
        );
      })}
    </div>
  </div>
);