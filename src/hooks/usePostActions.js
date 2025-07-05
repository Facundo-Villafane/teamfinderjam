// src/hooks/usePostActions.js
import {
    deletePostAsAdmin,
    togglePostFeatured,
    togglePostFlagged,
    logAdminAction
  } from '../firebase/admin';
  
  export const usePostActions = (user, loadAllData) => {
    const handleDeletePost = async (postId, posts) => {
      if (window.confirm('¿Eliminar este post?')) {
        try {
          const post = posts.find(p => p.id === postId);
          await deletePostAsAdmin(postId);
          await logAdminAction(user.uid, 'delete_post', { 
            postId, 
            postUsername: post?.username 
          });
          await loadAllData();
          alert('Post deleted successfully!');
        } catch (error) {
          console.error('Error deleting post:', error);
          alert('Error deleting post');
        }
      }
    };
  
    const handleToggleFeatured = async (postId, posts) => {
      try {
        const post = posts.find(p => p.id === postId);
        const newFeaturedState = !post.featured;
        
        await togglePostFeatured(postId, newFeaturedState);
        await logAdminAction(user.uid, 'toggle_post_featured', { 
          postId, 
          postUsername: post?.username,
          newState: newFeaturedState 
        });
        
        await loadAllData();
      } catch (error) {
        console.error('Error toggling post featured:', error);
        alert('Error updating post');
      }
    };
  
    const handleToggleFlagged = async (postId, posts) => {
      try {
        const post = posts.find(p => p.id === postId);
        const newFlaggedState = !post.flagged;
        
        await togglePostFlagged(postId, newFlaggedState);
        await logAdminAction(user.uid, 'toggle_post_flagged', { 
          postId, 
          postUsername: post?.username,
          newState: newFlaggedState 
        });
        
        await loadAllData();
      } catch (error) {
        console.error('Error toggling post flagged:', error);
        alert('Error updating post');
      }
    };
  
    return {
      handleDeletePost,
      handleToggleFeatured,
      handleToggleFlagged
    };
  };