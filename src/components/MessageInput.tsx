import { Send, Mic, MicOff, Paperclip } from 'lucide-react';

interface MessageInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isListening: boolean;
  onToggleListening: () => void;
  isBusy: boolean;
  speechError: string | null;
  attachments: File[];
  onAttachmentSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (index: number) => void;
  isProcessingAttachments: boolean;
}

export default function MessageInput({
  input,
  onInputChange,
  onSend,
  onKeyDown,
  isListening,
  onToggleListening,
  isBusy,
  speechError,
  attachments,
  onAttachmentSelect,
  onRemoveAttachment,
  isProcessingAttachments
}: MessageInputProps) {
  return (
    <div className="flex-shrink-0 p-6 pt-4">
      <div className="max-w-2xl mx-auto">
        {speechError && (
          <div className="mb-3 px-4 py-2 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-xs text-red-600">{speechError}</p>
          </div>
        )}

        <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-200 shadow-sm p-2">
          <button
            onClick={onToggleListening}
            disabled={isBusy}
            className={`flex-shrink-0 p-4 rounded-xl transition-all ${
              isListening
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <input
            id="attachment-input"
            type="file"
            multiple
            accept="image/*,application/pdf,video/*,audio/*"
            hidden
            onChange={onAttachmentSelect}
          />

          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-xs"
                >
                  <span className="truncate max-w-[120px]">
                    {file.name}
                  </span>

                  {isProcessingAttachments && (
                    <span className="text-gray-400">processing…</span>
                  )}

                  <button
                    onClick={() => onRemoveAttachment(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              isListening
                ? 'Listening...'
                : attachments.length > 0
                ? `Message (${attachments.length} attachment${attachments.length > 1 ? 's' : ''})`
                : 'Or type your message...'
            }
            disabled={isBusy || isListening}
            className="flex-1 px-4 py-3 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-50"
          />

          <button
            onClick={() => document.getElementById('attachment-input')?.click()}
            disabled={isBusy || isProcessingAttachments}
            className="p-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            title="Add attachment"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <button
            onClick={onSend}
            disabled={
              !input.trim() ||
              isBusy ||
              isListening ||
              isProcessingAttachments
            }
            className="flex-shrink-0 p-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-3 text-xs text-gray-400 text-center">
          {isListening
            ? 'Speak now... your message will be sent automatically'
            : 'Press the microphone to speak or type your message'}
        </p>
      </div>
    </div>
  );
}
