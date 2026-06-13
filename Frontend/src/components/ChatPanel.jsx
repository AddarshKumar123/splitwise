import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import { useSocket } from '../hooks/useSocket';
import CommentItem from './CommentItem';

export default function ChatPanel({ expenseId }) {
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const socketRef = useSocket();
  const bottomRef = useRef(null);

  useEffect(() => {
    api.getComments(expenseId)
      .then((res) => setComments(res.data))
      .catch((err) => setError(err.message));
  }, [expenseId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit('joinExpense', expenseId);

    const onComment = (comment) => {
      setComments((prev) => {
        if (prev.some((c) => c.id === comment.id)) return prev;
        return [...prev, comment];
      });
    };

    socket.on('receiveComment', onComment);

    return () => {
      socket.emit('leaveExpense', expenseId);
      socket.off('receiveComment', onComment);
    };
  }, [expenseId, socketRef]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const text = message.trim();
    setMessage('');
    setError('');

    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit('sendComment', { expenseId, message: text });
      return;
    }

    try {
      const res = await api.createComment(expenseId, text);
      setComments((prev) => [...prev, res.data]);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="font-semibold text-slate-900">Comments</h3>
      </div>

      <div className="max-h-80 space-y-2 overflow-y-auto p-4">
        {comments.length === 0 && (
          <p className="text-sm text-slate-400">No comments yet. Start the conversation.</p>
        )}
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-200 p-4">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a comment..."
          className="input flex-1"
        />
        <button type="submit" className="btn-primary">Send</button>
      </form>

      {error && <p className="px-4 pb-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
