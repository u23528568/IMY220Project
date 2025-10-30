import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import ApiService from "../services/ApiService";
import { getRelativeTimeCAT, formatDateTimeToCAT } from "../utils/timezone";
import { getUserAvatar } from "../utils/avatarUtils";

export default function Discussion({ projectId, isProjectOwner }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [projectId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getProjectComments(projectId);
      if (response.success) {
        setComments(response.data || []);
      } else if (Array.isArray(response)) {
        setComments(response);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const response = await ApiService.createComment(projectId, newComment.trim());
      if (response.success || response._id) {
        setNewComment("");
        await fetchComments();
      } else {
        alert(response.error || "Failed to post comment");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Error posting comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyContent.trim() || submitting) return;

    setSubmitting(true);
    try {
      const response = await ApiService.createComment(projectId, replyContent.trim(), parentId);
      if (response.success || response._id) {
        setReplyingTo(null);
        setReplyContent("");
        await fetchComments();
      } else {
        alert(response.error || "Failed to post reply");
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      alert("Error posting reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (e, commentId) => {
    e.preventDefault();
    if (!editContent.trim() || submitting) return;

    setSubmitting(true);
    try {
      const response = await ApiService.updateComment(commentId, editContent.trim());
      if (response.success || response._id) {
        setEditingComment(null);
        setEditContent("");
        await fetchComments();
      } else {
        alert(response.error || "Failed to update comment");
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("Error updating comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment? This will also delete all replies.")) {
      return;
    }

    try {
      const response = await ApiService.deleteComment(commentId);
      if (response.success || response.message) {
        await fetchComments();
      } else {
        alert(response.error || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Error deleting comment");
    }
  };

  const startReply = (comment) => {
    setReplyingTo(comment._id);
    setReplyContent("");
    setEditingComment(null);
  };

  const startEdit = (comment) => {
    setEditingComment(comment._id);
    setEditContent(comment.content);
    setReplyingTo(null);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyContent("");
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent("");
  };

  // Organize comments into threads (top-level and replies)
  const topLevelComments = comments.filter(c => !c.parent).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Newest first for top-level
  const getReplies = (commentId) => {
    return comments
      .filter(c => c.parent?._id === commentId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Oldest first for replies (chronological order)
  };

  const CommentItem = ({ comment, isReply = false }) => {
    const isOwner = comment.user?._id === user?.id;
    const canDelete = isOwner || isProjectOwner;
    const replies = getReplies(comment._id);

    return (
      <div className={`${isReply ? 'ml-12 mt-3' : 'mt-4'}`}>
        <div className="flex space-x-3">
          {/* Avatar */}
          <img
            src={getUserAvatar(comment.user)}
            alt={comment.user?.username}
            className="w-10 h-10 rounded-full flex-shrink-0"
          />

          {/* Comment Content */}
          <div className="flex-1">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <span className="font-semibold text-white">
                    {comment.user?.profile?.name || comment.user?.username}
                  </span>
                  <span className="text-gray-400 text-xs ml-2">
                    {getRelativeTimeCAT(comment.createdAt)}
                  </span>
                  {comment.edited && (
                    <span className="text-gray-500 text-xs ml-2" title={`Edited ${formatDateTimeToCAT(comment.editedAt)}`}>
                      (edited)
                    </span>
                  )}
                </div>
                {canDelete && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="text-gray-400 hover:text-red-400 text-xs"
                    title="Delete comment"
                  >
                    ✕
                  </button>
                )}
              </div>

              {editingComment === comment._id ? (
                <form onSubmit={(e) => handleEditComment(e, comment._id)} className="mt-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:border-orange-500"
                    rows={3}
                    placeholder="Edit your comment..."
                    autoFocus
                    dir="ltr"
                    style={{ unicodeBidi: 'normal', direction: 'ltr' }}
                  />
                  <div className="flex space-x-2 mt-2">
                    <button
                      type="submit"
                      disabled={submitting || !editContent.trim()}
                      className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 px-3 py-1 rounded text-white text-sm"
                    >
                      {submitting ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-white text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="text-gray-200 text-sm whitespace-pre-wrap">{comment.content}</p>
                  
                  {/* Action buttons */}
                  <div className="flex space-x-4 mt-2 text-xs">
                    <button
                      onClick={() => startReply(comment)}
                      className="text-orange-400 hover:text-orange-300"
                    >
                      Reply
                    </button>
                    {isOwner && (
                      <button
                        onClick={() => startEdit(comment)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Reply form */}
            {replyingTo === comment._id && (
              <form onSubmit={(e) => handleSubmitReply(e, comment._id)} className="mt-3">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:border-orange-500"
                  rows={2}
                  placeholder={`Reply to ${comment.user?.username}...`}
                  autoFocus
                  dir="ltr"
                  style={{ unicodeBidi: 'normal', direction: 'ltr' }}
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    type="submit"
                    disabled={submitting || !replyContent.trim()}
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 px-3 py-1 rounded text-white text-sm"
                  >
                    {submitting ? "Posting..." : "Post Reply"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelReply}
                    className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-white text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Render replies */}
            {replies.length > 0 && (
              <div className="mt-3 space-y-3">
                {replies.map(reply => (
                  <CommentItem key={reply._id} comment={reply} isReply={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* New Comment Form */}
      <form onSubmit={handleSubmitComment} className="bg-gray-700 rounded-lg p-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-3 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
          rows={3}
          placeholder="Share your thoughts about this project..."
          dir="ltr"
          style={{ unicodeBidi: 'normal', direction: 'ltr' }}
        />
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded text-white font-medium"
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div>
        {topLevelComments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-lg mb-2">💬</p>
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-300 mb-3">
              {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
            </h3>
            {topLevelComments.map(comment => (
              <CommentItem key={comment._id} comment={comment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
