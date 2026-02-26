import { useState } from 'react';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Send, CornerDownRight } from 'lucide-react';

interface CommentSectionProps {
  articleId: string;
  onAuthClick?: () => void;
}

export function CommentSection({ articleId, onAuthClick }: CommentSectionProps) {
  const { isAuthenticated, author } = useAuth();
  const { comments, isLoading, addComment } = useComments({ articleId, status: 'approved' });
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const { error } = await addComment(newComment.trim());
    setIsSubmitting(false);

    if (!error) {
      setNewComment('');
    }
  };

  const handleReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    const { error } = await addComment(replyContent.trim(), parentId);
    setIsSubmitting(false);

    if (!error) {
      setReplyContent('');
      setReplyTo(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Comments</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-4 w-full bg-slate-200 rounded" />
                <div className="h-4 w-2/3 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-slate-500" />
        <h3 className="text-xl font-bold text-slate-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={author?.avatar_url || undefined} />
              <AvatarFallback>{author?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <div className="flex justify-end mt-3">
                <Button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    'Posting...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Post Comment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-slate-50 rounded-lg p-6 text-center mb-8">
          <p className="text-slate-600 mb-4">
            Sign in to join the conversation and share your thoughts.
          </p>
          <Button onClick={onAuthClick}>Sign In to Comment</Button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-center text-slate-500 py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="space-y-4">
              {/* Main Comment */}
              <div className="flex gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={comment.author_profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {comment.author_name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900">
                      {comment.author_name}
                    </span>
                    <span className="text-sm text-slate-500">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap">{comment.content}</p>

                  {/* Reply Button */}
                  {isAuthenticated && (
                    <button
                      onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                      className="text-sm text-blue-600 hover:underline mt-2"
                    >
                      Reply
                    </button>
                  )}

                  {/* Reply Form */}
                  {replyTo === comment.id && (
                    <form
                      onSubmit={(e) => handleReply(e, comment.id)}
                      className="mt-4"
                    >
                      <div className="flex gap-3">
                        <CornerDownRight className="h-5 w-5 text-slate-400 mt-2" />
                        <div className="flex-1">
                          <Textarea
                            placeholder="Write a reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="min-h-[80px] resize-none"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setReplyTo(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              size="sm"
                              disabled={!replyContent.trim() || isSubmitting}
                            >
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-14 space-y-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-4">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={reply.author_profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          {reply.author_name?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-900 text-sm">
                            {reply.author_name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(reply.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-slate-700 text-sm whitespace-pre-wrap">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
