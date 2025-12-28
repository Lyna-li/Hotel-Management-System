import React, { useState } from 'react';
import { Search, Download, DollarSign, CreditCard, TrendingUp, FileText, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const initialInvoices = [
  { id: 'INV001', guest: 'John Smith', room: '401', amount: 897, date: '2024-12-25', dueDate: '2024-12-28', status: 'paid', paymentMethod: 'Credit Card' },
  { id: 'INV002', guest: 'Emma Wilson', room: '205', amount: 298, date: '2024-12-24', dueDate: '2024-12-26', status: 'pending', paymentMethod: 'Bank Transfer' },
  { id: 'INV003', guest: 'Michael Brown', room: '502', amount: 598, date: '2024-12-23', dueDate: '2024-12-25', status: 'paid', paymentMethod: 'Credit Card' },
  { id: 'INV004', guest: 'Sarah Davis', room: '108', amount: 396, date: '2024-12-22', dueDate: '2024-12-24', status: 'overdue', paymentMethod: 'Credit Card' },
  { id: 'INV005', guest: 'James Johnson', room: '312', amount: 298, date: '2024-12-21', dueDate: '2024-12-23', status: 'paid', paymentMethod: 'Cash' },
  { id: 'INV006', guest: 'Robert Taylor', room: '101', amount: 198, date: '2024-12-20', dueDate: '2024-12-22', status: 'refunded', paymentMethod: 'Credit Card' },
];

const statusStyles = {
  paid: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
  refunded: 'bg-muted text-muted-foreground border-muted',
};

const Billing = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [invoices, setInvoices] = useState(initialInvoices);
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    guest: '',
    room: '',
    amount: '',
    dueDate: '',
    status: '',
    paymentMethod: ''
  });

  const handleAddInvoice = () => {
    if (!invoiceForm.guest || !invoiceForm.room || !invoiceForm.amount || !invoiceForm.dueDate || !invoiceForm.status || !invoiceForm.paymentMethod) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    const newInvoice = {
      id: `INV${String(invoices.length + 1).padStart(3, '0')}`,
      guest: invoiceForm.guest,
      room: invoiceForm.room,
      amount: parseFloat(invoiceForm.amount),
      date: new Date().toISOString().split('T')[0],
      dueDate: invoiceForm.dueDate,
      status: invoiceForm.status,
      paymentMethod: invoiceForm.paymentMethod
    };
    setInvoices([...invoices, newInvoice]);
    toast({ title: 'Success', description: `Invoice ${newInvoice.id} created successfully` });
    setInvoiceForm({ guest: '', room: '', amount: '', dueDate: '', status: '', paymentMethod: '' });
    setIsAddInvoiceOpen(false);
  };

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.guest.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const pendingAmount = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Billing</h1>
          <p className="text-muted-foreground mt-1">Manage invoices and financial transactions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddInvoiceOpen} onOpenChange={setIsAddInvoiceOpen}>
            <DialogTrigger asChild>
              <Button variant="gold">
                <FileText className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Create New Invoice</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invGuest">Guest Name *</Label>
                    <Input
                      id="invGuest"
                      placeholder="John Doe"
                      value={invoiceForm.guest}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, guest: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invRoom">Room Number *</Label>
                    <Input
                      id="invRoom"
                      placeholder="e.g. 101"
                      value={invoiceForm.room}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, room: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invAmount">Amount ($) *</Label>
                    <Input
                      id="invAmount"
                      type="number"
                      placeholder="e.g. 500"
                      value={invoiceForm.amount}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invDueDate">Due Date *</Label>
                    <Input
                      id="invDueDate"
                      type="date"
                      value={invoiceForm.dueDate}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invPayment">Payment Method *</Label>
                  <Select value={invoiceForm.paymentMethod} onValueChange={(value) => setInvoiceForm({ ...invoiceForm, paymentMethod: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="PayPal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invStatus">Status *</Label>
                  <Select value={invoiceForm.status} onValueChange={(value) => setInvoiceForm({ ...invoiceForm, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setIsAddInvoiceOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="gold" className="flex-1" onClick={handleAddInvoice}>
                    Create Invoice
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up">
        <div className="bg-card rounded-xl p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-gold flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
          </div>
          <p className="font-display text-3xl font-bold text-foreground">${totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-success mt-1">↑ 12% from last month</p>
        </div>
        
        <div className="bg-card rounded-xl p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-warning" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Pending</span>
          </div>
          <p className="font-display text-3xl font-bold text-foreground">${pendingAmount.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">2 invoices pending</p>
        </div>
        
        <div className="bg-card rounded-xl p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Avg. Invoice</span>
          </div>
          <p className="font-display text-3xl font-bold text-foreground">$447</p>
          <p className="text-sm text-muted-foreground mt-1">Per transaction</p>
        </div>
        
        <div className="bg-card rounded-xl p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Total Invoices</span>
          </div>
          <p className="font-display text-3xl font-bold text-foreground">{invoices.length}</p>
          <p className="text-sm text-muted-foreground mt-1">This month</p>
        </div>
      </div>

      <div className="relative animate-slide-up" style={{ animationDelay: '100ms' }}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search invoices..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card border-border max-w-md"
        />
      </div>

      <div className="bg-card rounded-xl border border-border/50 overflow-hidden animate-slide-up" style={{ animationDelay: '150ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoice</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Guest</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Due Date</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-medium text-foreground">{invoice.id}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium text-foreground">{invoice.guest}</p>
                    <p className="text-xs text-muted-foreground">Room {invoice.room}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-display font-semibold text-foreground">${invoice.amount}</p>
                  </td>
                  <td className="py-4 px-6 text-sm text-muted-foreground">{invoice.date}</td>
                  <td className="py-4 px-6 text-sm text-muted-foreground">{invoice.dueDate}</td>
                  <td className="py-4 px-6 text-sm text-muted-foreground">{invoice.paymentMethod}</td>
                  <td className="py-4 px-6">
                    <Badge
                      variant="outline"
                      className={cn("capitalize", statusStyles[invoice.status])}
                    >
                      {invoice.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Billing;