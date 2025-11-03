import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Phone,
  Video,
  Info,
  Check,
  CheckCheck,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

// Mock data - replace with actual API calls
const mockConversations = [
  {
    id: '1',
    participant: {
      id: '2',
      name: 'Sarah Johnson',
      avatar: '',
      role: 'Recruiter',
      company: 'TechCorp Inc.',
      isOnline: true
    },
    lastMessage: {
      content: 'Looking forward to our interview tomorrow!',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      isRead: true,
      isSender: false
    },
    unreadCount: 0,
    job: {
      id: '101',
      title: 'Senior Frontend Developer'
    }
  },
  {
    id: '2',
    participant: {
      id: '3',
      name: 'Mike Chen',
      avatar: '',
      role: 'Hiring Manager',
      company: 'StartUpXYZ',
      isOnline: false
    },
    lastMessage: {
      content: 'Thanks for sending your portfolio!',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isRead: true,
      isSender: true
    },
    unreadCount: 0,
    job: {
      id: '102',
      title: 'React Developer'
    }
  },
  {
    id: '3',
    participant: {
      id: '4',
      name: 'Emily Davis',
      avatar: '',
      role: 'Talent Acquisition',
      company: 'BigTech Co.',
      isOnline: true
    },
    lastMessage: {
      content: 'Are you available for a quick call this afternoon?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isRead: false,
      isSender: false
    },
    unreadCount: 1,
    job: {
      id: '103',
      title: 'Full Stack Engineer'
    }
  }
];

const mockMessages = {
  '1': [
    {
      id: '1',
      content: 'Hi! Thanks for applying to the Senior Frontend Developer position.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      isSender: false,
      isRead: true
    },
    {
      id: '2',
      content: 'Thank you for considering my application! I\'m very interested in this opportunity.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23),
      isSender: true,
      isRead: true
    },
    {
      id: '3',
      content: 'Great! Can you tell me more about your experience with React and TypeScript?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22),
      isSender: false,
      isRead: true
    },
    {
      id: '4',
      content: 'I have 5 years of experience with React and 3 years with TypeScript. I\'ve worked on several large-scale applications.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 21),
      isSender: true,
      isRead: true
    },
    {
      id: '5',
      content: 'Looking forward to our interview tomorrow!',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      isSender: false,
      isRead: true
    }
  ],
  '2': [
    {
      id: '1',
      content: 'Hello! We reviewed your application for the React Developer role.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
      isSender: false,
      isRead: true
    },
    {
      id: '2',
      content: 'That\'s great to hear! What are the next steps?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 47),
      isSender: true,
      isRead: true
    },
    {
      id: '3',
      content: 'Could you share your portfolio or GitHub profile?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 46),
      isSender: false,
      isRead: true
    },
    {
      id: '4',
      content: 'Thanks for sending your portfolio!',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isSender: true,
      isRead: true
    }
  ],
  '3': [
    {
      id: '1',
      content: 'Hi there! We\'re impressed with your background for the Full Stack Engineer position.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      isSender: false,
      isRead: true
    },
    {
      id: '2',
      content: 'Thank you! I\'m excited about this opportunity.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isSender: true,
      isRead: true
    },
    {
      id: '3',
      content: 'Are you available for a quick call this afternoon?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isSender: false,
      isRead: false
    }
  ]
};

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedConversation) {
      setMessages(mockMessages[selectedConversation.id] || []);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date(),
      isSender: true,
      isRead: false
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate reply after 2 seconds
    setTimeout(() => {
      const reply = {
        id: (Date.now() + 1).toString(),
        content: 'Thanks for your message! I\'ll get back to you soon.',
        timestamp: new Date(),
        isSender: false,
        isRead: false
      };
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  const formatTimestamp = (timestamp) => {
    if (isToday(timestamp)) {
      return format(timestamp, 'HH:mm');
    } else if (isYesterday(timestamp)) {
      return 'Yesterday';
    } else if (isThisWeek(timestamp)) {
      return format(timestamp, 'EEE');
    } else {
      return format(timestamp, 'MMM dd');
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ConversationItem = ({ conversation }) => (
    <div
      className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
        selectedConversation?.id === conversation.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
      onClick={() => setSelectedConversation(conversation)}
    >
      <div className="flex items-start space-x-3">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {conversation.participant.name.split(' ').map(n => n[0]).join('')}
          </div>
          {conversation.participant.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {conversation.participant.name}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTimestamp(conversation.lastMessage.timestamp)}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 truncate">
            {conversation.lastMessage.content}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              {conversation.job.title}
            </span>
            <div className="flex items-center space-x-1">
              {conversation.lastMessage.isSender && (
                conversation.lastMessage.isRead ? (
                  <CheckCheck className="w-3 h-3 text-blue-500" />
                ) : (
                  <Check className="w-3 h-3 text-gray-400" />
                )
              )}
              {conversation.unreadCount > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {conversation.unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const MessageBubble = ({ message }) => (
    <div className={`flex ${message.isSender ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
        message.isSender
          ? 'bg-blue-600 text-white rounded-br-none'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
      }`}>
        <p className="text-sm">{message.content}</p>
        <div className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
          message.isSender ? 'text-blue-200' : 'text-gray-500'
        }`}>
          <span>{formatTimestamp(message.timestamp)}</span>
          {message.isSender && (
            message.isRead ? (
              <CheckCheck className="w-3 h-3" />
            ) : (
              <Check className="w-3 h-3" />
            )
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex h-[calc(100vh-12rem)]">
            {/* Conversations Sidebar */}
            <div className="w-full md:w-96 border-r border-gray-200 dark:border-gray-700 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Messages
                </h1>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map(conversation => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No conversations found
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col hidden md:flex">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {selectedConversation.participant.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        {selectedConversation.participant.isOnline && (
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                        )}
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white">
                          {selectedConversation.participant.name}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedConversation.participant.role} • {selectedConversation.participant.company}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Phone className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Video className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Info className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-4xl mx-auto">
                      {messages.map(message => (
                        <MessageBubble key={message.id} message={message} />
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                      <button type="button" className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button type="button" className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Smile className="w-5 h-5" />
                      </button>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                      >
                        <Send className="w-4 h-4" />
                        <span>Send</span>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                // Empty State
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Choose a conversation from the sidebar to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Empty State */}
            <div className="flex-1 flex items-center justify-center md:hidden">
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;