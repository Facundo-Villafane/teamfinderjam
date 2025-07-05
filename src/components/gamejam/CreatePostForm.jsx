// src/components/gamejam/CreatePostForm.jsx
import React from 'react';
import { SkillSelector } from './SkillSelector';

export const CreatePostForm = ({
  currentPost,
  isEditing,
  onFieldChange,
  onSkillToggle,
  onToolToggle,
  onSubmit,
  onCancel,
  submitting,
  skillOptions,
  toolOptions,
  timezoneOptions
}) => {
  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-br from-amber-900 to-orange-900 border border-orange-500 rounded-lg p-8 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isEditing ? 'Edit Post' : 'Create New Post'}
      </h2>
      
      <div className="space-y-6">
        <div>
          <label className="block mb-2 font-semibold">
            Write a brief summary of what you're looking for:
          </label>
          <textarea
            value={currentPost.description}
            onChange={(e) => onFieldChange('description', e.target.value)}
            className="w-full h-32 p-3 bg-white text-gray-900 rounded-lg resize-none"
            placeholder="Describe your project and what kind of team members you're looking for..."
            maxLength={2000}
            required
          />
          <p className="text-orange-200 text-sm mt-1">
            {2000 - currentPost.description.length} characters remaining
          </p>
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Username and team members (separate with commas):
          </label>
          <input
            type="text"
            value={currentPost.username}
            onChange={(e) => onFieldChange('username', e.target.value)}
            className="w-full p-3 bg-white text-gray-900 rounded-lg"
            placeholder="yourusername"
            required
          />
          <input
            type="text"
            value={currentPost.teamMembers}
            onChange={(e) => onFieldChange('teamMembers', e.target.value)}
            className="w-full p-3 bg-white text-gray-900 rounded-lg mt-2"
            placeholder="teammate1, teammate2, teammate3 (optional)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkillSelector
            title="What skills do you have?"
            skills={skillOptions}
            selectedSkills={currentPost.canDo}
            onToggleSkill={(skill) => onSkillToggle(skill, 'canDo')}
          />

          <SkillSelector
            title="What skills are you looking for?"
            skills={skillOptions}
            selectedSkills={currentPost.lookingFor}
            onToggleSkill={(skill) => onSkillToggle(skill, 'lookingFor')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-3 font-semibold">What timezone(s) are you working in?</label>
            <select
              value={currentPost.timezone}
              onChange={(e) => onFieldChange('timezone', e.target.value)}
              className="w-full p-3 bg-white text-gray-900 rounded-lg"
            >
              {timezoneOptions.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-3 font-semibold">How many people are in your team/group?</label>
            <select
              value={currentPost.memberCount}
              onChange={(e) => onFieldChange('memberCount', parseInt(e.target.value))}
              className="w-full p-3 bg-white text-gray-900 rounded-lg"
            >
              {[1,2,3,4,5,6,7,8,9,10].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>

        <SkillSelector
          title="What tools do you want to work with?"
          skills={toolOptions}
          selectedSkills={currentPost.tools}
          onToggleSkill={onToolToggle}
          activeColor="bg-purple-600"
        />

        <div className="flex justify-center gap-4">
          {isEditing && (
            <button
              onClick={onCancel}
              className="bg-gray-600 hover:bg-gray-700 px-8 py-3 rounded-lg font-bold text-lg transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
          )}
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="bg-orange-600 hover:bg-orange-700 px-8 py-3 rounded-lg font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting 
              ? 'Saving...' 
              : isEditing 
                ? 'Update Post' 
                : 'Create Post'
            }
          </button>
        </div>
      </div>
    </div>
  );
};