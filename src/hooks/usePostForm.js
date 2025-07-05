// src/hooks/usePostForm.js
import { useState } from 'react';

export const usePostForm = () => {
  const [editingPost, setEditingPost] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [newPost, setNewPost] = useState({
    username: '',
    teamMembers: '',
    lookingFor: [],
    canDo: [],
    description: '',
    timezone: 'UTC-3: Halifax, São Paulo, Buenos Aires',
    memberCount: 1,
    tools: []
  });

  const resetForm = () => {
    setNewPost({
      username: '',
      teamMembers: '',
      lookingFor: [],
      canDo: [],
      description: '',
      timezone: 'UTC-3: Halifax, São Paulo, Buenos Aires',
      memberCount: 1,
      tools: []
    });
  };

  const handleFieldChange = (field, value) => {
    const post = editingPost || newPost;
    const setPost = editingPost ? setEditingPost : setNewPost;
    setPost(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillToggle = (skill, field) => {
    const post = editingPost || newPost;
    const setPost = editingPost ? setEditingPost : setNewPost;
    
    setPost(prev => ({
      ...prev,
      [field]: prev[field].includes(skill) 
        ? prev[field].filter(s => s !== skill)
        : [...prev[field], skill]
    }));
  };

  const handleToolToggle = (tool) => {
    const post = editingPost || newPost;
    const setPost = editingPost ? setEditingPost : setNewPost;
    
    setPost(prev => ({
      ...prev,
      tools: prev.tools.includes(tool) 
        ? prev.tools.filter(t => t !== tool)
        : [...prev.tools, tool]
    }));
  };

  const handleEditPost = (post) => {
    setEditingPost({
      ...post,
      teamMembers: post.teamMembers.join(', ')
    });
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
  };

  return {
    newPost,
    editingPost,
    submitting,
    setSubmitting,
    resetForm,
    handleFieldChange,
    handleSkillToggle,
    handleToolToggle,
    handleEditPost,
    handleCancelEdit
  };
};