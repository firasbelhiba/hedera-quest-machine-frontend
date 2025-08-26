'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  Star,
  Zap
} from 'lucide-react';
import { User } from '@/lib/types';

interface UserManagementProps {
  className?: string;
}

// Mock data - replace with actual API calls
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'user',
    avatar: '',
    level: 15,
    points: 12500,
    streak: 7,
    status: 'active',
    joinedAt: '2024-01-15',
    lastActive: '2024-01-20'
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'user',
    avatar: '',
    level: 8,
    points: 4200,
    streak: 3,
    status: 'active',
    joinedAt: '2024-02-01',
    lastActive: '2024-01-19'
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol@example.com',
    role: 'moderator',
    avatar: '',
    level: 22,
    points: 28900,
    streak: 15,
    status: 'active',
    joinedAt: '2023-11-10',
    lastActive: '2024-01-20'
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david@example.com',
    role: 'user',
    avatar: '',
    level: 3,
    points: 850,
    streak: 0,
    status: 'suspended',
    joinedAt: '2024-01-18',
    lastActive: '2024-01-18'
  }
];

export function UserManagement({ className }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter, roleFilter]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 font-mono"><CheckCircle className="w-3 h-3 mr-1" />ACTIVE</Badge>;
      case 'suspended':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 font-mono"><Ban className="w-3 h-3 mr-1" />SUSPENDED</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 font-mono"><Clock className="w-3 h-3 mr-1" />PENDING</Badge>;
      default:
        return <Badge variant="outline" className="font-mono">{status.toUpperCase()}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 font-mono"><ShieldCheck className="w-3 h-3 mr-1" />ADMIN</Badge>;
      case 'moderator':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-mono"><Shield className="w-3 h-3 mr-1" />MOD</Badge>;
      default:
        return <Badge variant="outline" className="font-mono">USER</Badge>;
    }
  };

  const handleUserAction = (userId: string, action: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        switch (action) {
          case 'suspend':
            return { ...user, status: 'suspended' };
          case 'activate':
            return { ...user, status: 'active' };
          case 'promote':
            return { ...user, role: user.role === 'user' ? 'moderator' : 'admin' };
          case 'demote':
            return { ...user, role: user.role === 'admin' ? 'moderator' : 'user' };
          default:
            return user;
        }
      }
      return user;
    }));
  };

  return (
    <div className={className}>
      <Card className="border-2 border-dashed border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-cyan-500/5">
        <CardHeader className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
          <CardTitle className="flex items-center gap-2 font-mono">
            <div className="p-1 bg-purple-500/20 rounded border border-dashed border-purple-500/40">
              <Users className="w-4 h-4 text-purple-500" />
            </div>
            USER_MANAGEMENT
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="[SEARCH_USERS]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 font-mono border-dashed border-purple-500/30 focus:border-solid"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 font-mono border-dashed border-purple-500/30">
                <SelectValue placeholder="[STATUS]" />
              </SelectTrigger>
              <SelectContent className="font-mono">
                <SelectItem value="all">[ALL_STATUS]</SelectItem>
                <SelectItem value="active">[ACTIVE]</SelectItem>
                <SelectItem value="suspended">[SUSPENDED]</SelectItem>
                <SelectItem value="pending">[PENDING]</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40 font-mono border-dashed border-purple-500/30">
                <SelectValue placeholder="[ROLE]" />
              </SelectTrigger>
              <SelectContent className="font-mono">
                <SelectItem value="all">[ALL_ROLES]</SelectItem>
                <SelectItem value="user">[USER]</SelectItem>
                <SelectItem value="moderator">[MODERATOR]</SelectItem>
                <SelectItem value="admin">[ADMIN]</SelectItem>
              </SelectContent>
            </Select>
            <Button className="font-mono border-2 border-dashed border-green-500/50 hover:border-solid bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20">
              <UserPlus className="w-4 h-4 mr-2" />
              [ADD_USER]
            </Button>
          </div>

          {/* Users Table */}
          <div className="border-2 border-dashed border-purple-500/20 rounded-lg overflow-hidden bg-gradient-to-br from-white/50 to-purple-50/30 dark:from-gray-900/50 dark:to-purple-900/10">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-b-2 border-dashed border-purple-500/30">
                  <TableHead className="font-mono font-semibold text-purple-700 dark:text-purple-300 py-4">[USER]</TableHead>
                  <TableHead className="font-mono font-semibold text-purple-700 dark:text-purple-300 py-4">[ROLE]</TableHead>
                  <TableHead className="font-mono font-semibold text-purple-700 dark:text-purple-300 py-4">[STATUS]</TableHead>
                  <TableHead className="font-mono font-semibold text-purple-700 dark:text-purple-300 py-4">[STATS]</TableHead>
                  <TableHead className="font-mono font-semibold text-purple-700 dark:text-purple-300 py-4">[JOINED]</TableHead>
                  <TableHead className="font-mono font-semibold text-purple-700 dark:text-purple-300 py-4 text-center">[ACTIONS]</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-b border-dashed border-purple-500/10 hover:bg-gradient-to-r hover:from-purple-500/8 hover:to-cyan-500/8 transition-all duration-200 group">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border-2 border-dashed border-purple-500/30 group-hover:border-solid transition-all duration-200">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-mono text-sm font-semibold">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold font-mono text-gray-900 dark:text-gray-100 truncate">{user.name}</div>
                          <div className="text-sm text-muted-foreground font-mono truncate">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="py-4">{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3 text-sm font-mono">
                        <div className="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded border border-dashed border-yellow-300/50">
                          <Trophy className="w-3.5 h-3.5 text-yellow-600" />
                          <span className="font-semibold">{user.level}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded border border-dashed border-purple-300/50">
                          <Star className="w-3.5 h-3.5 text-purple-600" />
                          <span className="font-semibold">{user.points?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded border border-dashed border-orange-300/50">
                          <Zap className="w-3.5 h-3.5 text-orange-600" />
                          <span className="font-semibold">{user.streak}d</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm py-4 text-muted-foreground">{user.joinedAt}</TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditDialogOpen(true);
                          }}
                          className="h-8 px-3 border border-dashed border-blue-500/30 hover:border-solid hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 hover:text-blue-700 transition-all duration-200"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 border border-dashed border-purple-500/30 hover:border-solid hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="font-mono border-2 border-dashed border-purple-500/30">
                          <DropdownMenuLabel>[ACTIONS]</DropdownMenuLabel>
                          <DropdownMenuSeparator className="border-dashed border-purple-500/20" />
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user);
                            setIsEditDialogOpen(true);
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            [EDIT]
                          </DropdownMenuItem>
                          {user.status === 'active' ? (
                            <DropdownMenuItem onClick={() => handleUserAction(user.id, 'suspend')} className="text-red-600">
                              <Ban className="mr-2 h-4 w-4" />
                              [SUSPEND]
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleUserAction(user.id, 'activate')} className="text-green-600">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              [ACTIVATE]
                            </DropdownMenuItem>
                          )}
                          {user.role !== 'admin' && (
                            <DropdownMenuItem onClick={() => handleUserAction(user.id, 'promote')} className="text-blue-600">
                              <Shield className="mr-2 h-4 w-4" />
                              [PROMOTE]
                            </DropdownMenuItem>
                          )}
                          {user.role !== 'user' && (
                            <DropdownMenuItem onClick={() => handleUserAction(user.id, 'demote')} className="text-orange-600">
                              <Shield className="mr-2 h-4 w-4" />
                              [DEMOTE]
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className="border-dashed border-purple-500/20" />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            [DELETE]
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-4 rounded-lg border border-dashed border-blue-500/20">
              <div className="text-2xl font-bold font-mono text-blue-500">{users.length}</div>
              <div className="text-sm text-muted-foreground font-mono">TOTAL_USERS</div>
            </div>
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-4 rounded-lg border border-dashed border-green-500/20">
              <div className="text-2xl font-bold font-mono text-green-500">{users.filter(u => u.status === 'active').length}</div>
              <div className="text-sm text-muted-foreground font-mono">ACTIVE_USERS</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 p-4 rounded-lg border border-dashed border-purple-500/20">
              <div className="text-2xl font-bold font-mono text-purple-500">{users.filter(u => u.role === 'admin' || u.role === 'moderator').length}</div>
              <div className="text-sm text-muted-foreground font-mono">STAFF_MEMBERS</div>
            </div>
            <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 p-4 rounded-lg border border-dashed border-red-500/20">
              <div className="text-2xl font-bold font-mono text-red-500">{users.filter(u => u.status === 'suspended').length}</div>
              <div className="text-sm text-muted-foreground font-mono">SUSPENDED</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="font-mono border-2 border-dashed border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
              [EDIT_USER]
            </DialogTitle>
            <DialogDescription>
              Modify user details and permissions.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium font-mono">[NAME]</label>
                  <Input defaultValue={selectedUser.name} className="font-mono border-dashed" />
                </div>
                <div>
                  <label className="text-sm font-medium font-mono">[EMAIL]</label>
                  <Input defaultValue={selectedUser.email} className="font-mono border-dashed" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium font-mono">[ROLE]</label>
                  <Select defaultValue={selectedUser.role}>
                    <SelectTrigger className="font-mono border-dashed">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="font-mono">
                      <SelectItem value="user">[USER]</SelectItem>
                      <SelectItem value="moderator">[MODERATOR]</SelectItem>
                      <SelectItem value="admin">[ADMIN]</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium font-mono">[STATUS]</label>
                  <Select defaultValue={selectedUser.status}>
                    <SelectTrigger className="font-mono border-dashed">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="font-mono">
                      <SelectItem value="active">[ACTIVE]</SelectItem>
                      <SelectItem value="suspended">[SUSPENDED]</SelectItem>
                      <SelectItem value="pending">[PENDING]</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="font-mono border-dashed">
              [CANCEL]
            </Button>
            <Button onClick={() => setIsEditDialogOpen(false)} className="font-mono bg-gradient-to-r from-purple-500 to-cyan-500">
              [SAVE_CHANGES]
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserManagement;