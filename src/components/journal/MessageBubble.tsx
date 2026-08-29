import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, Sparkles, User } from 'lucide-react';
import { JournalMessage } from '../../types';
import { Badge } from '../ui/Badge';
import { IconButton } from '../ui/IconButton';

interface MessageBubbleProps {
  message: JournalMessage;
  isStreaming?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isStreaming = false }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div
      className={`flex items-start gap-3.5 sm:gap-4 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      } group w-full`}
    >
      {/* Role Avatar */}
      <div
        className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-serif shadow-xs ${
          isUser
            ? 'bg-stone-900 text-stone-100 border border-stone-800'
            : 'bg-[#2D6A4F] text-white border border-[#245740]'
        }`}
        aria-hidden="true"
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-amber-200" />}
      </div>

      {/* Content Bubble */}
      <div
        className={`max-w-[85%] sm:max-w-[80%] space-y-1.5 ${
          isUser ? 'items-end text-right' : 'items-start text-left'
        }`}
      >
        {/* Header line */}
        <div className={`flex items-center gap-2 text-xs text-stone-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="font-medium text-stone-600">
            {isUser ? 'You' : 'Gemini 3.6 Flash'}
          </span>
          {formattedTime && <span>• {formattedTime}</span>}
          {!isUser && (
            <Badge variant="sage" size="sm">
              Reflection
            </Badge>
          )}
        </div>

        {/* Bubble Box */}
        <div
          className={`rounded-2xl p-4 sm:p-5 text-sm font-sans leading-relaxed transition-all ${
            isUser
              ? 'bg-[#FAF8F5] text-stone-900 border border-[#D6D1C7]/70 shadow-2xs'
              : 'bg-white text-stone-900 border border-[#D6D1C7]/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap font-sans text-stone-800">{message.content}</p>
          ) : (
            <div className="space-y-3 prose-stone text-stone-800 break-words">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1.5">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1.5">{children}</ol>,
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-stone-950">{children}</strong>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-[#2D6A4F] pl-3 py-1 my-2 italic text-stone-600 bg-[#EBF3EE]/40 rounded-r-md">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="font-mono text-xs bg-stone-100 px-1.5 py-0.5 rounded text-stone-800 border border-stone-200">
                      {children}
                    </code>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Action Bar for AI response */}
          {!isUser && !isStreaming && (
            <div className="mt-3 pt-2.5 border-t border-[#D6D1C7]/40 flex items-center justify-between text-xs text-stone-400">
              <span className="font-mono text-[10px] text-stone-400">gemini-3.6-flash</span>
              <IconButton
                label="Copy Response"
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                className="text-stone-400 hover:text-stone-700 h-6 px-1.5"
              >
                {copied ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#2D6A4F]">
                    <Check className="w-3 h-3" /> Copied
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px]">
                    <Copy className="w-3 h-3" /> Copy
                  </span>
                )}
              </IconButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
