import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Trash2, MessageCircle, AlertCircle, Loader2, Calendar, MapPin, LogIn, User } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

function formatCommentDate(dateString) {
  if (!dateString) return 'Recently';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHour / 24);

    if (diffSec < 45) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  } catch (_) {
    return 'Recently';
  }
}

export default function EventCommentsModal({ isOpen, onClose, event, currentUser, onCommentCountUpdate }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const commentsEndRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !event) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchComments = async () => {
      try {
        const res = await api.get(`/events/${event.id}/comments`);
        if (isMounted && res.data.success) {
          setComments(res.data.comments || []);
          if (onCommentCountUpdate) {
            onCommentCountUpdate((res.data.comments || []).length, event.id);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Could not load comments from API:', err.message);
          // Fallback to empty or initial comments if provided
          setComments([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchComments();

    return () => {
      isMounted = false;
    };
  }, [isOpen, event?.id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    const content = newComment.trim();
    if (!content || !event || submitting) return;

    if (!currentUser) {
      setError('Please log in to participate in discussion.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.post(`/events/${event.id}/comments`, { content });
      if (res.data.success && res.data.comment) {
        const updated = [...comments, res.data.comment];
        setComments(updated);
        setNewComment('');
        if (onCommentCountUpdate) {
          onCommentCountUpdate(res.data.comments_count || updated.length, event.id);
        }
        scrollToBottom();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!commentId || deletingId) return;

    setDeletingId(commentId);
    try {
      const res = await api.delete(`/events/comments/${commentId}`);
      if (res.data.success) {
        const updated = comments.filter(c => c.id !== commentId);
        setComments(updated);
        if (onCommentCountUpdate) {
          onCommentCountUpdate(updated.length, event.id);
        }
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full flex flex-col max-h-[90vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-9 h-9 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-sky-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                  Comments & Queries
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-extrabold">
                  {comments.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {event.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Event Quick Info Banner */}
        <div className="px-5 py-2.5 bg-sky-50/60 border-b border-sky-100 flex items-center gap-4 text-[11px] text-slate-600 font-medium">
          <div className="flex items-center gap-1.5 truncate">
            <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="truncate">{event.start_date}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="flex-1 text-[11px] font-medium">{error}</span>
            <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 text-xs">✕</button>
          </div>
        )}

        {/* Comment List Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="py-16 text-center space-y-2">
              <Loader2 className="w-6 h-6 text-sky-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="py-14 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-slate-700">No comments yet</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Be the first to share questions, arrangements, or thoughts about this assembly!
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              const isOwner = currentUser && (currentUser.id === comment.user_id || currentUser.role === 'admin');
              return (
                <div 
                  key={comment.id}
                  className="flex gap-3 group/item p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
                >
                  <img
                    src={comment.author_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"}
                    alt={comment.author_name}
                    className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-sky-100"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {comment.author_name || 'Union Member'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatCommentDate(comment.created_at)}
                        </span>
                      </div>
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deletingId === comment.id}
                          className="opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity p-1 rounded-lg hover:bg-rose-50"
                          title="Delete comment"
                        >
                          {deletingId === comment.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed mt-1 break-words whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Footer / Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          {currentUser ? (
            <form onSubmit={handlePostComment} className="flex items-center gap-2">
              <img
                src={currentUser.profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"}
                alt="Your avatar"
                className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200 hidden sm:block"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80";
                }}
              />
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Write a comment or query..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={submitting}
                  className="w-full bg-white border border-slate-300 rounded-2xl pl-4 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 shadow-sm"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="absolute right-1.5 top-1.5 p-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-200 disabled:text-slate-400 text-white transition-all shadow-sm"
                  title="Send Comment"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <User className="w-4 h-4 text-slate-400" />
                <span>Log in to comment and join discussions.</span>
              </div>
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
