import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useMessageStore, Message } from '../store/messageStore';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
interface MessageThreadProps {
  serviceId: string;
  otherUserId: string;
  otherUsername: string;
}

export default function MessageThread({ 
  serviceId, 
  otherUserId,
  otherUsername 
}: MessageThreadProps) {
  const { user } = useAuthStore();
  const { fetchConversation, sendMessage, conversations } = useMessageStore();
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const conversationKey = `${serviceId}-${otherUserId}`;
  const messages = conversations[conversationKey] || [];
  
  useEffect(() => {
    if (user && otherUserId) {
      fetchConversation(serviceId, otherUserId);
      
      // Set up real-time subscription
      const channel = supabase
        .channel(`messages:${serviceId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `service_id=eq.${serviceId}`,
        }, () => {
          fetchConversation(serviceId, otherUserId);
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, otherUserId, serviceId]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;
    
    setIsLoading(true);
    
    try {
      await sendMessage({
        sender_id: user.id,
        receiver_id: otherUserId,
        service_id: serviceId,
        content: newMessage,
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };
  
  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="px-4 py-3 border-b">
        <h3 className="text-lg font-semibold">Chat with {otherUsername}</h3>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message: Message) => {
              const isSender = message.sender_id === user?.id;
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-lg ${
                      isSender
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${isSender ? 'text-indigo-200' : 'text-gray-500'}`}>
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !newMessage.trim()}
            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}