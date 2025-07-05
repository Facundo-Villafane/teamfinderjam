// src/components/admin/ModerationTab.jsx
import React from 'react';
import { PostCard } from './PostCard';

export const ModerationTab = ({ 
  posts, 
  onToggleFeatured, 
  onToggleFlagged, 
  onDeletePost,
  loading 
}) => (
  <div className="space-y-6">
    <h3 className="text-lg text-white font-semibold">Moderación de Posts</h3>
    
    <div className="space-y-4">
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onToggleFeatured={onToggleFeatured}
          onToggleFlagged={onToggleFlagged}
          onDelete={onDeletePost}
        />
      ))}
      {posts.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-12">
          <p>No hay posts para moderar</p>
        </div>
      )}
    </div>
  </div>
);