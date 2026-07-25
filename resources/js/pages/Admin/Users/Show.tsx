import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { CalendarDays, Mail, Phone, ShoppingCart, Shield, Trash2, UserCheck, UserX } from 'lucide-react';

interface Order { id: number; order_number: string; status: string; total: number; created_at: string }
interface UserProfile {
    id: number; name: string; email: string; phone?: string; is_active: boolean; created_at: string;
    roles: Array<{ name: string }>;
    customer_profile?: { loyalty_points: number; total_spent: number };
    vendor_profile?: { store_name: string; balance: number };
    orders: Order[];
}

const ROLE_COLOR: Record<string, string> = {
    super_admin:   'badge-purple',
    admin:         'badge-blue',
    seller:        'badge-yellow',
    customer:      'badge-gray',
    support_agent: 'badge-green',
};

const STATUS_COLOR: Record<string, string> = {
    pending:   'badge-yellow',
    delivered: 'badge-green',
    cancelled: 'badge-red',
    shipped:   'badge-blue',
};

export default function AdminUserShow({ user, roles }: { user: UserProfile; roles: Array<{ id: number; name: string }> }) {
    const role = user.roles[0]?.name ?? 'customer';

    const toggleStatus = () => router.patch(route('admin.users.status', user.id));
    const deleteUser = () => {
        if (confirm(`Delete ${user.name}? This action is irreversible.`)) {
            router.delete(route('admin.users.destroy', user.id));
        }
    };
    const updateRole = (newRole: string) => router.patch(route('admin.users.role', user.id), { role: newRole });

    const initials = user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    const joinFull = new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const roleDisplay = role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    return (
        <AdminLayout breadcrumb={user.name}>
            <Head title={user.name} />

            {/* Page Header */}
            <div className="pg-header">
                <div>
                    <Link href={route('admin.users.index')} style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                        ← Back to Users
                    </Link>
                    <div className="pg-title">{user.name}</div>
                    <div className="pg-subtitle">User profile &amp; account details</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                        onClick={toggleStatus}
                        className={`btn btn-sm ${user.is_active ? 'btn-secondary' : 'btn-success'}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                        {user.is_active ? <><UserX size={14} /> Deactivate</> : <><UserCheck size={14} /> Activate</>}
                    </button>
                    <button
                        onClick={deleteUser}
                        className="btn btn-danger btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                        <Trash2 size={14} /> Delete
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="stat-grid">
                {[
                    { label: 'Role',         value: roleDisplay,                                                    icon: '🛡' },
                    { label: 'Status',        value: user.is_active ? 'Active' : 'Inactive',                       icon: user.is_active ? '✅' : '⛔' },
                    { label: 'Member Since',  value: new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), icon: '📅' },
                    { label: 'Total Orders',  value: user.orders.length,                                            icon: '🛒' },
                ].map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-icon" style={{ background: '#f1f3f7' }}>{s.icon}</div>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value" style={{ fontSize: 16 }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid-2">
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Profile Card */}
                    <div className="card">
                        <div className="card-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 10,
                                    background: 'linear-gradient(135deg, var(--accent) 0%, #4a7c42 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0,
                                }}>
                                    {initials}
                                </div>
                                <div>
                                    <span className="card-title">{user.name}</span>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{user.email}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <span className={`badge ${ROLE_COLOR[role] ?? 'badge-gray'}`}>{roleDisplay}</span>
                                <span className={`badge ${user.is_active ? 'badge-green' : 'badge-red'}`}>{user.is_active ? 'Active' : 'Inactive'}</span>
                            </div>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
                                {[
                                    ['Full Name',      user.name],
                                    ['Email',          user.email],
                                    ['Phone',          user.phone ?? '—'],
                                    ['Member Since',   joinFull],
                                    ['Account Status', user.is_active ? 'Active' : 'Inactive'],
                                    ['User ID',        `#${user.id}`],
                                ].map(([label, value]) => (
                                    <div key={label as string}>
                                        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Contact chips */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)', background: 'var(--surface-2)', borderRadius: 6, padding: '4px 10px' }}>
                                    <Mail size={12} /> {user.email}
                                </span>
                                {user.phone && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)', background: 'var(--surface-2)', borderRadius: 6, padding: '4px 10px' }}>
                                        <Phone size={12} /> {user.phone}
                                    </span>
                                )}
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)', background: 'var(--surface-2)', borderRadius: 6, padding: '4px 10px' }}>
                                    <CalendarDays size={12} /> Joined {joinFull}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Orders */}
                    {user.orders.length > 0 && (
                        <div className="card">
                            <div className="card-header">
                                <span className="card-title" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    <ShoppingCart size={15} /> Order History
                                </span>
                                <span className="badge badge-gray">{user.orders.length} orders</span>
                            </div>
                            <div className="table-wrap">
                                <table className="ap-table">
                                    <thead>
                                        <tr>{['Order No.', 'Date', 'Status', 'Amount', ''].map(h => <th key={h}>{h}</th>)}</tr>
                                    </thead>
                                    <tbody>
                                        {user.orders.map((order) => (
                                            <tr key={order.id}>
                                                <td style={{ fontWeight: 500 }}>#{order.order_number}</td>
                                                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                    {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td>
                                                    <span className={`badge ${STATUS_COLOR[order.status] ?? 'badge-gray'}`}>
                                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 600 }}>₱{Number(order.total).toFixed(2)}</td>
                                                <td>
                                                    <Link href={route('admin.orders.show', order.id)} className="btn btn-secondary btn-sm">View</Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Access & Role */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <Shield size={15} /> Access &amp; Role
                            </span>
                        </div>
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>Current Role</div>
                                <span className={`badge ${ROLE_COLOR[role] ?? 'badge-gray'}`}>{roleDisplay}</span>
                            </div>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>Reassign Role</div>
                                <select
                                    aria-label="Reassign role"
                                    value={role}
                                    onChange={(e) => updateRole(e.target.value)}
                                    style={{
                                        width: '100%', fontSize: 13, border: '1px solid var(--border)',
                                        borderRadius: 6, padding: '7px 10px', outline: 'none',
                                        background: 'var(--surface)', color: 'var(--text-primary)', cursor: 'pointer',
                                    }}
                                >
                                    {roles.map((r) => (
                                        <option key={r.id} value={r.name}>
                                            {r.name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Customer Summary */}
                    {user.customer_profile && (
                        <div className="card">
                            <div className="card-header"><span className="card-title">Customer Summary</span></div>
                            <div>
                                {[
                                    ['Total Spent',    `₱${Number(user.customer_profile.total_spent).toFixed(2)}`],
                                    ['Loyalty Points', user.customer_profile.loyalty_points.toLocaleString()],
                                ].map(([label, value]) => (
                                    <div key={label as string} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label as string}</span>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{value as string}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Vendor Details */}
                    {user.vendor_profile && (
                        <div className="card">
                            <div className="card-header"><span className="card-title">Vendor Details</span></div>
                            <div>
                                {[
                                    ['Store Name', user.vendor_profile.store_name],
                                    ['Balance',    `₱${Number(user.vendor_profile.balance).toFixed(2)}`],
                                ].map(([label, value]) => (
                                    <div key={label as string} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label as string}</span>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{value as string}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
