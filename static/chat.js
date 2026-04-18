/**
 * Medical AI Chatbot - Frontend JavaScript
 * Handles chat functionality, API communication, and UI interactions
 */

// Configuration
const API_ENDPOINT = '/get';
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

// DOM Elements
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const toastIcon = document.getElementById('toastIcon');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const newChatBtn = document.getElementById('newChatBtn');
const chatHistoryList = document.getElementById('chatHistoryList');

// State
let chatHistory = [];
let isLoading = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadChatHistory();
    setupEventListeners();
    configureMarked();
    scrollToBottom();
});

/**
 * Configure marked.js for markdown rendering
 */
function configureMarked() {
    marked.setOptions({
        breaks: true,
        gfm: true,
        highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return code;
        }
    });
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Send button click
    sendBtn.addEventListener('click', sendMessage);

    // Input handling
    messageInput.addEventListener('keydown', handleKeydown);
    messageInput.addEventListener('input', autoResize);

    // Mobile sidebar
    mobileMenuBtn.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', toggleSidebar);

    // New chat button
    newChatBtn.addEventListener('click', startNewChat);

    // Focus input on load
    messageInput.focus();
}

/**
 * Handle keyboard events
 */
function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

/**
 * Auto-resize textarea based on content
 */
function autoResize() {
    messageInput.style.height = 'auto';
    const newHeight = Math.min(messageInput.scrollHeight, 128);
    messageInput.style.height = newHeight + 'px';
}

/**
 * Toggle mobile sidebar
 */
function toggleSidebar() {
    sidebar.classList.toggle('-translate-x-full');
    sidebarOverlay.classList.toggle('hidden');
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const config = {
        info: { icon: 'fa-info-circle', bg: 'bg-blue-600', border: 'border-blue-500' },
        success: { icon: 'fa-check-circle', bg: 'bg-green-600', border: 'border-green-500' },
        error: { icon: 'fa-exclamation-circle', bg: 'bg-red-600', border: 'border-red-500' },
        warning: { icon: 'fa-exclamation-triangle', bg: 'bg-yellow-600', border: 'border-yellow-500' }
    };

    const { icon, bg, border } = config[type] || config.info;

    toastIcon.className = `fas ${icon}`;
    toastMessage.textContent = message;
    toast.querySelector('div').className = `flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${bg} ${border} text-white`;

    toast.classList.remove('translate-x-full');
    setTimeout(() => {
        toast.classList.add('translate-x-full');
    }, 4000);
}

/**
 * Send message to API
 */
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || isLoading) return;

    isLoading = true;
    updateSendButtonState();

    // Add user message to chat
    addMessage(message, 'user');
    messageInput.value = '';
    messageInput.style.height = 'auto';

    // Show typing indicator
    typingIndicator.classList.remove('hidden');
    scrollToBottom();

    try {
        const response = await fetchWithRetry(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ msg: message }),
        });

        typingIndicator.classList.add('hidden');

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Extract response content (adjust based on your API response structure)
        const aiResponse = data.response || data.answer || data.message || JSON.stringify(data);
        addMessage(aiResponse, 'ai');

    } catch (error) {
        typingIndicator.classList.add('hidden');
        console.error('Chat error:', error);
        addErrorMessage(error.message);
        showToast('Failed to get response. Please try again.', 'error');
    } finally {
        isLoading = false;
        updateSendButtonState();
        messageInput.focus();
    }
}

/**
 * Fetch with retry logic
 */
async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
    try {
        const response = await fetch(url, options);
        return response;
    } catch (error) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return fetchWithRetry(url, options, retries - 1);
        }
        throw error;
    }
}

/**
 * Add message to chat UI
 */
function addMessage(content, type) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isUser = type === 'user';

    const messageHtml = `
        <div class="flex gap-4 max-w-4xl mx-auto ${isUser ? 'flex-row-reverse' : ''}" data-timestamp="${timestamp}">
            <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                isUser
                    ? 'bg-gradient-to-br from-green-500 to-green-700'
                    : 'bg-gradient-to-br from-primary-500 to-primary-700'
            }">
                <i class="fas ${isUser ? 'fa-user' : 'fa-robot'} text-white text-xs"></i>
            </div>
            <div class="flex-1 space-y-2 ${isUser ? 'flex flex-col items-end' : ''}">
                <div class="flex items-center gap-2 ${isUser ? 'flex-row-reverse' : ''}">
                    <span class="font-semibold text-white">${isUser ? 'You' : 'MedAI Assistant'}</span>
                    <span class="text-xs text-gray-400">${timestamp}</span>
                </div>
                <div class="${
                    isUser
                        ? 'bg-primary-600 border-primary-500'
                        : 'bg-dark-surface border-dark-border'
                } border rounded-2xl ${isUser ? 'rounded-tr-none' : 'rounded-tl-none'} p-4 text-gray-100 leading-relaxed message-content">
                    ${isUser ? escapeHtml(content) : parseMarkdown(content)}
                </div>
            </div>
        </div>
    `;

    messagesContainer.insertAdjacentHTML('beforeend', messageHtml);
    scrollToBottom();

    // Highlight code blocks
    if (!isUser) {
        messagesContainer.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    }

    // Save to history
    if (isUser) {
        saveToHistory(content);
    }
}

/**
 * Add error message to chat
 */
function addErrorMessage(error) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const errorHtml = `
        <div class="flex gap-4 max-w-4xl mx-auto">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex-shrink-0 flex items-center justify-center">
                <i class="fas fa-exclamation text-white text-xs"></i>
            </div>
            <div class="flex-1 space-y-2">
                <div class="flex items-center gap-2">
                    <span class="font-semibold text-white">System</span>
                    <span class="text-xs text-gray-400">${timestamp}</span>
                </div>
                <div class="bg-red-900/30 border border-red-700 rounded-2xl rounded-tl-none p-4 text-red-200 leading-relaxed">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    ${escapeHtml(error)}
                </div>
            </div>
        </div>
    `;

    messagesContainer.insertAdjacentHTML('beforeend', errorHtml);
    scrollToBottom();
}

/**
 * Parse markdown content
 */
function parseMarkdown(content) {
    try {
        return marked.parse(content);
    } catch (e) {
        console.error('Markdown parsing error:', e);
        return escapeHtml(content);
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Scroll chat to bottom
 */
function scrollToBottom() {
    messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
    });
}

/**
 * Update send button state
 */
function updateSendButtonState() {
    sendBtn.disabled = isLoading;
    sendBtn.classList.toggle('opacity-50', isLoading);
    sendBtn.classList.toggle('cursor-not-allowed', isLoading);
}

/**
 * Save chat to history (localStorage)
 */
function saveToHistory(message) {
    const chatItem = {
        id: Date.now(),
        preview: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        timestamp: new Date().toISOString()
    };

    chatHistory.unshift(chatItem);
    if (chatHistory.length > 20) {
        chatHistory.pop();
    }

    localStorage.setItem('medChatHistory', JSON.stringify(chatHistory));
    renderChatHistory();
}

/**
 * Load chat history from localStorage
 */
function loadChatHistory() {
    try {
        const stored = localStorage.getItem('medChatHistory');
        if (stored) {
            chatHistory = JSON.parse(stored);
            renderChatHistory();
        }
    } catch (e) {
        console.error('Failed to load chat history:', e);
    }
}

/**
 * Render chat history in sidebar
 */
function renderChatHistory() {
    if (chatHistory.length === 0) {
        chatHistoryList.innerHTML = `
            <p class="text-sm text-gray-500 text-center py-4">No chat history</p>
        `;
        return;
    }

    chatHistoryList.innerHTML = chatHistory.map(chat => `
        <button
            class="w-full text-left px-3 py-2 rounded-lg hover:bg-dark-bg/50 transition-colors group"
            onclick="loadChat(${chat.id})"
        >
            <div class="flex items-center gap-2">
                <i class="fas fa-comment text-gray-500 text-xs"></i>
                <span class="text-sm text-gray-300 truncate flex-1">${escapeHtml(chat.preview)}</span>
            </div>
            <span class="text-xs text-gray-500">${new Date(chat.timestamp).toLocaleDateString()}</span>
        </button>
    `).join('');
}

/**
 * Start new chat (clear messages)
 */
function startNewChat() {
    // Keep welcome message, remove rest
    const welcomeMessage = messagesContainer.querySelector('[data-timestamp]');
    messagesContainer.innerHTML = '';
    if (welcomeMessage) {
        messagesContainer.appendChild(welcomeMessage);
    }
    messageInput.value = '';
    messageInput.focus();
    showToast('New chat started', 'success');
}

/**
 * Load a specific chat (placeholder - implement full chat storage if needed)
 */
function loadChat(chatId) {
    showToast('Chat history loading...', 'info');
    // TODO: Implement full chat storage and retrieval
}

// Expose functions for global access (needed for onclick handlers)
window.loadChat = loadChat;
