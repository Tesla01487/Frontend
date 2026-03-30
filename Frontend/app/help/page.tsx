"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MessageCircle,
  Mail,
  Phone,
  ChevronDown,
  Send,
  HelpCircle,
  Book,
  FileText,
  Headphones,
} from 'lucide-react';
import Navigation from '@/components/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

const ticketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  category: z.string().min(1, 'Please select a category'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
  email: z.string().email('Invalid email address'),
});

type TicketForm = z.infer<typeof ticketSchema>;

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  {
    id: '1',
    question: 'How do I create an account?',
    answer:
      'Click on the "Register" button on the login page, fill in your details including name, email, and phone number. You\'ll receive an OTP to verify your account.',
    category: 'Account',
  },
  {
    id: '2',
    question: 'How do I transfer coins to another user?',
    answer:
      'Go to the Transfer page, enter the recipient\'s wallet ID or username, specify the amount, and enter your PIN to confirm the transaction.',
    category: 'Transfers',
  },
  {
    id: '3',
    question: 'Is my wallet secure?',
    answer:
      'Yes! We use industry-standard encryption, two-factor authentication, and secure PIN protection for all transactions. Your funds are protected 24/7.',
    category: 'Security',
  },
  {
    id: '4',
    question: 'What are the transaction fees?',
    answer:
      'Currently, all transactions on our platform are free. We do not charge any fees for sending or receiving coins.',
    category: 'Fees',
  },
  {
    id: '5',
    question: 'How do I reset my password?',
    answer:
      'Click "Forgot Password" on the login page, enter your email, and follow the OTP verification process to create a new password.',
    category: 'Account',
  },
  {
    id: '6',
    question: 'Can I use QR codes for transfers?',
    answer:
      'Yes! Generate a QR code from the Transfer page under the "Receive" tab. Others can scan it to send you coins instantly.',
    category: 'Transfers',
  },
  {
    id: '7',
    question: 'How do I enable two-factor authentication?',
    answer:
      'Go to Profile > Security Settings and toggle on "Two-Factor Authentication". Follow the setup instructions to secure your account.',
    category: 'Security',
  },
  {
    id: '8',
    question: 'Where can I view my transaction history?',
    answer:
      'Navigate to the History page from the main menu. You can filter by sent/received, search transactions, and export your history to CSV.',
    category: 'Transactions',
  },
];

const categories = ['All', 'Account', 'Transfers', 'Security', 'Fees', 'Transactions'];

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState<'faq' | 'ticket' | 'chat'>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<
    { id: string; text: string; sender: 'user' | 'support' }[]
  >([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      sender: 'support',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TicketForm>({
    resolver: zodResolver(ticketSchema),
  });

  const onTicketSubmit = async (data: TicketForm) => {
    try {
      const response = await api.createSupportTicket({
        subject: data.subject,
        category: data.category,
        message: data.message,
      });
      
      if (response.success) {
        toast.success('Support ticket submitted successfully!');
        reset();
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast.error('Failed to submit ticket. Please try again.');
    }
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: chatInput,
      sender: 'user' as const,
    };

    setChatMessages([...chatMessages, newMessage]);
    setChatInput('');

    // Simulate support response
    setTimeout(() => {
      const supportMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Thank you for your message. A support agent will respond shortly.',
        sender: 'support' as const,
      };
      setChatMessages((prev) => [...prev, supportMessage]);
    }, 1000);
  };

  // Filter FAQs
  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const tabs = [
    { id: 'faq' as const, label: 'FAQ', icon: HelpCircle },
    { id: 'ticket' as const, label: 'Submit Ticket', icon: FileText },
    { id: 'chat' as const, label: 'Live Chat', icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      <Navigation />

      <main className="container mx-auto px-4 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Help & Support</h1>
          <p className="text-muted-foreground">
            Get help with your account and find answers to common questions
          </p>
        </motion.div>

        {/* Contact Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="card p-6 text-center">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold mb-2">Email Support</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We&apos;ll respond within 24 hours
            </p>
            <a
              href="mailto:support@Tesla.com"
              className="text-primary hover:underline font-medium"
            >
              support@Tesla.com
            </a>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold mb-2">Phone Support</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Mon-Fri, 9AM-6PM EST
            </p>
            <a
              href="tel:+1234567890"
              className="text-primary hover:underline font-medium"
            >
              +1 (234) 567-890
            </a>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold mb-2">Live Chat</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get instant help from our team
            </p>
            <button
              onClick={() => setActiveTab('chat')}
              className="text-primary hover:underline font-medium"
            >
              Start Chat
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-2 bg-muted rounded-xl p-2 inline-flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeHelpTab"
                      className="absolute inset-0 gradient-primary rounded-lg"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'faq' && (
            <motion.div
              key="faq"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Search and Filter */}
              <div className="card p-6 mb-8">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search help articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input pl-12 w-full"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                          selectedCategory === category
                            ? 'btn-primary'
                            : 'border border-border hover:bg-muted'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* FAQ List */}
              <div className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="card overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedFaq(expandedFaq === faq.id ? null : faq.id)
                      }
                      className="w-full p-6 flex items-center justify-between hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start gap-4 text-left flex-1">
                        <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                          <Book className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold mb-1">{faq.question}</h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                            {faq.category}
                          </span>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform flex-shrink-0 ${
                          expandedFaq === faq.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {expandedFaq === faq.id && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 pt-0">
                            <p className="text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {filteredFaqs.length === 0 && (
                <div className="text-center py-16 card">
                  <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try different search terms or browse all categories
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'ticket' && (
            <motion.div
              key="ticket"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto"
            >
              <div className="card p-8">
                <h2 className="text-2xl font-bold mb-6">Submit a Support Ticket</h2>
                <form onSubmit={handleSubmit(onTicketSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="your.email@example.com"
                      className="input"
                    />
                    {errors.email && (
                      <p className="text-error text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Category
                    </label>
                    <select {...register('category')} className="input">
                      <option value="">Select a category</option>
                      <option value="account">Account Issues</option>
                      <option value="transfers">Transfer Problems</option>
                      <option value="security">Security Concerns</option>
                      <option value="technical">Technical Issues</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.category && (
                      <p className="text-error text-sm mt-1">
                        {errors.category.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Subject
                    </label>
                    <input
                      {...register('subject')}
                      type="text"
                      placeholder="Brief description of your issue"
                      className="input"
                    />
                    {errors.subject && (
                      <p className="text-error text-sm mt-1">
                        {errors.subject.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Message
                    </label>
                    <textarea
                      {...register('message')}
                      rows={6}
                      placeholder="Please provide detailed information about your issue..."
                      className="input resize-none"
                    />
                    {errors.message && (
                      <p className="text-error text-sm mt-1">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    className="btn-primary w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Submit Ticket
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto"
            >
              <div className="card overflow-hidden">
                {/* Chat Header */}
                <div className="p-6 border-b border-border gradient-primary">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <Headphones className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Support Agent</h3>
                      <p className="text-sm text-white/80">
                        Typically responds in minutes
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="h-96 overflow-y-auto p-6 space-y-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-4 rounded-xl ${
                          message.sender === 'user'
                            ? 'gradient-primary text-white'
                            : 'bg-muted'
                        }`}
                      >
                        <p>{message.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="p-6 border-t border-border">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      placeholder="Type your message..."
                      className="input flex-1"
                    />
                    <motion.button
                      onClick={sendChatMessage}
                      className="btn-primary px-6"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
