import SellerLayout from '@/layouts/SellerLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { MessageCircle, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Conversation {
    product_id: number;
    product_name: string;
    customer_id: number;
    customer_name: string;
    last_message: string;
    last_at: string;
}

interface Message {
    id: number;
    sender_id: number;
    message: string;
    created_at: string;
}

interface Props {
    conversations: Conversation[];
    activeMessages?: Message[];
    activeProductId?: number;
    activeProductName?: string;
    activeCustomerId?: number;
}

export default function SellerMessagesIndex({ conversations, activeMessages = [], activeProductId, activeProductName, activeCustomerId }: Props) {
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;
    const [messages, setMessages] = useState<Message[]>(activeMessages);
    const [msgText, setMsgText] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setMessages(activeMessages); }, [activeMessages]);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const openConversation = (conv: Conversation) => {
        router.get(route('seller.messages.show', conv.product_id), { customer_id: conv.customer_id });
    };

    const sendReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!msgText.trim() || !activeProductId) return;
        setSending(true);
        router.post(
            route('seller.messages.reply', activeProductId),
            { message: msgText, receiver_id: activeCustomerId },
            {
                onSuccess: () => setMsgText(''),
                onFinish: () => setSending(false),
            },
        );
    };

    return (
        <SellerLayout breadcrumb="Messages">
            <Head title="Messages" />

            <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 130px)', background: '#fff', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>

                {/* Conversation List */}
                <div style={{ width: 300, minWidth: 300, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                        Inbox <span style={{ marginLeft: 6, background: 'var(--green-100)', color: 'var(--green-700)', borderRadius: 20, padding: '1px 8px', fontSize: 11 }}>{conversations.length}</span>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {conversations.length === 0 ? (
                            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                                <MessageCircle size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                                No messages yet
                            </div>
                        ) : (
                            conversations.map((conv) => {
                                const isActive = conv.product_id === activeProductId && conv.customer_id === activeCustomerId;
                                return (
                                    <button
                                        key={`${conv.product_id}_${conv.customer_id}`}
                                        onClick={() => openConversation(conv)}
                                        style={{
                                            width: '100%', textAlign: 'left', padding: '14px 20px',
                                            background: isActive ? 'var(--green-50)' : 'transparent',
                                            borderLeft: isActive ? '3px solid var(--green-700)' : '3px solid transparent',
                                            borderBottom: '1px solid var(--gray-100)',
                                            cursor: 'pointer', transition: 'background 0.12s',
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                            <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{conv.customer_name}</span>
                                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                {new Date(conv.last_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--green-700)', fontWeight: 500, marginBottom: 2 }}>{conv.product_name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.last_message}</div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    {!activeProductId ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            <MessageCircle size={48} style={{ marginBottom: 12, opacity: 0.2 }} />
                            <p style={{ fontSize: 14 }}>Select a conversation to start messaging</p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', background: 'var(--green-50)' }}>
                                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                                    {conversations.find(c => c.product_id === activeProductId && c.customer_id === activeCustomerId)?.customer_name ?? 'Customer'}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--green-700)' }}>Re: {activeProductName}</div>
                            </div>

                            {/* Messages */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {messages.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 'auto', marginBottom: 'auto' }}>No messages in this conversation yet.</p>
                                ) : (
                                    messages.map((m) => {
                                        const isMe = m.sender_id === auth.user.id;
                                        return (
                                            <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                                                <div style={{
                                                    maxWidth: '70%', borderRadius: 16, padding: '10px 14px', fontSize: 13,
                                                    background: isMe ? 'var(--green-700)' : 'var(--gray-100)',
                                                    color: isMe ? '#fff' : 'var(--text-primary)',
                                                }}>
                                                    {m.message}
                                                    <div style={{ fontSize: 10, marginTop: 4, opacity: 0.65, textAlign: 'right' }}>
                                                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Reply Input */}
                            <form onSubmit={sendReply} style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                                <input
                                    value={msgText}
                                    onChange={(e) => setMsgText(e.target.value)}
                                    placeholder="Type a reply..."
                                    style={{ flex: 1, borderRadius: 10, border: '1px solid var(--border)', padding: '10px 14px', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                                    onFocus={e => (e.target.style.borderColor = 'var(--green-700)')}
                                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !msgText.trim()}
                                    style={{
                                        background: 'var(--green-700)', color: '#fff', border: 'none', borderRadius: 10,
                                        padding: '10px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                        fontSize: 13, fontWeight: 600, opacity: sending || !msgText.trim() ? 0.5 : 1,
                                    }}
                                >
                                    <Send size={15} /> Send
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </SellerLayout>
    );
}
