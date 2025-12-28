import React, { useState, useEffect } from 'react';
import { Search, Download, DollarSign, CreditCard, TrendingUp, FileText, MoreVertical, RefreshCw, Eye, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const API_BASE_URL = 'http://localhost:5000';

// Map Prisma status to frontend status
const statusMapping = {
  PENDING: 'pending',
  SUCCESS: 'paid',
  FAILED: 'overdue',
  REFUNDED: 'refunded',
};

// Reverse mapping for API calls
const reverseStatusMapping = {
  pending: 'PENDING',
  paid: 'SUCCESS',
  overdue: 'FAILED',
  refunded: 'REFUNDED',
};

// Map Prisma payment method to display name
const paymentMethodMapping = {
  CASH: 'Cash',
  CARD: 'Credit Card',
  BANK_TRANSFER: 'Bank Transfer',
  ONLINE: 'Online',
};

const statusStyles = {
  paid: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
  refunded: 'bg-muted text-muted-foreground border-muted',
};

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const Billing = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    avgInvoice: 0,
    totalInvoices: 0
  });

  const [invoiceForm, setInvoiceForm] = useState({
    id_reservation: '',
    total: '',
    notes: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    id_reservation: '',
    montant: '',
    methode: '',
    transactionRef: '',
    received_by: ''
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchInvoices(),
        fetchPayments(),
        fetchReservations()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      const transformedInvoices = data.map(invoice => ({
        id: `INV${invoice.id_invoice.toString().padStart(3, '0')}`,
        id_invoice: invoice.id_invoice,
        id_reservation: invoice.id_reservation,
        guest: invoice.reservation?.client?.user 
          ? `${invoice.reservation.client.user.prenom} ${invoice.reservation.client.user.nom}`
          : 'Unknown Guest',
        room: invoice.reservation?.rooms?.[0]?.room?.numero || 'N/A',
        amount: invoice.total,
        date: formatDate(invoice.date_facture),
        dueDate: invoice.reservation?.date_fin 
          ? formatDate(invoice.reservation.date_fin)
          : 'N/A',
        // Determine status based on payments
        status: calculateInvoiceStatus(invoice),
        paymentMethod: getMostRecentPaymentMethod(invoice),
        invoiceData: invoice
      }));
      
      setInvoices(transformedInvoices);
      
      // Calculate stats
      const paidInvoices = transformedInvoices.filter(inv => inv.status === 'paid');
      const pendingInvoices = transformedInvoices.filter(inv => inv.status === 'pending' || inv.status === 'overdue');
      
      const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
      const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
      const avgInvoice = transformedInvoices.length > 0 
        ? transformedInvoices.reduce((sum, inv) => sum + inv.amount, 0) / transformedInvoices.length
        : 0;
      
      setStats({
        totalRevenue,
        pendingAmount,
        avgInvoice: Math.round(avgInvoice),
        totalInvoices: transformedInvoices.length
      });
      
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

 const fetchReservations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations`);
    if (response.ok) {
      const data = await response.json();
      console.log('Fetched reservations:', data);
      
      // Filter reservations without invoices (regardless of status)
      const reservationsWithoutInvoices = data.filter(reservation => 
        !reservation.invoice
      );
      
      // OR if you want to show only certain statuses:
      // const reservationsWithoutInvoices = data.filter(reservation => 
      //   !reservation.invoice && ['CONFIRMED', 'PENDING'].includes(reservation.statut)
      // );
      
      const transformedReservations = reservationsWithoutInvoices.map(res => ({
        id_reservation: res.id_reservation,
        id: `RES${res.id_reservation.toString().padStart(3, '0')}`,
        guest: res.client?.user 
          ? `${res.client.user.prenom} ${res.client.user.nom}`
          : 'Unknown Guest',
        room: res.rooms?.[0]?.room?.numero || 'N/A',
        checkIn: formatDate(res.date_debut),
        checkOut: formatDate(res.date_fin),
        totalAmount: calculateReservationTotal(res),
        nights: calculateNights(res.date_debut, res.date_fin),
        status: res.statut, // Add status for debugging
        client: res.client, // Add client data for debugging
        reservationData: res // Add full reservation data
      }));
      
      console.log('Reservations without invoices:', transformedReservations);
      setReservations(transformedReservations);
      
      // If no reservations found, show a toast
      if (transformedReservations.length === 0) {
        toast({
          title: 'Info',
          description: 'No reservations available for invoicing.',
          variant: 'default'
        });
      }
    }
  } catch (error) {
    console.error('Error fetching reservations:', error);
  }
};

  const calculateReservationTotal = (reservation) => {
    if (reservation.invoice) {
      return reservation.invoice.total;
    }
    
    // Calculate from room prices
    const nights = calculateNights(reservation.date_debut, reservation.date_fin);
    return reservation.rooms?.reduce((total, reservationRoom) => {
      return total + (reservationRoom.room?.prix_par_nuit || 0) * nights;
    }, 0) || 0;
  };

  const calculateNights = (date_debut, date_fin) => {
    if (!date_debut || !date_fin) return 0;
    const start = new Date(date_debut);
    const end = new Date(date_fin);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateInvoiceStatus = (invoice) => {
    if (!invoice.reservation?.payments) return 'pending';
    
    const successfulPayments = invoice.reservation.payments.filter(
      payment => payment.status === 'SUCCESS'
    );
    
    const totalPaid = successfulPayments.reduce((sum, payment) => sum + payment.montant, 0);
    
    if (totalPaid >= invoice.total) return 'paid';
    if (totalPaid > 0) return 'pending';
    
    // Check if invoice is overdue
    const dueDate = new Date(invoice.reservation.date_fin);
    const today = new Date();
    if (today > dueDate) return 'overdue';
    
    return 'pending';
  };

  const getMostRecentPaymentMethod = (invoice) => {
    if (!invoice.reservation?.payments || invoice.reservation.payments.length === 0) {
      return 'Not Paid';
    }
    
    const successfulPayments = invoice.reservation.payments.filter(
      payment => payment.status === 'SUCCESS'
    );
    
    if (successfulPayments.length === 0) return 'Not Paid';
    
    const latestPayment = successfulPayments.reduce((latest, payment) => {
      return new Date(payment.date_payment) > new Date(latest.date_payment) ? payment : latest;
    });
    
    return paymentMethodMapping[latestPayment.methode] || latestPayment.methode;
  };

  const handleAddInvoice = async () => {
    if (!invoiceForm.id_reservation || !invoiceForm.total) {
      toast({ 
        title: 'Error', 
        description: 'Please fill in all required fields', 
        variant: 'destructive' 
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_reservation: parseInt(invoiceForm.id_reservation, 10),
          total: parseFloat(invoiceForm.total),
          notes: invoiceForm.notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create invoice');
      }

      toast({ 
        title: 'Success', 
        description: `Invoice created successfully` 
      });

      // Reset form and refresh data
      setInvoiceForm({ id_reservation: '', total: '', notes: '' });
      setIsAddInvoiceOpen(false);
      await fetchAllData();

    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create invoice',
        variant: 'destructive'
      });
    }
  };

  const handleAddPayment = async () => {
    if (!paymentForm.id_reservation || !paymentForm.montant || !paymentForm.methode) {
      toast({ 
        title: 'Error', 
        description: 'Please fill in all required fields', 
        variant: 'destructive' 
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_reservation: parseInt(paymentForm.id_reservation, 10),
          montant: parseFloat(paymentForm.montant),
          methode: paymentForm.methode,
          transactionRef: paymentForm.transactionRef || undefined,
          received_by: paymentForm.received_by ? parseInt(paymentForm.received_by, 10) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create payment');
      }

      toast({ 
        title: 'Success', 
        description: `Payment of $${paymentForm.montant} recorded successfully` 
      });

      // Reset form and refresh data
      setPaymentForm({ 
        id_reservation: '', 
        montant: '', 
        methode: '', 
        transactionRef: '', 
        received_by: '' 
      });
      setIsAddPaymentOpen(false);
      await fetchAllData();

    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create payment',
        variant: 'destructive'
      });
    }
  };

  const handleUpdatePaymentStatus = async (paymentId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update payment status');
      }

      toast({
        title: 'Success',
        description: 'Payment status updated successfully',
      });

      await fetchAllData();

    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update payment status',
        variant: 'destructive'
      });
    }
  };

  const handleViewInvoice = (invoice) => {
    // Navigate to invoice details or open modal
    console.log('View invoice:', invoice);
    toast({
      title: 'Invoice Details',
      description: `Opening invoice ${invoice.id}`,
      variant: 'default'
    });
  };

  const handlePrintInvoice = async (invoiceId) => {
    try {
      // Generate PDF or open print dialog
      toast({
        title: 'Print Invoice',
        description: `Printing invoice ${invoiceId}`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error printing invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to print invoice',
        variant: 'destructive'
      });
    }
  };

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.guest.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.room.toString().includes(searchQuery)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Billing & Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage invoices and financial transactions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchAllData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {/* Add Payment Dialog */}
          <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CreditCard className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Record Payment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentReservation">Reservation *</Label>
                  <Select
                    value={paymentForm.id_reservation}
                    onValueChange={(value) => setPaymentForm({ ...paymentForm, id_reservation: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reservation" />
                    </SelectTrigger>
                    <SelectContent>
                      {reservations.map((res) => (
                        <SelectItem key={res.id_reservation} value={res.id_reservation.toString()}>
                          {res.client.id_client} - {res.client.user.nom} {res.client.user.prenom} (${res.totalAmount})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentAmount">Amount ($) *</Label>
                  <Input
                    id="paymentAmount"
                    type="number"
                    placeholder="e.g. 500"
                    value={paymentForm.montant}
                    onChange={(e) => setPaymentForm({ ...paymentForm, montant: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select
                    value={paymentForm.methode}
                    onValueChange={(value) => setPaymentForm({ ...paymentForm, methode: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="CARD">Credit Card</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      <SelectItem value="ONLINE">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="transactionRef">Transaction Reference</Label>
                  <Input
                    id="transactionRef"
                    placeholder="Optional transaction ID"
                    value={paymentForm.transactionRef}
                    onChange={(e) => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => setIsAddPaymentOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="gold" 
                    className="flex-1" 
                    onClick={handleAddPayment}
                    disabled={isLoading || !paymentForm.id_reservation || !paymentForm.montant || !paymentForm.methode}
                  >
                    Record Payment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Invoice Dialog */}
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
                <div className="space-y-2">
                  <Label htmlFor="invoiceReservation">Reservation *</Label>
                  <Select
                    value={invoiceForm.id_reservation}
                    onValueChange={(value) => setInvoiceForm({ ...invoiceForm, id_reservation: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reservation" />
                    </SelectTrigger>
                    <SelectContent>
                      {reservations.map((res) => (
                        <SelectItem key={res.id_reservation} value={res.id_reservation.toString()}>
                          {res.id} - {res.guest} (${res.totalAmount})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="invoiceAmount">Total Amount ($) *</Label>
                  <Input
                    id="invoiceAmount"
                    type="number"
                    placeholder="e.g. 500"
                    value={invoiceForm.total}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, total: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="invoiceNotes">Notes</Label>
                  <Input
                    id="invoiceNotes"
                    placeholder="Optional notes"
                    value={invoiceForm.notes}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => setIsAddInvoiceOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="gold" 
                    className="flex-1" 
                    onClick={handleAddInvoice}
                    disabled={isLoading || !invoiceForm.id_reservation || !invoiceForm.total}
                  >
                    Create Invoice
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading billing data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up">
            <div className="bg-card rounded-xl p-6 border border-border/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-gold flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-accent-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
              </div>
              <p className="font-display text-3xl font-bold text-foreground">
                ${stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-success mt-1">Paid invoices only</p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-warning" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Pending</span>
              </div>
              <p className="font-display text-3xl font-bold text-foreground">
                ${stats.pendingAmount.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {invoices.filter(inv => inv.status === 'pending' || inv.status === 'overdue').length} invoices
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Avg. Invoice</span>
              </div>
              <p className="font-display text-3xl font-bold text-foreground">
                ${stats.avgInvoice}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Per transaction</p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Total Invoices</span>
              </div>
              <p className="font-display text-3xl font-bold text-foreground">
                {stats.totalInvoices}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {invoices.filter(inv => inv.status === 'paid').length} paid
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative animate-slide-up" style={{ animationDelay: '100ms' }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search invoices by guest, ID, or room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border max-w-md"
              disabled={isLoading}
            />
          </div>

          {/* Invoices Table */}
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
                    <tr key={invoice.id_invoice} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-medium text-foreground">{invoice.id}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-medium text-foreground">{invoice.guest}</p>
                        <p className="text-xs text-muted-foreground">Room {invoice.room}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-display font-semibold text-foreground">
                          ${invoice.amount.toFixed(2)}
                        </p>
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
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewInvoice(invoice)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePrintInvoice(invoice.id)}
                            title="Print Invoice"
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty State */}
          {filteredInvoices.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {searchQuery ? 'No invoices found' : 'No invoices yet'}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {searchQuery 
                  ? 'Try adjusting your search query' 
                  : 'Create your first invoice from a confirmed reservation'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Billing;