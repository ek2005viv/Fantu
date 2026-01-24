import { Play } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  onPlay?: (videoUrl: string | undefined, videoUrls: string[] | undefined, transcript: string) => void;
}

export default function MessageBubble({ message, onPlay }: MessageBubbleProps) {
  const hasMedia = message.sender === 'ai' && (message.videoUrl || (message.videoUrls && message.videoUrls.length > 0));

  function handlePlay() {
    if (onPlay && hasMedia) {
      onPlay(message.videoUrl, message.videoUrls, message.transcript || message.text);
    }
  }

  return (
    <div
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className="relative group max-w-[85%]">
        {hasMedia && onPlay && (
          <button
            onClick={handlePlay}
            className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 bg-gray-900 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-700"
            title="Play response"
          >
            <Play className="w-3 h-3" fill="currentColor" />
          </button>
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl ${
            message.sender === 'user'
              ? 'bg-gray-900 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
          }`}
        >
          <p className="text-sm leading-relaxed">{message.text}</p>
          <p className={`text-xs mt-1 ${
            message.sender === 'user' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
}
