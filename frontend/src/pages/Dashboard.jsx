import React, { useState, useEffect } from 'react';
import { BedDouble, CalendarCheck, Users, DollarSign, UserPlus } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { OccupancyChart } from '@/components/dashboard/OccupancyChart';
import { RecentBookings } from '@/components/dashboard/RecentBookings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

const API_BASE_URL = 'http://localhost:5000';

const Dashboard = () => {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalRooms: 0,
    todayCheckins: 0,
    activeGuests: 0,
    todayRevenue: 0
  });
  const [userForm, setUserForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    mot_de_passe: '',
    role: ''
  });

  // Fetch dashboard stats (optional - if you have this endpoint)
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // You might want to create a separate endpoint for dashboard stats
      // For now, I'll keep the static data
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const handleAddUser = async () => {
    // Validate required fields
    if (!userForm.nom || !userForm.prenom || !userForm.email || !userForm.mot_de_passe || !userForm.role) {
      toast({ 
        title: 'Error', 
        description: 'Please fill in all required fields', 
        variant: 'destructive' 
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userForm.email)) {
      toast({ 
        title: 'Error', 
        description: 'Please enter a valid email address', 
        variant: 'destructive' 
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom: userForm.nom,
          prenom: userForm.prenom,
          email: userForm.email,
          telephone: userForm.telephone || null,
          mot_de_passe: userForm.mot_de_passe,
          role: userForm.role
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add user');
      }

      toast({ 
        title: 'Success', 
        description: `User ${data.prenom} ${data.nom} added successfully` 
      });

      // Reset form and close dialog
      setUserForm({ 
        nom: '', 
        prenom: '', 
        email: '', 
        telephone: '', 
        mot_de_passe: '', 
        role: '' 
      });
      setIsAddUserOpen(false);

      // Optional: Refresh dashboard data
      fetchDashboardStats();

    } catch (error) {
      console.error('Error adding user:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to add user. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your hotel overview.</p>
        </div>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button variant="gold">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Add New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Last Name *</Label>
                  <Input
                    id="nom"
                    placeholder="Doe"
                    value={userForm.nom}
                    onChange={(e) => setUserForm({ ...userForm, nom: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prenom">First Name *</Label>
                  <Input
                    id="prenom"
                    placeholder="John"
                    value={userForm.prenom}
                    onChange={(e) => setUserForm({ ...userForm, prenom: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@email.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">Phone Number</Label>
                <Input
                  id="telephone"
                  type="tel"
                  placeholder="+1 234 567 890"
                  value={userForm.telephone}
                  onChange={(e) => setUserForm({ ...userForm, telephone: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mot_de_passe">Password *</Label>
                <Input
                  id="mot_de_passe"
                  type="password"
                  placeholder="••••••••"
                  value={userForm.mot_de_passe}
                  onChange={(e) => setUserForm({ ...userForm, mot_de_passe: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select 
                  value={userForm.role} 
                  onValueChange={(value) => setUserForm({ ...userForm, role: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="CLIENT">Customer</SelectItem>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setIsAddUserOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="gold" 
                  className="flex-1" 
                  onClick={handleAddUser}
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add User'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Rooms"
          value={dashboardStats.totalRooms || 120}
          subtitle="15 types available"
          icon={BedDouble}
          variant="default"
          delay={0}
        />
        <StatCard
          title="Today's Check-ins"
          value={dashboardStats.todayCheckins || 24}
          icon={CalendarCheck}
          trend={{ value: 12, isPositive: true }}
          variant="gold"
          delay={50}
        />
        <StatCard
          title="Active Guests"
          value={dashboardStats.activeGuests || 89}
          subtitle="Across all rooms"
          icon={Users}
          variant="success"
          delay={100}
        />
        <StatCard
          title="Today's Revenue"
          value={`$${(dashboardStats.todayRevenue || 12450).toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 8, isPositive: true }}
          variant="warning"
          delay={150}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <OccupancyChart />
        </div>
        <div className="xl:col-span-2">
          <RecentBookings />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;