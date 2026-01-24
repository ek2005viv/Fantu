import { useRef, useEffect } from 'react';
import { Message } from '../types';
import MessageBubble from './MessageBubble';

interface TranscriptViewProps {
  messages: Message[];
  onPlayMessage?: (videoUrl: string | undefined, videoUrls: string[] | undefined, transcript: string) => void;
}

export default function TranscriptView({ messages, onPlayMessage }: TranscriptViewProps) {
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 min-h-0 px-6">
      <div className="max-w-2xl mx-auto h-full flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Transcript</span>
          <span className="text-xs text-gray-400">{messages.length} messages</span>
        </div>

        <div
          ref={transcriptRef}
          className="flex-1 overflow-y-auto bg-white rounded-xl border border-gray-200 shadow-sm"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full p-6">
              <p className="text-sm text-gray-400 text-center">
                Start speaking or type a message to begin the conversation
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {messages.map((msg, index) => (
                <MessageBubble
                  key={index}
                  message={msg}
                  onPlay={onPlayMessage}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
