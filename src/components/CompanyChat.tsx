/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { Upload, Mail, X } from 'lucide-react';

import {
  Message,
  ConversationSettings,
  DEFAULT_CONVERSATION_SETTINGS,
  CompanyDocument
} from '../types';
import { subscribeToMessages, addMessage, subscribeToCompany, updateCompanySettings, addCompanyMember, addCompanyDocument, subscribeToCompanyDocuments } from '../services/firestore';
import { generateAIResponse } from '../services/mockAI';
import { generateAvatarVideo, GooeyVideoResponse } from '../services/gooey';
import { speakText, stopSpeaking } from '../services/tts';
import { queryDocuments, upsertDocuments } from '../services/pinecone';
import AvatarSettingsPanel from './AvatarSettingsPanel';
import VideoPlayer, { VideoState } from './VideoPlayer';
import ChatHeader from './ChatHeader';
import TranscriptView from './TranscriptView';
import MessageInput from './MessageInput';

interface CompanyChatProps {
  companyId: string;
}

export default function CompanyChat({ companyId }: CompanyChatProps) {
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentContext, setAttachmentContext] = useState<string>('');
  const [isProcessingAttachments, setIsProcessingAttachments] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [videoState, setVideoState] = useState<VideoState>('idle');
  const [currentCaption, setCurrentCaption] = useState<string>('');
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [settings, setSettings] = useState<ConversationSettings>(DEFAULT_CONVERSATION_SETTINGS);
  const [gooeyResponse, setGooeyResponse] = useState<GooeyVideoResponse | null>(null);
  const [companyDocuments, setCompanyDocuments] = useState<CompanyDocument[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [transcriptHeight, setTranscriptHeight] = useState(40);

  useEffect(() => {
    stopSpeaking();
    setMessages([]);
    setInput('');
    setVideoState('idle');
    setCurrentCaption('');
    setCurrentVideoUrl(null);
    setGooeyResponse(null);
    setSettings(DEFAULT_CONVERSATION_SETTINGS);

    const conversationId = `company_${companyId}`;
    const unsubscribeMessages = subscribeToMessages(conversationId, setMessages);

    const unsubscribeCompany = subscribeToCompany(companyId, (company) => {
      if (company) {
        setSettings(company.settings || DEFAULT_CONVERSATION_SETTINGS);
      }
    });

    const unsubscribeDocs = subscribeToCompanyDocuments(companyId, setCompanyDocuments);

    return () => {
      unsubscribeMessages();
      unsubscribeCompany();
      unsubscribeDocs();
      stopSpeaking();
    };
  }, [companyId]);

  const handleSendWithText = useCallback(async (text: string) => {
    if (!text.trim() || videoState === 'thinking' || videoState === 'speaking') return;

    const userMessage = text.trim();
    const conversationId = `company_${companyId}`;

    setInput('');
    setVideoState('thinking');
    setCurrentVideoUrl(null);
    setGooeyResponse(null);

    try {
      await addMessage({
        conversationId,
        sender: 'user',
        text: userMessage,
        createdAt: new Date()
      });

      let documentContext = '';
      try {
        const relevantDocs = await queryDocuments(companyId, userMessage, 3);
        if (relevantDocs.length > 0) {
          documentContext = `\n\nRelevant Company Documents (from vector search):\n${relevantDocs.map((doc, i) =>
            `[Document ${i + 1} - Relevance: ${(doc.score * 100).toFixed(1)}%]\n${doc.text}`
          ).join('\n\n')}`;
        }
      } catch (error) {
        console.error('Pinecone query error:', error);
        if (companyDocuments.length > 0) {
          documentContext = `\n\nCompany Documents:\n${companyDocuments.map(doc =>
            `${doc.title}:\n${doc.content}`
          ).join('\n\n')}`;
        }
      }

      const enhancedUserMessage = attachmentContext
        ? `${documentContext}\n\nAttached content context:\n${attachmentContext}\n\nUser query:\n${userMessage}`
        : `${documentContext}\n\nUser query:\n${userMessage}`;

      const responseText = await generateAIResponse(
        enhancedUserMessage,
        settings,
        messages
      );

      setCurrentCaption(responseText);

      function prepareTextForVideo(text: string): string {
        const cleaned = text.replace(/\s+/g, ' ').replace(/\n/g, ' ').trim();
        if (!/[.!?।]$/.test(cleaned)) {
          return cleaned + '।';
        }
        return cleaned;
      }

      const safeText = prepareTextForVideo(responseText);

      const gooeyResponseResult = await generateAvatarVideo({
        text: safeText,
        language: settings.language,
        avatarUrl: settings.avatarMediaUrl,
        gender: settings.avatarVoiceGender
      });

      setGooeyResponse(gooeyResponseResult);

      await addMessage({
        conversationId,
        sender: 'ai',
        text: responseText,
        transcript: responseText,
        videoUrl: gooeyResponseResult.videoUrl,
        videoUrls: gooeyResponseResult.videoUrls,
        createdAt: new Date()
      });

      setAttachments([]);
      setAttachmentContext('');

      if (gooeyResponseResult.success && (gooeyResponseResult.videoUrls?.length || gooeyResponseResult.videoUrl)) {
        if (gooeyResponseResult.videoUrl) setCurrentVideoUrl(gooeyResponseResult.videoUrl);
        setVideoState('speaking');
      } else {
        setVideoState('speaking');
        await speakText(responseText, settings.tone, undefined, () => {
          setVideoState('idle');
          setCurrentCaption('');
          setCurrentVideoUrl(null);
          setGooeyResponse(null);
        });
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      setVideoState('idle');
      setCurrentCaption('');
      setCurrentVideoUrl(null);
      setGooeyResponse(null);
    }
  }, [videoState, settings, attachmentContext, companyDocuments, companyId, messages]);

  async function handleSend() {
    await handleSendWithText(input);
  }

  function handleVideoEnded() {
    setTimeout(() => {
      setVideoState('idle');
      setCurrentCaption('');
      setCurrentVideoUrl(null);
      setGooeyResponse(null);
    }, 700);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function removeAttachment(index: number) {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setAttachmentContext('');
  }

  async function handleAttachmentSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (files.length + attachments.length > 5) {
      alert('You can upload a maximum of 5 attachments.');
      return;
    }
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} exceeds 5MB limit`);
        return;
      }
    }
    setAttachments(prev => [...prev, ...files]);
    await processAttachments(files);
    e.target.value = '';
  }

  async function processAttachments(files: File[]) {
    setIsProcessingAttachments(true);
    try {
      const extractedResults: string[] = [];
      for (const file of files) {
        const base64 = await fileToBase64(file);
        const result = await extractAttachmentWithGemini(file.type, base64);
        extractedResults.push(result);
      }
      const combinedContext = extractedResults.join('\n\n');
      setAttachmentContext(prev => prev ? `${prev}\n\n${combinedContext}` : combinedContext);
    } catch (err) {
      console.error('Attachment extraction failed:', err);
    } finally {
      setIsProcessingAttachments(false);
    }
  }

  async function extractAttachmentWithGemini(mimeType: string, base64Data: string): Promise<string> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const body = {
      contents: [{
        parts: [
          { text: `You are a document analysis and information extraction assistant. Extract ALL meaningful information from the attached file.` },
          { inlineData: { mimeType, data: base64Data } }
        ]
      }],
      generationConfig: { temperature: 0.2, topK: 32, topP: 0.9, maxOutputTokens: 4096 }
    };
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No extractable content found.';
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleSettingsChange(newSettings: ConversationSettings) {
    setSettings(newSettings);
    try {
      await updateCompanySettings(companyId, newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  function handlePlayMessage(videoUrl: string | undefined, videoUrls: string[] | undefined, transcript: string) {
    setCurrentCaption(transcript);
    setCurrentVideoUrl(videoUrl || null);
    setGooeyResponse(videoUrls ? { success: true, videoUrls } : null);
    setVideoState('speaking');
  }

  async function handleInvite() {
    const email = inviteEmail.trim();
    if (!email) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      await addCompanyMember(companyId, email);
      setInviteEmail('');
      setShowInviteModal(false);
      alert(`${email} has been added to the company`);
    } catch (error) {
      console.error('Failed to add member:', error);
      alert('Failed to add member');
    }
  }

  async function handleDocumentUpload() {
    if (!documentTitle.trim() || !documentContent.trim()) return;
    try {
      const docId = `${companyId}_${Date.now()}`;

      await addCompanyDocument({
        companyId,
        title: documentTitle.trim(),
        content: documentContent.trim(),
        uploadedBy: 'current-user',
        createdAt: new Date()
      });

      try {
        await upsertDocuments(companyId, [
          {
            id: docId,
            text: `${documentTitle.trim()}\n\n${documentContent.trim()}`,
            metadata: {
              title: documentTitle.trim(),
              uploadedBy: 'current-user',
              uploadedAt: new Date().toISOString()
            }
          }
        ]);
        console.log('Document indexed to Pinecone successfully');
      } catch (pineconeError) {
        console.error('Failed to index to Pinecone:', pineconeError);
      }

      setDocumentTitle('');
      setDocumentContent('');
      setShowDocumentUpload(false);
      alert('Document added and indexed successfully');
    } catch (error) {
      console.error('Failed to upload document:', error);
      alert('Failed to upload document');
    }
  }

  const isBusy = videoState === 'thinking' || videoState === 'speaking';

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
      <ChatHeader
        settings={settings}
        onSettingsClick={() => setShowSettings(true)}
        onInviteClick={() => setShowInviteModal(true)}
        showInviteButton={true}
      />

      <div className="px-3 sm:px-4 md:px-6 py-2 bg-white border-b border-gray-200 flex-shrink-0">
        <button
          onClick={() => setShowDocumentUpload(true)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl hover:from-gray-200 hover:to-gray-100 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
        >
          <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Add Data (RAG)</span>
          <span className="sm:hidden">Add Data</span>
        </button>
        {companyDocuments.length > 0 && (
          <p className="text-xs text-gray-500 mt-1.5 ml-1">{companyDocuments.length} document(s) uploaded</p>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 p-3 sm:p-4 md:p-6 pb-2 md:pb-4 overflow-auto min-h-0">
          <div className="max-w-full md:max-w-2xl mx-auto h-full flex items-center justify-center">
            <div className="w-full px-2 sm:px-0">
              <VideoPlayer
                state={videoState}
                avatarImageUrl={settings.avatarPreviewImageUrl}
                speakingVideoUrl={currentVideoUrl}
                speakingVideoUrls={gooeyResponse?.videoUrls}
                caption={currentCaption}
                onVideoEnded={handleVideoEnded}
              />
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 overflow-hidden" style={{ maxHeight: '40vh' }}>
          <TranscriptView
            messages={messages}
            onPlayMessage={handlePlayMessage}
            transcriptHeight={transcriptHeight}
            onHeightChange={setTranscriptHeight}
          />
        </div>

        <div className="flex-shrink-0 border-t border-gray-200">
          <MessageInput
            input={input}
            onInputChange={setInput}
            onSend={handleSend}
            onKeyDown={handleKeyDown}
            isListening={false}
            onToggleListening={() => {}}
            isBusy={isBusy}
            speechError={speechError}
            attachments={attachments}
            onAttachmentSelect={handleAttachmentSelect}
            onRemoveAttachment={removeAttachment}
            isProcessingAttachments={isProcessingAttachments}
          />
        </div>
      </div>

      {showSettings && (
        <AvatarSettingsPanel
          conversationId={companyId}
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowInviteModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                  placeholder="colleague@company.com"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                />
              </div>
              <button
                onClick={handleInvite}
                disabled={!inviteEmail.trim()}
                className="w-full py-3.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-105 ripple font-medium"
              >
                <Mail className="w-4 h-4" />
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}

      {showDocumentUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowDocumentUpload(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 animate-slide-up max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add Company Data</h3>
              <button
                onClick={() => setShowDocumentUpload(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Title</label>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="Company Policy"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={documentContent}
                  onChange={(e) => setDocumentContent(e.target.value)}
                  rows={10}
                  placeholder="Enter document content here..."
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all scrollbar-thin"
                />
              </div>
              <button
                onClick={handleDocumentUpload}
                disabled={!documentTitle.trim() || !documentContent.trim()}
                className="w-full py-3.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-105 ripple font-medium"
              >
                <Upload className="w-4 h-4" />
                Upload Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
