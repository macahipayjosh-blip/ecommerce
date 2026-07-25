import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    created_at: string;
    roles: Array<{ name: string }>;
}

const ROLE_BADGE: Record<string, string> = {
    super_admin: 'badge-red',
    admin: 'badge-purple',
    seller: 'badge-blue',
    customer: 'badge-green',
    support_agent: 'badge-yellow',
};

export default function UsersIndex({
    users,
    roles,
    counts,
}: {
    users: { data: User[]; links: any[]; meta: any };
    roles: Array<{ id: number; name: string }>;
    counts: { total: number; customers: number; sellers: number; admins: number; active: number; inactive: number };
}) {
    const updateRole = (id: number, role: string) => router.patch(route('admin.users.role', id), { role });
    const toggleStatus = (id: number) => router.patch(route('admin.users.status', id));

    return (
        <AdminLayout breadcrumb="Users">
            <Head title="User Management" />

            <div className="pg-header">
                <div className="pg-title">User Management</div>
                <div className="pg-subtitle">Manage all system users and their roles</div>
            </div>

            <div className="stat-grid">
                {[
                    { label: 'Total', value: counts.total, icon: '👥' },
                    { label: 'Customers', value: counts.customers, icon: '🛍' },
                    { label: 'Sellers', value: counts.sellers, icon: '🏪' },
                    { label: 'Admins', value: counts.admins, icon: '🛡' },
                    { label: 'Active', value: counts.active, icon: '✅' },
                    { label: 'Inactive', value: counts.inactive, icon: '⛔' },
                ].map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-icon" style={{ background: '#f1f3f7' }}>
                            {s.icon}
                        </div>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value">{s.value}</div>
                    </div>
                ))}
            </div>

            <div className="card">
                <div className="card-header">
                    <span className="card-title">All Users</span>
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>{users.meta?.total ?? users.data.length} total</span>
                </div>
                <div className="table-wrap">
                    <table className="ap-table">
                        <thead>
                            <tr>
                                {['User', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                                    <th key={h}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.map((user) => {
                                const role = user.roles[0]?.name ?? 'customer';
                                return (
                                    <tr key={user.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div
                                                    style={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#fff',
                                                        fontWeight: 600,
                                                        fontSize: 13,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{user.name}</div>
                                                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span className={`badge ${ROLE_BADGE[role] ?? 'badge-gray'}`}>{role.replace('_', ' ')}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => toggleStatus(user.id)}
                                                className={`badge ${user.is_active ? 'badge-green' : 'badge-red'}`}
                                                style={{ cursor: 'pointer', border: 'none' }}
                                            >
                                                {user.is_active ? '● Active' : '● Inactive'}
                                            </button>
                                        </td>
                                        <td style={{ fontSize: 12, color: '#9ca3af' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <Link href={route('admin.users.show', user.id)} className="btn btn-secondary btn-sm">
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {users.data.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-icon">👥</div>
                            <div className="empty-state-title">No users found</div>
                        </div>
                    )}
                </div>
                {users.links && (
                    <div className="pagination">
                        <span className="pagination-info">
                            Showing {users.meta?.from}–{users.meta?.to} of {users.meta?.total}
                        </span>
                        <div className="pagination-links">
                            {users.links.map((l: any, i: number) =>
                                l.url ? (
                                    <Link key={i} href={l.url} className={l.active ? 'active' : ''} dangerouslySetInnerHTML={{ __html: l.label }} />
                                ) : (
                                    <span key={i} dangerouslySetInnerHTML={{ __html: l.label }} />
                                ),
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
