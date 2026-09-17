'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit2, 
  UserX, 
  UserCheck, 
  Key, 
  RotateCcw, 
  CheckCircle, 
  Trash2, 
  X,
  ChevronLeft,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminUser, AdminDatabase } from '@/lib/adminMock';

interface UserManagementViewProps {
  users: AdminUser[];
  setUsers: (users: AdminUser[]) => void;
  logAction: (action: string) => void;
  permissions: Record<string, boolean>;
}

export default function UserManagementView({
  users,
  setUsers,
  logAction,
  permissions
}: UserManagementViewProps) {
  // Search & Filters State
  const [search, setSearch] = useState('');
  const [filterAccountType, setFilterAccountType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All'); // Live/Demo
  const [filterKyc, setFilterKyc] = useState('All');
  const [filterAccountStatus, setFilterAccountStatus] = useState('All'); // Active/Suspended

  // Selection state
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal States
  const [viewingUser, setViewingUser] = useState<AdminUser | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  
  // Edit Form Fields
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    accountType: 'Retail Trader' as any,
    status: 'Live' as any,
    walletBalance: 0
  });

  // Action Permissions Check
  const canModify = permissions.users;

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.userId.toLowerCase().includes(search.toLowerCase()) ||
        user.country.toLowerCase().includes(search.toLowerCase());
      
      const matchesAccountType = filterAccountType === 'All' || user.accountType === filterAccountType;
      const matchesStatus = filterStatus === 'All' || user.status === filterStatus;
      const matchesKyc = filterKyc === 'All' || user.kycStatus === filterKyc;
      const matchesAccountStatus = filterAccountStatus === 'All' || user.accountStatus === filterAccountStatus;

      return matchesSearch && matchesAccountType && matchesStatus && matchesKyc && matchesAccountStatus;
    });
  }, [users, search, filterAccountType, filterStatus, filterKyc, filterAccountStatus]);

  // Paginated list
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;

  // Selected row toggling
  const toggleSelectUser = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    const currentIds = paginatedUsers.map(u => u.userId);
    const allSelected = currentIds.every(id => selectedUserIds.includes(id));
    if (allSelected) {
      setSelectedUserIds(prev => prev.filter(id => !currentIds.includes(id)));
    } else {
      setSelectedUserIds(prev => [...new Set([...prev, ...currentIds])]);
    }
  };

  // ------------------------------------------
  // OPERATIONS
  // ------------------------------------------

  // Suspend
  const handleSuspend = (userId: string) => {
    if (!canModify) return toast.error('Access Denied: Support and Finance roles cannot modify directories.');
    const updated = users.map(u => {
      if (u.userId === userId) {
        logAction(`Suspended user ${u.name} (${u.userId})`);
        return { ...u, accountStatus: 'Suspended' as const };
      }
      return u;
    });
    setUsers(updated);
    toast.success('Account suspended successfully');
  };

  // Activate
  const handleActivate = (userId: string) => {
    if (!canModify) return toast.error('Access Denied: Insufficient authorization permissions.');
    const updated = users.map(u => {
      if (u.userId === userId) {
        logAction(`Activated user ${u.name} (${u.userId})`);
        return { ...u, accountStatus: 'Active' as const };
      }
      return u;
    });
    setUsers(updated);
    toast.success('Account activated successfully');
  };

  // Reset Demo Balance
  const handleResetDemoBalance = (userId: string) => {
    if (!canModify) return toast.error('Access Denied: User directory modifications locked.');
    const target = users.find(u => u.userId === userId);
    if (!target) return;
    if (target.status !== 'Demo') {
      return toast.error('Error: Demo Balance cannot be credited to Live accounts.');
    }
    const updated = users.map(u => {
      if (u.userId === userId) {
        logAction(`Reset Demo Balance for ${u.name} to $100,000.00`);
        return { ...u, walletBalance: 100000.00 };
      }
      return u;
    });
    setUsers(updated);
    toast.success('Demo Balance reset to $100,000.00');
  };

  // Reset Password
  const handleResetPassword = (userId: string) => {
    if (!canModify) return toast.error('Access Denied');
    const target = users.find(u => u.userId === userId);
    if (!target) return;
    logAction(`Triggered Password Reset credentials rotation for ${target.name}`);
    toast.success(`Password reset link dispatched to ${target.email}`);
  };

  // Verify KYC Directly
  const handleVerifyKyc = (userId: string) => {
    if (!canModify) return toast.error('Access Denied');
    const updated = users.map(u => {
      if (u.userId === userId) {
        logAction(`Manually approved KYC validation status for ${u.name}`);
        return { ...u, kycStatus: 'Approved' as const };
      }
      return u;
    });
    setUsers(updated);
    toast.success('User identity KYC status marked as Approved');
  };

  // Delete User
  const handleDeleteUser = (userId: string) => {
    if (!canModify) return toast.error('Access Denied');
    const target = users.find(u => u.userId === userId);
    if (!target) return;
    if (confirm(`CRITICAL WARNING: Are you sure you want to permanently delete user record ${target.name}? This deletes all history.`)) {
      const updated = users.filter(u => u.userId !== userId);
      setUsers(updated);
      setSelectedUserIds(prev => prev.filter(id => id !== userId));
      logAction(`Deleted user account: ${target.name} (${target.userId})`);
      toast.success('User account record expunged');
    }
  };

  // Edit Submit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const updated = users.map(u => {
      if (u.userId === editingUser.userId) {
        logAction(`Modified profile data for user: ${u.userId}`);
        return {
          ...u,
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          country: editForm.country,
          accountType: editForm.accountType,
          status: editForm.status,
          walletBalance: Number(editForm.walletBalance)
        };
      }
      return u;
    });
    setUsers(updated);
    setEditingUser(null);
    toast.success('User credentials updated successfully');
  };

  const startEdit = (user: AdminUser) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      country: user.country,
      accountType: user.accountType,
      status: user.status,
      walletBalance: user.walletBalance
    });
  };

  // Bulk Actions
  const handleBulkAction = (actionType: 'suspend' | 'activate' | 'verify') => {
    if (!canModify) return toast.error('Access Denied');
    if (selectedUserIds.length === 0) return toast.error('No users selected');

    const updated = users.map(u => {
      if (selectedUserIds.includes(u.userId)) {
        if (actionType === 'suspend') {
          return { ...u, accountStatus: 'Suspended' as const };
        } else if (actionType === 'activate') {
          return { ...u, accountStatus: 'Active' as const };
        } else if (actionType === 'verify') {
          return { ...u, kycStatus: 'Approved' as const };
        }
      }
      return u;
    });

    logAction(`Applied Bulk Operations [${actionType}] to ${selectedUserIds.length} users.`);
    setUsers(updated);
    setSelectedUserIds([]);
    toast.success(`Successfully processed ${actionType} on selected users`);
  };

  // Export Data
  const handleExport = (type: 'csv' | 'json') => {
    const dataString = type === 'json' 
      ? JSON.stringify(filteredUsers, null, 2)
      : ['User ID,Name,Email,Phone,Country,Account Type,Status,Wallet Balance,KYC Status,Account Status,Last Login',
         ...filteredUsers.map(u => `"${u.userId}","${u.name}","${u.email}","${u.phone}","${u.country}","${u.accountType}","${u.status}",${u.walletBalance},"${u.kycStatus}","${u.accountStatus}","${u.lastLogin}"`)
        ].join('\n');

    const blob = new Blob([dataString], { type: type === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Antigravity_Users_Export_${new Date().toISOString().slice(0,10)}.${type}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logAction(`Exported User Directory catalog as ${type.toUpperCase()}`);
    toast.success(`Exported ${filteredUsers.length} records to ${type.toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      {/* Advanced Filters Card */}
      <Card className="bg-panel border-border/80 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input 
              placeholder="Search ID, name, email, country..." 
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="pl-9 bg-card"
            />
          </div>

          {/* Action Panel */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="gap-1.5 cursor-pointer bg-card">
              <Download className="w-3.5 h-3.5" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('json')} className="gap-1.5 cursor-pointer bg-card">
              <Download className="w-3.5 h-3.5" /> JSON
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Account Type</label>
            <select 
              value={filterAccountType}
              onChange={e => { setFilterAccountType(e.target.value); setCurrentPage(1); }}
              className="w-full bg-card border border-border rounded px-2 py-1.5 text-foreground outline-none"
            >
              <option value="All">All Types</option>
              <option value="Retail Trader">Retail Trader</option>
              <option value="Pro Investor">Pro Investor</option>
              <option value="Institutional Account">Institutional Account</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Demo/Live Status</label>
            <select 
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="w-full bg-card border border-border rounded px-2 py-1.5 text-foreground outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Live">Live Accounts</option>
              <option value="Demo">Demo Accounts</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">KYC Status</label>
            <select 
              value={filterKyc}
              onChange={e => { setFilterKyc(e.target.value); setCurrentPage(1); }}
              className="w-full bg-card border border-border rounded px-2 py-1.5 text-foreground outline-none"
            >
              <option value="All">All KYC</option>
              <option value="Pending">Pending Approval</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Account Status</label>
            <select 
              value={filterAccountStatus}
              onChange={e => { setFilterAccountStatus(e.target.value); setCurrentPage(1); }}
              className="w-full bg-card border border-border rounded px-2 py-1.5 text-foreground outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Datatable Card */}
      <Card className="bg-panel border-border/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input 
                    type="checkbox" 
                    onChange={toggleSelectAll}
                    checked={paginatedUsers.length > 0 && paginatedUsers.every(u => selectedUserIds.includes(u.userId))}
                    className="cursor-pointer accent-primary"
                  />
                </th>
                <th className="p-3 font-semibold text-muted-foreground">User ID</th>
                <th className="p-3 font-semibold text-muted-foreground">Name</th>
                <th className="p-3 font-semibold text-muted-foreground">Email</th>
                <th className="p-3 font-semibold text-muted-foreground">Country</th>
                <th className="p-3 font-semibold text-muted-foreground">Account Type</th>
                <th className="p-3 font-semibold text-muted-foreground">Sandbox Status</th>
                <th className="p-3 font-semibold text-muted-foreground text-right">Wallet Balance</th>
                <th className="p-3 font-semibold text-muted-foreground text-center">KYC Status</th>
                <th className="p-3 font-semibold text-muted-foreground text-center">Account Status</th>
                <th className="p-3 font-semibold text-muted-foreground text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-muted-foreground italic">
                    No users matching active filter queries found.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map(user => {
                  const isSelected = selectedUserIds.includes(user.userId);
                  return (
                    <tr key={user.userId} className={isSelected ? "bg-primary/5 hover:bg-primary/10 transition-colors" : "hover:bg-muted/20 transition-colors"}>
                      <td className="p-3 text-center">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleSelectUser(user.userId)}
                          className="cursor-pointer accent-primary"
                        />
                      </td>
                      <td className="p-3 font-mono font-bold text-[11px] text-foreground">{user.userId}</td>
                      <td className="p-3 font-semibold text-foreground">{user.name}</td>
                      <td className="p-3 text-muted-foreground">{user.email}</td>
                      <td className="p-3 text-muted-foreground">{user.country}</td>
                      <td className="p-3">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                          {user.accountType}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge variant={user.status === 'Live' ? 'default' : 'secondary'} className="text-[10px] py-0 font-bold font-mono">
                          {user.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-foreground">
                        ${user.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex px-1.5 py-0.5 text-[10px] rounded font-bold ${
                          user.kycStatus === 'Approved' ? 'bg-bullish/15 text-bullish' :
                          user.kycStatus === 'Pending' ? 'bg-amber-500/15 text-amber-500' :
                          user.kycStatus === 'Under Review' ? 'bg-blue-500/15 text-blue-500' : 'bg-bearish/15 text-bearish'
                        }`}>
                          {user.kycStatus}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                          user.accountStatus === 'Active' ? 'text-bullish' : 'text-bearish'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.accountStatus === 'Active' ? 'bg-bullish' : 'bg-bearish'}`} />
                          {user.accountStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => setViewingUser(user)}
                            title="View Profile Detail"
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => startEdit(user)}
                            title="Edit User Fields"
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {user.accountStatus === 'Active' ? (
                            <button 
                              onClick={() => handleSuspend(user.userId)}
                              title="Suspend User"
                              className="p-1 rounded hover:bg-muted text-bearish cursor-pointer"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleActivate(user.userId)}
                              title="Activate User"
                              className="p-1 rounded hover:bg-muted text-bullish cursor-pointer"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleResetPassword(user.userId)}
                            title="Trigger Password Reset Email"
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                          {user.status === 'Demo' && (
                            <button 
                              onClick={() => handleResetDemoBalance(user.userId)}
                              title="Reset Demo Funds to $100k"
                              className="p-1 rounded hover:bg-muted text-primary cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {user.kycStatus !== 'Approved' && (
                            <button 
                              onClick={() => handleVerifyKyc(user.userId)}
                              title="Instantly Verify Identity KYC"
                              className="p-1 rounded hover:bg-muted text-bullish cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteUser(user.userId)}
                            title="Delete User Record"
                            className="p-1 rounded hover:bg-muted text-bearish cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-muted/20 border-t border-border gap-4">
          <span className="text-muted-foreground text-xs">
            Showing <span className="font-semibold text-foreground">{filteredUsers.length ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
            <span className="font-semibold text-foreground">
              {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
            </span>{' '}
            of <span className="font-semibold text-foreground">{filteredUsers.length}</span> user records
          </span>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="gap-1 bg-card cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            
            <div className="flex items-center gap-1 px-3">
              <span className="text-foreground font-bold font-mono">{currentPage}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground font-mono">{totalPages}</span>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="gap-1 bg-card cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Sticky Bulk Action Panel */}
      {selectedUserIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-border shadow-2xl rounded-xl px-6 py-3 flex items-center gap-4 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="text-xs font-semibold text-foreground">
            <span className="font-mono bg-primary/20 text-primary px-2 py-0.5 rounded mr-1.5">{selectedUserIds.length}</span>
            users selected
          </span>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="text-bullish bg-panel cursor-pointer hover:bg-bullish/10 border-bullish/30" onClick={() => handleBulkAction('activate')}>
              Activate
            </Button>
            <Button size="sm" variant="outline" className="text-bearish bg-panel cursor-pointer hover:bg-bearish/10 border-bearish/30" onClick={() => handleBulkAction('suspend')}>
              Suspend
            </Button>
            <Button size="sm" variant="outline" className="text-primary bg-panel cursor-pointer hover:bg-primary/10 border-primary/30" onClick={() => handleBulkAction('verify')}>
              Verify KYC
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedUserIds([])} className="cursor-pointer text-muted-foreground hover:text-foreground">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* PROFILE DETAIL MODAL */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setViewingUser(null)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-6 space-y-6">
              {/* Header profile */}
              <div className="flex items-center gap-4 border-b border-border pb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl uppercase">
                  {viewingUser.name.slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    {viewingUser.name}
                    <Badge variant={viewingUser.status === 'Live' ? 'default' : 'secondary'} className="text-[9px] py-0 font-mono">
                      {viewingUser.status}
                    </Badge>
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">{viewingUser.userId}</p>
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block">Email Address</span>
                  <span className="text-foreground font-medium">{viewingUser.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Phone Contact</span>
                  <span className="text-foreground font-medium">{viewingUser.phone}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Country</span>
                  <span className="text-foreground font-medium">{viewingUser.country}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Trading Account Class</span>
                  <span className="text-foreground font-semibold text-primary">{viewingUser.accountType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">KYC Verification State</span>
                  <span className="font-bold text-foreground">{viewingUser.kycStatus}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Wallet Sandbox Assets</span>
                  <span className="font-mono font-bold text-bullish">${viewingUser.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Sandbox Mock Security Device & API details */}
              <div className="border-t border-border pt-4 space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Device Tracking Log</h4>
                <div className="bg-muted/20 border border-border rounded p-3 text-[11px] font-mono space-y-1 text-muted-foreground">
                  <div className="flex justify-between"><span className="text-foreground">Browser/OS:</span> Chrome 122.0.0 (macOS Sonoma)</div>
                  <div className="flex justify-between"><span className="text-foreground">IP Address:</span> 192.168.1.103</div>
                  <div className="flex justify-between"><span className="text-foreground">Last Timestamp:</span> {new Date(viewingUser.lastLogin).toLocaleString()}</div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button size="sm" onClick={() => setViewingUser(null)} className="cursor-pointer">
                  Close Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleSaveEdit}
            className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md relative overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Edit User Profile: {editingUser.userId}</h3>
              <button 
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">Full Name</label>
                <Input 
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">Email Address</label>
                <Input 
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">Phone Number</label>
                <Input 
                  value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">Country</label>
                <Input 
                  value={editForm.country}
                  onChange={e => setEditForm({ ...editForm, country: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold block">Account Class</label>
                  <select 
                    value={editForm.accountType}
                    onChange={e => setEditForm({ ...editForm, accountType: e.target.value as any })}
                    className="w-full bg-card border border-border rounded px-2.5 py-2 text-foreground outline-none mt-1"
                  >
                    <option value="Retail Trader">Retail Trader</option>
                    <option value="Pro Investor">Pro Investor</option>
                    <option value="Institutional Account">Institutional Account</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold block">Sandbox Status</label>
                  <select 
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full bg-card border border-border rounded px-2.5 py-2 text-foreground outline-none mt-1"
                  >
                    <option value="Live">Live</option>
                    <option value="Demo">Demo</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">Wallet Assets Balance ($)</label>
                <Input 
                  type="number"
                  step="0.01"
                  value={editForm.walletBalance}
                  onChange={e => setEditForm({ ...editForm, walletBalance: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-end gap-2 bg-muted/20">
              <Button type="button" variant="ghost" onClick={() => setEditingUser(null)} className="cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
