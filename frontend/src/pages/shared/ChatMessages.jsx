import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { HiOutlineTrash, HiPaperAirplane, HiChevronLeft, HiOutlineChatAlt2, HiOutlineHome } from 'react-icons/hi';
import { chatMessagesStyles as s } from '../../assets/dummyStyles';
import Navbar from '../../components/common/Navbar';
import { SellerLayout, AdminLayout } from '../../components/common/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import useSocket from '../../hooks/useSocket';
import api, { ENDPOINTS } from '../../api/endpoints';
import { coverImage, errMsg, formatPrice, formatTime } from '../../utils/helpers';

const Avatar = ({ person }) => (
    <div className={s.avatar}>
        {person?.profilePic ? (
            <img src={person.profilePic} alt="" className={s.avatarImg} />
        ) : (
            (person?.name || '?')[0].toUpperCase()
        )}
    </div>
);

const sortChats = (list) => [...list].sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

const ChatMessages = () => {
    const { user } = useAuth();
    const [params, setParams] = useSearchParams();
    const myId = String(user?._id || user?.id || '');

    const [chats, setChats] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const bottomRef = useRef(null);
    const activeRef = useRef(null);

    useEffect(() => {
        activeRef.current = activeId;
    }, [activeId]);

    const active = chats.find((c) => c._id === activeId);

    // Load conversations
    const loadChats = useCallback(
        () =>
            api.get(ENDPOINTS.CHATS)
                .then((res) => setChats(sortChats(res.data.chats || [])))
                .catch((err) => setError(errMsg(err, 'Failed to load conversations.')))
                .finally(() => setLoadingChats(false)),
        []
    );

    useEffect(() => {
        loadChats();
    }, [loadChats]);

    // Open from link
    useEffect(() => {
        const sellerId = params.get('seller');
        const buyerId = params.get('buyer');
        const propertyId = params.get('property');
        if (!sellerId && !buyerId) return;

        const start = async () => {
            try {
                const res = await api.post(ENDPOINTS.CHAT_START, { sellerId, buyerId, propertyId });
                const chat = res.data.chat;
                setChats((prev) => sortChats([chat, ...prev.filter((c) => c._id !== chat._id)]));
                setMessages([]);
                setLoadingMessages(true);
                setActiveId(chat._id);
            } catch (err) {
                setError(errMsg(err, 'Could not open the conversation.'));
            } finally {
                setParams({}, { replace: true });
            }
        };
        start();
    }, [params, setParams]);

    const openChat = (chatId) => {
        if (chatId === activeId) return;
        setMessages([]);
        setLoadingMessages(true);
        setActiveId(chatId);
    };

    // Load messages
    useEffect(() => {
        if (!activeId) return;
        let cancelled = false;

        api.get(ENDPOINTS.CHAT(activeId))
            .then((res) => !cancelled && setMessages(res.data.messages || []))
            .catch((err) => !cancelled && setError(errMsg(err, 'Failed to load messages.')))
            .finally(() => !cancelled && setLoadingMessages(false));

        return () => {
            cancelled = true;
        };
    }, [activeId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const bumpChat = (chatId, lastMessage) =>
        setChats((prev) =>
            sortChats(prev.map((c) => (c._id === chatId ? { ...c, lastMessage, lastMessageAt: new Date().toISOString() } : c)))
        );

    // Realtime
    useSocket({
        receiveMessage: ({ chatId, message }) => {
            if (chatId === activeRef.current) {
                setMessages((prev) => (prev.some((m) => m._id === message._id) ? prev : [...prev, message]));
            }
            setChats((prev) => {
                if (!prev.some((c) => c._id === chatId)) {
                    loadChats();
                    return prev;
                }
                return sortChats(
                    prev.map((c) => (c._id === chatId ? { ...c, lastMessage: message.text, lastMessageAt: message.createdAt } : c))
                );
            });
        },
        messageDeleted: ({ chatId, messageId }) => {
            if (chatId === activeRef.current) setMessages((prev) => prev.filter((m) => m._id !== messageId));
        },
        chatDeleted: ({ chatId }) => {
            setChats((prev) => prev.filter((c) => c._id !== chatId));
            if (chatId === activeRef.current) setActiveId(null);
        },
    });

    // Send
    const send = async (e) => {
        e.preventDefault();
        const body = text.trim();
        if (!body || !activeId || sending) return;

        try {
            setSending(true);
            setError('');
            const res = await api.post(ENDPOINTS.CHAT_MESSAGES(activeId), { text: body });
            const message = res.data.message;
            setMessages((prev) => (prev.some((m) => m._id === message._id) ? prev : [...prev, message]));
            bumpChat(activeId, body);
            setText('');
        } catch (err) {
            setError(errMsg(err, 'Message could not be sent.'));
        } finally {
            setSending(false);
        }
    };

    const deleteMessage = async (id) => {
        try {
            await api.delete(ENDPOINTS.CHAT_MESSAGE(activeId, id));
            setMessages((prev) => prev.filter((m) => m._id !== id));
        } catch (err) {
            setError(errMsg(err, 'Could not delete the message.'));
        }
    };

    const deleteConversation = async (chatId) => {
        if (!window.confirm('Delete this entire conversation?')) return;
        try {
            await api.delete(ENDPOINTS.CHAT(chatId));
            setChats((prev) => prev.filter((c) => c._id !== chatId));
            if (activeId === chatId) setActiveId(null);
        } catch (err) {
            setError(errMsg(err, 'Could not delete the conversation.'));
        }
    };

    const isDashboard = user?.role === 'seller' || user?.role === 'admin';

    const content = (
        <div className={`${s.chatContainer} ${isDashboard ? `${s.chatContainerSeller} rounded-3xl border border-gray-100 shadow-sm` : s.chatContainerNonSeller}`}>
            {!isDashboard && <Navbar />}

            <div className={s.chatWrapper}>
                <aside className={`${s.sidebar} ${activeId ? s.sidebarHidden : ''}`}>
                    <div className={s.sidebarHeader}>
                        <h2 className={s.sidebarTitle}>Messages</h2>
                    </div>

                    <div className={s.sidebarContent}>
                        {loadingChats ? (
                            <div className="p-10 flex justify-center"><span className="loader" /></div>
                        ) : chats.length === 0 ? (
                            <div className={s.emptyConversations}>
                                <HiOutlineChatAlt2 className={s.emptyIcon} />
                                <p>No conversations yet</p>
                                {user?.role === 'buyer' && (
                                    <Link to="/properties" className="btn btn-primary mt-4 text-sm py-2">Browse properties</Link>
                                )}
                            </div>
                        ) : (
                            chats.map((chat) => (
                                <div
                                    key={chat._id}
                                    onClick={() => openChat(chat._id)}
                                    className={`${s.conversationItem} ${activeId === chat._id ? s.conversationItemActive : ''}`}
                                >
                                    <Avatar person={chat.participant} />
                                    <div className={s.conversationInfo}>
                                        <p className={s.conversationName}>{chat.participant?.name || 'Deleted user'}</p>
                                        <p className={s.conversationPreview}>
                                            {chat.lastMessage || (chat.property ? `Re: ${chat.property.title}` : 'Say hello 👋')}
                                        </p>
                                    </div>
                                    <button
                                        type="button" aria-label="Delete conversation" className={s.deleteChatButton}
                                        onClick={(e) => { e.stopPropagation(); deleteConversation(chat._id); }}
                                    >
                                        <HiOutlineTrash />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                <section className={`${s.chatArea} ${activeId ? '' : 'hidden lg:flex'}`}>
                    {active ? (
                        <>
                            <header className={s.chatHeader}>
                                <div className={s.chatHeaderLeft}>
                                    <button type="button" className={s.backButton} onClick={() => setActiveId(null)} aria-label="Back">
                                        <HiChevronLeft className="text-xl" />
                                    </button>
                                    <Avatar person={active.participant} />
                                    <div>
                                        <span className={s.chatPartnerName}>{active.participant?.name}</span>
                                        <p className="text-xs text-text-muted capitalize">{active.participant?.role}</p>
                                    </div>
                                </div>
                                {active.property && (
                                    <Link to={`/property/${active.property._id}`} className="hidden sm:flex items-center gap-3 bg-bg-alt rounded-xl p-2 pr-4 hover:bg-primary-light/50">
                                        <img src={coverImage(active.property)} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-text-main truncate max-w-[180px]">{active.property.title}</p>
                                            <p className="text-xs text-primary font-semibold">{formatPrice(active.property.price)}</p>
                                        </div>
                                    </Link>
                                )}
                            </header>

                            <div className={s.messagesArea}>
                                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                                {loadingMessages && <div className="flex justify-center py-6"><span className="loader" /></div>}
                                {!loadingMessages && messages.length === 0 && (
                                    <div className="m-auto text-center text-text-muted">
                                        <HiOutlineHome className="text-4xl mx-auto mb-2 opacity-40" />
                                        <p className="text-sm">Start the conversation with {active.participant?.name}.</p>
                                    </div>
                                )}

                                {messages.map((m) => {
                                    const mine = String(m.sender?._id || m.sender) === myId;
                                    return (
                                        <div key={m._id} className={`${s.messageBubble} ${mine ? s.messageOwn : s.messageOther}`}>
                                            <div className={s.messageContent}>
                                                <span className={s.messageText}>{m.text}</span>
                                                {mine && (
                                                    <button
                                                        type="button" aria-label="Delete message"
                                                        className={s.deleteMessageButton} onClick={() => deleteMessage(m._id)}
                                                    >
                                                        <HiOutlineTrash className="text-sm" />
                                                    </button>
                                                )}
                                            </div>
                                            <span className={s.messageTime}>{formatTime(m.createdAt)}</span>
                                        </div>
                                    );
                                })}
                                <div ref={bottomRef} />
                            </div>

                            <form onSubmit={send} className={s.messageForm}>
                                <input
                                    value={text} onChange={(e) => setText(e.target.value)}
                                    placeholder="Type a message..." className={s.messageInput}
                                />
                                <button type="submit" disabled={sending || !text.trim()} aria-label="Send" className={`${s.sendButton} disabled:opacity-50`}>
                                    <HiPaperAirplane className={s.sendIcon} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className={s.noChatSelected}>
                            <HiOutlineChatAlt2 className={s.noChatIcon} />
                            <p className={s.noChatTitle}>Select a conversation to start chatting</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );

    if (user?.role === 'seller') return <SellerLayout>{content}</SellerLayout>;
    if (user?.role === 'admin') return <AdminLayout>{content}</AdminLayout>;
    return content;
};

export default ChatMessages;
