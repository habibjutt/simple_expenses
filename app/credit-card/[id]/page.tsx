"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUpcomingInvoice, payInvoice } from "@/app/api/credit-card-action";
import { getBankAccounts } from "@/app/api/bank-account-action";
import { deleteInvoice, unpayInvoice } from "@/app/api/invoice-action";
import { deleteTransaction } from "@/app/api/transaction-action";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, DollarSign, CreditCard, Clock, ChevronLeft, ChevronRight, CheckCircle, Wallet, Pencil, Trash2, XCircle, Utensils, ShoppingCart, Home, Car, Coffee, Gift, Heart, TrendingUp, TrendingDown, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import TransactionModal from "@/components/transaction-modal";
import Footer from "@/components/Footer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type Transaction = {
  id: string;
  name: string;
  amount: number;
  date: Date;
  category: string;
  installments: number;
  createdAt: Date;
};

type BankAccount = {
  id: string;
  name: string;
  currentBalance: number;
};

type Invoice = {
  id: string;
  isPaid: boolean;
  paidAmount: number;
  totalAmount: number;
  creditFromPreviousMonth: number;
  paidAt: Date | null;
  paidFromBankAccount: BankAccount | null;
};

type InvoiceData = {
  billStartDate: Date;
  billEndDate: Date;
  paymentDueDate: Date;
  transactions: Transaction[];
  totalAmount: number;
  card: {
    id: string;
    name: string;
    cardLimit: number;
    availableBalance: number;
    billGenerationDate: number;
    paymentDate: number;
  };
  invoice: Invoice | null;
};

export default function CreditCardDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const cardId = params.id as string;
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Month navigation state - default to null to let backend determine the correct period
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  
  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editBankAccountId, setEditBankAccountId] = useState<string>("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  
  // Delete confirmation state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // Transaction edit/delete state
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<{
    id: string;
    name: string;
    amount: number;
    date: Date;
    category: string;
    installments: number;
    creditCardId: string | null;
    bankAccountId: string | null;
  } | null>(null);
  const [isDeleteTransactionConfirmOpen, setIsDeleteTransactionConfirmOpen] = useState(false);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const [transactionDeleteLoading, setTransactionDeleteLoading] = useState(false);
  const [transactionDeleteError, setTransactionDeleteError] = useState<string | null>(null);
  
  // Filter state
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterName, setFilterName] = useState("");

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        setLoading(true);
        const data = await getUpcomingInvoice(cardId, selectedMonth, selectedYear);
        console.log('Invoice data received:', data);
        console.log('Invoice object:', data.invoice);
        console.log('isPaid:', data.invoice?.isPaid);
        console.log('paidAt:', data.invoice?.paidAt);
        
        // DEBUG: Check all invoices for this card
        const { debugListInvoices } = await import('@/app/api/credit-card-action');
        const allInvoices = await debugListInvoices(cardId);
        console.log('ALL INVOICES:', allInvoices);
        
        setInvoiceData(data);
      } catch (err: any) {
        setError(err.message || "Failed to load invoice data");
      } finally {
        setLoading(false);
      }
    };

    if (cardId) {
      fetchInvoiceData();
    }
  }, [cardId, selectedMonth, selectedYear]);
  
  const handlePreviousMonth = () => {
    // Initialize from invoice data if not set
    if (selectedMonth === undefined || selectedYear === undefined) {
      if (!invoiceData) return;
      const billDate = new Date(invoiceData.billStartDate);
      const prevMonth = billDate.getMonth() === 0 ? 11 : billDate.getMonth() - 1;
      const prevYear = billDate.getMonth() === 0 ? billDate.getFullYear() - 1 : billDate.getFullYear();
      setSelectedMonth(prevMonth);
      setSelectedYear(prevYear);
    } else if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };
  
  const handleNextMonth = () => {
    // Initialize from invoice data if not set
    if (selectedMonth === undefined || selectedYear === undefined) {
      if (!invoiceData) return;
      const billDate = new Date(invoiceData.billStartDate);
      const nextMonth = billDate.getMonth() === 11 ? 0 : billDate.getMonth() + 1;
      const nextYear = billDate.getMonth() === 11 ? billDate.getFullYear() + 1 : billDate.getFullYear();
      setSelectedMonth(nextMonth);
      setSelectedYear(nextYear);
    } else if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };
  
  const handleCurrentMonth = () => {
    setSelectedMonth(undefined);
    setSelectedYear(undefined);
  };
  
  const getMonthYearLabel = () => {
    if (!invoiceData) return "...";
    const date = new Date(invoiceData.billStartDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };
  
  const getPreviousMonthLabel = () => {
    if (!invoiceData) return "...";
    const billDate = new Date(invoiceData.billStartDate);
    const prevMonth = billDate.getMonth() === 0 ? 11 : billDate.getMonth() - 1;
    const prevYear = billDate.getMonth() === 0 ? billDate.getFullYear() - 1 : billDate.getFullYear();
    const date = new Date(prevYear, prevMonth, 1);
    return date.toLocaleDateString("en-US", { month: "short" });
  };
  
  const getNextMonthLabel = () => {
    if (!invoiceData) return "...";
    const billDate = new Date(invoiceData.billStartDate);
    const nextMonth = billDate.getMonth() === 11 ? 0 : billDate.getMonth() + 1;
    const nextYear = billDate.getMonth() === 11 ? billDate.getFullYear() + 1 : billDate.getFullYear();
    const date = new Date(nextYear, nextMonth, 1);
    return date.toLocaleDateString("en-US", { month: "short" });
  };
  
  const isCurrentMonth = () => {
    return selectedMonth === undefined && selectedYear === undefined;
  };
  
  const handleOpenPaymentModal = async () => {
    try {
      const accounts = await getBankAccounts();
      setBankAccounts(accounts);
      setIsPaymentModalOpen(true);
      setPaymentError(null);
      setSelectedBankAccountId("");
      // Set default payment amount to the invoice amount (after applying credit from previous month)
      const creditFromPrevious = invoiceData?.invoice?.creditFromPreviousMonth || 0;
      const paidSoFar = invoiceData?.invoice?.paidAmount || 0;
      const invoiceTotal = invoiceData?.totalAmount || 0;
      const amountOwed = invoiceTotal - creditFromPrevious;
      const remaining = Math.max(0, amountOwed - paidSoFar);
      setPaymentAmount(remaining.toString());
    } catch (err: any) {
      setPaymentError(err.message || "Failed to load bank accounts");
    }
  };
  
  const handlePayInvoice = async () => {
    if (!selectedBankAccountId || !invoiceData) {
      setPaymentError("Please select a bank account");
      return;
    }
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setPaymentError("Please enter a valid payment amount");
      return;
    }
    
    try {
      setPaymentLoading(true);
      setPaymentError(null);
      
      await payInvoice(
        cardId,
        selectedBankAccountId,
        invoiceData.billStartDate,
        invoiceData.billEndDate,
        invoiceData.paymentDueDate,
        amount
      );
      
      // Refresh invoice data
      const data = await getUpcomingInvoice(cardId, selectedMonth, selectedYear);
      setInvoiceData(data);
      
      setIsPaymentModalOpen(false);
      setSelectedBankAccountId("");
      setPaymentAmount("");
    } catch (err: any) {
      setPaymentError(err.message || "Failed to pay invoice");
    } finally {
      setPaymentLoading(false);
    }
  };
  
  const handleOpenEditModal = async () => {
    if (!invoiceData?.invoice) return;
    
    try {
      const accounts = await getBankAccounts();
      setBankAccounts(accounts);
      setEditBankAccountId(invoiceData.invoice.paidFromBankAccount?.id || "");
      setIsEditModalOpen(true);
      setEditError(null);
    } catch (err: any) {
      setEditError(err.message || "Failed to load bank accounts");
    }
  };
  
  const handleUnpayInvoice = async () => {
    if (!invoiceData?.invoice) return;
    
    try {
      setEditLoading(true);
      setEditError(null);
      
      await unpayInvoice(invoiceData.invoice.id);
      
      // Refresh invoice data
      const data = await getUpcomingInvoice(cardId, selectedMonth, selectedYear);
      setInvoiceData(data);
      
      setIsEditModalOpen(false);
    } catch (err: any) {
      setEditError(err.message || "Failed to unpay invoice");
    } finally {
      setEditLoading(false);
    }
  };
  
  const handleDeleteInvoice = async () => {
    if (!invoiceData?.invoice) return;
    
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      
      await deleteInvoice(invoiceData.invoice.id);
      
      // Refresh invoice data
      const data = await getUpcomingInvoice(cardId, selectedMonth, selectedYear);
      setInvoiceData(data);
      
      setIsDeleteConfirmOpen(false);
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete invoice");
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction({
      id: transaction.id,
      name: transaction.name,
      amount: transaction.amount,
      date: transaction.date,
      category: transaction.category,
      installments: transaction.installments,
      creditCardId: cardId,
      bankAccountId: null,
    });
    setIsTransactionModalOpen(true);
  };
  
  const handleDeleteTransaction = async () => {
    if (!deletingTransactionId) return;
    
    try {
      setTransactionDeleteLoading(true);
      setTransactionDeleteError(null);
      
      await deleteTransaction(deletingTransactionId);
      
      // Refresh invoice data
      const data = await getUpcomingInvoice(cardId, selectedMonth, selectedYear);
      setInvoiceData(data);
      
      setIsDeleteTransactionConfirmOpen(false);
      setDeletingTransactionId(null);
    } catch (err: any) {
      setTransactionDeleteError(err.message || "Failed to delete transaction");
    } finally {
      setTransactionDeleteLoading(false);
    }
  };
  
  const handleTransactionSuccess = async () => {
    // Refresh invoice data after edit
    const data = await getUpcomingInvoice(cardId, selectedMonth, selectedYear);
    setInvoiceData(data);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  const getCategoryIcon = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes("food") || categoryLower.includes("restaurant")) {
      return <Utensils className="h-5 w-5" />;
    } else if (categoryLower.includes("grocery") || categoryLower.includes("groceries") || categoryLower.includes("supermarket")) {
      return <ShoppingCart className="h-5 w-5" />;
    } else if (categoryLower.includes("home") || categoryLower.includes("rent") || categoryLower.includes("utilities")) {
      return <Home className="h-5 w-5" />;
    } else if (categoryLower.includes("transport") || categoryLower.includes("car") || categoryLower.includes("gas")) {
      return <Car className="h-5 w-5" />;
    } else if (categoryLower.includes("coffee") || categoryLower.includes("cafe")) {
      return <Coffee className="h-5 w-5" />;
    } else if (categoryLower.includes("gift") || categoryLower.includes("shopping")) {
      return <Gift className="h-5 w-5" />;
    } else if (categoryLower.includes("health") || categoryLower.includes("medical")) {
      return <Heart className="h-5 w-5" />;
    } else {
      return <DollarSign className="h-5 w-5" />;
    }
  };
  
  const getCategoryColor = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes("food") || categoryLower.includes("restaurant")) {
      return "bg-pink-500";
    } else if (categoryLower.includes("grocery") || categoryLower.includes("groceries")) {
      return "bg-orange-500";
    } else if (categoryLower.includes("home") || categoryLower.includes("rent")) {
      return "bg-blue-500";
    } else if (categoryLower.includes("transport") || categoryLower.includes("car")) {
      return "bg-green-500";
    } else if (categoryLower.includes("coffee")) {
      return "bg-amber-600";
    } else if (categoryLower.includes("gift") || categoryLower.includes("shopping")) {
      return "bg-purple-500";
    } else if (categoryLower.includes("health")) {
      return "bg-red-500";
    } else {
      return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        {/* <Header /> */}
        <main className="p-4 md:p-6 pb-24">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-gray-500">Loading invoice details...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !invoiceData) {
    return (
      <div className="max-w-7xl mx-auto">
        {/* <Header /> */}
        <main className="p-4 md:p-6 pb-24">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-red-500">{error || "Failed to load invoice data"}</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { card, billStartDate, billEndDate, paymentDueDate, transactions, totalAmount } = invoiceData;
  const usedAmount = card.cardLimit - card.availableBalance;
  const usagePercentage = (usedAmount / card.cardLimit) * 100;
  
  // Sort transactions by createdAt (most recently added first), then group by date
  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  // Apply filters
  const filteredTransactions = sortedTransactions.filter((transaction) => {
    // Apply category filter
    if (filterCategory && transaction.category.toLowerCase() !== filterCategory.toLowerCase()) {
      return false;
    }
    // Apply name filter (case-insensitive)
    if (filterName && !transaction.name.toLowerCase().includes(filterName.toLowerCase())) {
      return false;
    }
    return true;
  });
  
  // Calculate total of filtered transactions
  const filteredTotal = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  
  // Get unique categories for filter suggestions
  const uniqueCategories = Array.from(new Set(transactions.map(t => t.category))).sort();
  
  // Check if any filters are active
  const hasActiveFilters = filterCategory !== "" || filterName !== "";
  
  // Clear all filters
  const clearFilters = () => {
    setFilterCategory("");
    setFilterName("");
  };
  
  const groupedTransactions = filteredTransactions.reduce((groups: Record<string, Transaction[]>, transaction) => {
    const dateKey = new Date(transaction.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
    });
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(transaction);
    return groups;
  }, {});

  const previousBalance = -(invoiceData.invoice?.creditFromPreviousMonth || 0); // Negative because it's a credit
  const monthSpending = totalAmount;
  const invoiceAmount = totalAmount - (invoiceData.invoice?.creditFromPreviousMonth || 0);

  return (
    <div className="max-w-7xl mx-auto min-h-screen flex flex-col bg-white">
      <main className="flex-1 p-4 md:p-6 pb-24">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-2">
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            size="sm"
            className="h-9 px-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-sm font-bold">Invoice Details</h1>
          <div className="w-9"></div> {/* Spacer for centering */}
        </div>

        {/* Month Navigation */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousMonth}
            className="h-10 px-3 hover:bg-gray-100 text-gray-700"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="ml-1 font-medium">{getPreviousMonthLabel()}</span>
          </Button>
          
          <div className="px-6 py-2.5 bg-slate-900 text-white rounded-full shadow-md">
            <span className="font-semibold text-base">{getMonthYearLabel()}</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextMonth}
            className="h-10 px-3 hover:bg-gray-100 text-gray-700"
            aria-label="Next month"
          >
            <span className="mr-1 font-medium">{getNextMonthLabel()}</span>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Invoice Card */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-4">
          {/* Left Card - Invoice Status */}
          <Card className="shadow-lg border-2 border-gray-100 hover:border-gray-200 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  invoiceData.invoice?.isPaid ? 'bg-green-100' : 'bg-orange-100'
                }`}>
                  <CreditCard className={`h-7 w-7 ${
                    invoiceData.invoice?.isPaid ? 'text-green-700' : 'text-orange-700'
                  }`} />
                </div>
                <div>
                  <div className={`text-base font-bold ${
                    invoiceData.invoice?.isPaid ? 'text-green-700' : 'text-orange-700'
                  }`}>
                    {invoiceData.invoice?.isPaid ? 'Paid' : 'Open'}
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mt-0.5">{card.name}</div>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="pb-2 border-b border-gray-100">
                  <div className="text-gray-600 font-medium mb-1">Closes on</div>
                  <div className="font-bold text-gray-900 text-base">
                    {new Date(billEndDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 font-medium mb-1">Due on</div>
                  <div className="font-bold text-gray-900 text-base">
                    {new Date(paymentDueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Card - Financial Summary */}
          <Card className="shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 text-white border-2 border-slate-700">
            <CardContent className="p-4 space-y-4">
              <div>
                <div className="text-slate-300 text-xs font-medium mb-1.5">Previous Balance</div>
                <div className={`text-base font-bold ${
                  previousBalance < 0 ? 'text-green-300' : 'text-red-300'
                }`}>
                  {formatCurrency(previousBalance)}
                </div>
              </div>
              
              <div>
                <div className="text-slate-300 text-xs font-medium mb-1.5">Month Spending</div>
                <div className="text-base font-bold text-red-300">
                  {formatCurrency(monthSpending)}
                </div>
              </div>
              
              <div className="pt-3 border-t border-slate-600">
                <div className="text-slate-300 text-xs font-medium mb-1.5">Invoice Amount</div>
                <div className={`text-lg font-bold ${
                  invoiceAmount < 0 ? 'text-green-300' : 'text-red-300'
                }`}>
                  {formatCurrency(invoiceAmount)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pay Invoice Button */}
        {!invoiceData.invoice?.isPaid && invoiceAmount > 0 && (
          <Button
            onClick={handleOpenPaymentModal}
            className="w-full h-14 text-base font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all mb-4"
            aria-label="Pay invoice"
          >
            <Wallet className="h-5 w-5 mr-2" />
            Pay Invoice
          </Button>
        )}

        {/* Credit Balance Banner - shown when invoice amount is negative (excess payment) */}
        {invoiceAmount < 0 && !invoiceData.invoice?.isPaid && (
          <div className="mb-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 text-green-800">
              <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
              <div className="flex-1">
                <div className="font-bold text-base mb-1">Credit Balance Available</div>
                <div className="text-sm text-green-700">You have a credit of <span className="font-semibold">{formatCurrency(Math.abs(invoiceAmount))}</span> that will be applied to future invoices.</div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Status Banner */}
        {invoiceData.invoice?.isPaid && (
          <div className="mb-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 text-green-800 font-bold text-base">
                <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
                <span>Fully Paid{invoiceData.invoice.paidAt && ` on ${new Date(invoiceData.invoice.paidAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleOpenEditModal}
                  variant="outline"
                  size="sm"
                  className="text-xs h-9 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium"
                  aria-label="Edit invoice"
                >
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
                <Button
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  variant="outline"
                  size="sm"
                  className="text-xs h-9 text-red-700 border-red-300 hover:bg-red-50 hover:border-red-400 font-medium"
                  aria-label="Delete invoice"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {invoiceData.invoice && invoiceData.invoice.paidAmount > 0 && !invoiceData.invoice.isPaid && (
          <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
            <div className="text-sm text-blue-900 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                <span className="font-bold text-base">Partially Paid:</span>
                <span className="font-bold text-green-700 text-base">{formatCurrency(invoiceData.invoice.paidAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-base">Remaining:</span>
                <span className="font-bold text-red-700 text-base">{formatCurrency(Math.max(0, invoiceAmount - invoiceData.invoice.paidAmount))}</span>
              </div>
              <div className="flex gap-2 pt-3">
                <Button
                  onClick={handleOpenEditModal}
                  variant="outline"
                  size="sm"
                  className="text-xs h-9 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium"
                  aria-label="Edit invoice"
                >
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
                <Button
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  variant="outline"
                  size="sm"
                  className="text-xs h-9 text-red-700 border-red-300 hover:bg-red-50 hover:border-red-400 font-medium"
                  aria-label="Delete invoice"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Section */}
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterDialogOpen(true)}
            className="flex items-center gap-2 h-10 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium"
            aria-label="Open filters"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {(filterCategory ? 1 : 0) + (filterName ? 1 : 0)}
              </span>
            )}
          </Button>
          
          {hasActiveFilters && (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                {filterCategory && (
                  <div className="flex items-center gap-1.5 bg-blue-100 text-blue-900 px-3 py-1.5 rounded-md text-sm font-medium border border-blue-200">
                    <span>Category: {filterCategory}</span>
                    <button
                      onClick={() => setFilterCategory("")}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                      aria-label="Remove category filter"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                {filterName && (
                  <div className="flex items-center gap-1.5 bg-blue-100 text-blue-900 px-3 py-1.5 rounded-md text-sm font-medium border border-blue-200">
                    <span>Name: {filterName}</span>
                    <button
                      onClick={() => setFilterName("")}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                      aria-label="Remove name filter"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-10 text-sm text-red-700 hover:text-red-800 hover:bg-red-50 font-medium"
                aria-label="Clear all filters"
              >
                Clear all
              </Button>
            </>
          )}
        </div>

        {/* Filter Summary */}
        {hasActiveFilters && filteredTransactions.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-sm text-blue-900 font-medium">
                <span className="font-bold text-base">{filteredTransactions.length}</span> transaction{filteredTransactions.length !== 1 ? 's' : ''} found
              </div>
              <div className="text-sm font-bold">
                Total: <span className={`text-base ${filteredTotal < 0 ? "text-green-700" : "text-red-700"}`}>
                  {formatCurrency(Math.abs(filteredTotal))}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Transactions List - Simplified */}
        <div className="mb-20">
          {transactions.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-gray-600 text-base font-medium">No transactions in this billing period</p>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(groupedTransactions).map(([dateKey, dayTransactions]) => (
                <div key={dateKey}>
                  <div className="text-sm font-bold text-gray-700 mb-3 px-1">
                    {dateKey}
                  </div>
                  <div className="space-y-2">
                    {dayTransactions.map((transaction) => {
                      const isIncome = transaction.amount < 0;
                      return (
                        <div 
                          key={transaction.id} 
                          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Category Icon */}
                            <div className={`w-12 h-12 ${isIncome ? 'bg-green-100 border-2 border-green-200' : 'bg-red-100 border-2 border-red-200'} rounded-full flex items-center justify-center shrink-0 shadow-sm`}>
                              <div className={`${isIncome ? 'text-green-700' : 'text-red-700'} text-xs font-bold`}>
                                {transaction.category.substring(0, 2).toUpperCase()}
                              </div>
                            </div>
                            
                            {/* Transaction Info */}
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-base text-gray-900 truncate mb-1">
                                {transaction.name}
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                {transaction.installments > 1 && (
                                  <div className="text-xs text-gray-600 font-medium bg-gray-100 px-2 py-0.5 rounded">
                                    {transaction.installments} installments
                                  </div>
                                )}
                                {/* Amount - shown below name on mobile */}
                                <div className={`text-sm font-bold ${isIncome ? 'text-green-700' : 'text-red-700'}`}>
                                  {isIncome ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              onClick={() => handleEditTransaction(transaction)}
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 hover:bg-blue-50"
                              aria-label="Edit transaction"
                            >
                              <Pencil className="h-4 w-4 text-blue-700" />
                            </Button>
                            <Button
                              onClick={() => {
                                setDeletingTransactionId(transaction.id);
                                setIsDeleteTransactionConfirmOpen(true);
                              }}
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 hover:bg-red-50"
                              aria-label="Delete transaction"
                            >
                              <Trash2 className="h-4 w-4 text-red-700" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {/* Floating Action Button */}
      <button
        onClick={() => setIsTransactionModalOpen(true)}
        className="fixed bottom-28 right-6 w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all z-20 border-2 border-red-700"
        aria-label="Add transaction"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
      
      <Footer />
      
      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pay Invoice</DialogTitle>
            <DialogDescription>
              Select a bank account and enter the amount you want to pay.
            </DialogDescription>
          </DialogHeader>
          
          {invoiceData && (
            <div className="space-y-4">
              <div className="p-5 bg-gray-50 border-2 border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-700">Total Invoice Amount:</span>
                  <span className="text-lg font-bold text-red-700">
                    {formatCurrency(invoiceData.totalAmount)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Billing Period: {formatDate(invoiceData.billStartDate)} - {formatDate(invoiceData.billEndDate)}
                </div>
                {invoiceData.invoice && invoiceData.invoice.paidAmount > 0 && (
                  <div className="mt-4 pt-4 border-t-2 border-gray-300">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-gray-700 font-semibold">Already Paid:</span>
                      <span className="font-bold text-green-700 text-base">
                        {formatCurrency(invoiceData.invoice.paidAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700 font-semibold">Remaining:</span>
                      <span className="font-bold text-red-700 text-base">
                        {formatCurrency(invoiceData.totalAmount - invoiceData.invoice.paidAmount)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment-amount" className="text-base font-semibold text-gray-900">Payment Amount <span className="text-red-600">*</span></Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 font-semibold text-lg">$</span>
                  <input
                    id="payment-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={invoiceData.totalAmount - (invoiceData.invoice?.paidAmount || 0)}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium"
                    placeholder="0.00"
                    disabled={paymentLoading}
                    aria-label="Payment amount"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentAmount((invoiceData.totalAmount - (invoiceData.invoice?.paidAmount || 0)).toString())}
                    disabled={paymentLoading}
                    className="text-sm font-medium border-gray-300 hover:bg-gray-50"
                  >
                    Full Amount
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentAmount(((invoiceData.totalAmount - (invoiceData.invoice?.paidAmount || 0)) / 2).toFixed(2))}
                    disabled={paymentLoading}
                    className="text-sm font-medium border-gray-300 hover:bg-gray-50"
                  >
                    50%
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bank-account" className="text-base font-semibold text-gray-900">Select Bank Account <span className="text-red-600">*</span></Label>
                <select
                  id="bank-account"
                  value={selectedBankAccountId}
                  onChange={(e) => setSelectedBankAccountId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium bg-white"
                  disabled={paymentLoading}
                  aria-label="Select bank account"
                >
                  <option value="">-- Select an account --</option>
                  {bankAccounts.map((account) => {
                    const payAmount = parseFloat(paymentAmount) || 0;
                    const hasBalance = account.currentBalance >= payAmount;
                    return (
                      <option 
                        key={account.id} 
                        value={account.id}
                        disabled={!hasBalance && payAmount > 0}
                      >
                        {account.name} - {formatCurrency(account.currentBalance)}
                        {!hasBalance && payAmount > 0 && " (Insufficient balance)"}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              {parseFloat(paymentAmount) > 0 && parseFloat(paymentAmount) < (invoiceData.totalAmount - (invoiceData.invoice?.paidAmount || 0)) && (
                <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                  <p className="text-sm text-blue-900 font-medium">
                    <strong className="font-bold">Partial Payment:</strong> After paying {formatCurrency(parseFloat(paymentAmount))}, 
                    you will still owe <strong className="font-bold text-red-700">{formatCurrency((invoiceData.totalAmount - (invoiceData.invoice?.paidAmount || 0)) - parseFloat(paymentAmount))}</strong> on this invoice.
                  </p>
                </div>
              )}
              
              {paymentError && (
                <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                  <p className="text-sm text-red-800 font-semibold">{paymentError}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPaymentModalOpen(false)}
              disabled={paymentLoading}
              className="font-medium border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayInvoice}
              disabled={paymentLoading || !selectedBankAccountId || !paymentAmount}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md"
            >
              {paymentLoading ? "Processing..." : "Pay Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Invoice Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Invoice Payment</DialogTitle>
            <DialogDescription>
              You can change the bank account used for payment or mark the invoice as unpaid.
            </DialogDescription>
          </DialogHeader>
          
          {invoiceData && (
            <div className="space-y-4">
              <div className="p-5 bg-gray-50 border-2 border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-700">Invoice Amount:</span>
                  <span className="text-lg font-bold text-red-700">
                    {formatCurrency(invoiceData.totalAmount)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Billing Period: {formatDate(invoiceData.billStartDate)} - {formatDate(invoiceData.billEndDate)}
                </div>
                {invoiceData.invoice?.paidFromBankAccount && (
                  <div className="text-sm text-gray-700 font-medium mt-3 pt-3 border-t-2 border-gray-300">
                    Currently paid from: <span className="font-bold">{invoiceData.invoice.paidFromBankAccount.name}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={handleUnpayInvoice}
                  variant="outline"
                  className="w-full justify-start h-12 text-base font-medium border-gray-300 hover:bg-gray-50"
                  disabled={editLoading}
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Mark as Unpaid (Reverse Payment)
                </Button>
                
                <div className="text-sm text-gray-600 text-center font-medium">or</div>
                
                <p className="text-sm text-gray-700 font-medium text-center">Change payment source (coming soon)</p>
              </div>
              
              {editError && (
                <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                  <p className="text-sm text-red-800 font-semibold">{editError}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={editLoading}
              className="font-medium border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Invoice Confirmation Modal */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {invoiceData && (
            <div className="space-y-4">
              <div className="p-5 bg-red-50 border-2 border-red-300 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-red-800 font-bold">Invoice Amount:</span>
                  <span className="text-lg font-bold text-red-700">
                    {formatCurrency(invoiceData.totalAmount)}
                  </span>
                </div>
                <div className="text-sm text-red-700 font-medium">
                  Billing Period: {formatDate(invoiceData.billStartDate)} - {formatDate(invoiceData.billEndDate)}
                </div>
              </div>
              
              {invoiceData.invoice?.isPaid && (
                <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                  <p className="text-sm text-yellow-900 font-semibold mb-2">
                    <strong className="font-bold">Note:</strong> This invoice has been paid. Deleting it will reverse the payment transaction:
                  </p>
                  <ul className="text-sm text-yellow-800 mt-2 ml-4 list-disc space-y-1 font-medium">
                    <li>Money will be returned to the bank account</li>
                    <li>Credit card available balance will be reduced</li>
                  </ul>
                </div>
              )}
              
              {deleteError && (
                <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                  <p className="text-sm text-red-800 font-semibold">{deleteError}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
              disabled={deleteLoading}
              className="font-medium border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteInvoice}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md"
            >
              {deleteLoading ? "Deleting..." : "Delete Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Transaction Edit Modal */}
      <TransactionModal
        open={isTransactionModalOpen}
        setOpen={setIsTransactionModalOpen}
        creditCards={[{ id: card.id, name: card.name, availableBalance: card.availableBalance }]}
        bankAccounts={bankAccounts}
        onSuccess={handleTransactionSuccess}
        editTransaction={editingTransaction}
      />
      
      {/* Delete Transaction Confirmation Modal */}
      <Dialog open={isDeleteTransactionConfirmOpen} onOpenChange={setIsDeleteTransactionConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone and will update your credit card balance.
            </DialogDescription>
          </DialogHeader>
          
          {transactionDeleteError && (
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <p className="text-sm text-red-800 font-semibold">{transactionDeleteError}</p>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteTransactionConfirmOpen(false);
                setDeletingTransactionId(null);
                setTransactionDeleteError(null);
              }}
              disabled={transactionDeleteLoading}
              className="font-medium border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteTransaction}
              disabled={transactionDeleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md"
            >
              {transactionDeleteLoading ? "Deleting..." : "Delete Transaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Transactions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Category Filter */}
            <div className="space-y-2">
              <Label htmlFor="filter-category">Category</Label>
              <Input
                id="filter-category"
                placeholder="Enter category name"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                list="categories"
              />
              <datalist id="categories">
                {uniqueCategories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
              {uniqueCategories.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  Available categories: {uniqueCategories.join(", ")}
                </div>
              )}
            </div>

            {/* Name Filter */}
            <div className="space-y-2">
              <Label htmlFor="filter-name">Transaction Name</Label>
              <Input
                id="filter-name"
                placeholder="Search by name (case-insensitive)"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Search will match any part of the transaction name
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between gap-2 pt-2">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex-1"
              >
                Clear Filters
              </Button>
              <Button
                onClick={() => setFilterDialogOpen(false)}
                className="flex-1"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
