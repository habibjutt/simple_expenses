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
import Header from "@/components/Header";
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
  
  // Month navigation state
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  
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
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };
  
  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };
  
  const handleCurrentMonth = () => {
    const now = new Date();
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
  };
  
  const getMonthYearLabel = () => {
    const date = new Date(selectedYear, selectedMonth);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };
  
  const getPreviousMonthLabel = () => {
    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    const date = new Date(prevYear, prevMonth);
    return date.toLocaleDateString("en-US", { month: "short" }) + ". " + date.getDate();
  };
  
  const getNextMonthLabel = () => {
    const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
    const nextYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
    const date = new Date(nextYear, nextMonth);
    return date.toLocaleDateString("en-US", { month: "short" }) + ". " + date.getDate();
  };
  
  const isCurrentMonth = () => {
    const now = new Date();
    return selectedMonth === now.getMonth() && selectedYear === now.getFullYear();
  };
  
  const handleOpenPaymentModal = async () => {
    try {
      const accounts = await getBankAccounts();
      setBankAccounts(accounts);
      setIsPaymentModalOpen(true);
      setPaymentError(null);
      setSelectedBankAccountId("");
      // Set default payment amount to the remaining balance
      const paidSoFar = invoiceData?.invoice?.paidAmount || 0;
      const remaining = (invoiceData?.totalAmount || 0) - paidSoFar;
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
    
    const paidSoFar = invoiceData.invoice?.paidAmount || 0;
    const remaining = invoiceData.totalAmount - paidSoFar;
    
    if (amount > remaining) {
      setPaymentError(`Payment amount cannot exceed the remaining balance of ${formatCurrency(remaining)}`);
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

  const previousBalance = invoiceData.invoice?.paidAmount || 0;
  const monthSpending = totalAmount - previousBalance;

  return (
    <div className="max-w-7xl mx-auto min-h-screen flex flex-col bg-white">
      {/* <Header /> */}
      <main className="flex-1 p-4 md:p-6 pb-32 md:pb-36">
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
        <div className="mb-2 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousMonth}
            className="h-10 px-3"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="ml-1">{getPreviousMonthLabel()}</span>
          </Button>
          
          <div className="px-6 py-2 bg-gray-900 text-white rounded-full">
            <span className="font-semibold">{getMonthYearLabel()}</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextMonth}
            className="h-10 px-3"
          >
            <span className="mr-1">{getNextMonthLabel()}</span>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Invoice Card */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-2">
          {/* Left Card - Invoice Status */}
          <Card className="shadow-md py-2">
            <CardContent className="p-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <div className={`text-sm font-semibold ${invoiceData.invoice?.isPaid ? 'text-green-600' : 'text-orange-600'}`}>
                    {invoiceData.invoice?.isPaid ? 'Paid' : 'Open'}
                  </div>
                  <div className="text-sm font-bold mt-0.5">{card.name}</div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <div className="text-gray-500">Closes on</div>
                  <div className="font-bold">
                    {/*format as Jan 6th */}
                    {new Date(billEndDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Due on</div>
                  <div className="font-bold">
                    {/*format as Jan 6th */}
                    {new Date(paymentDueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Card - Financial Summary */}
          <Card className="shadow-md bg-gray-800 text-white py-2">
            <CardContent className="p-2 space-y-3">
              <div>
                <div className="text-gray-400 text-xs">Previous Balance</div>
                <div className="text-sm font-bold text-green-400">
                  {formatCurrency(previousBalance)}
                </div>
              </div>
              
              <div>
                <div className="text-gray-400 text-xs">Month Spending</div>
                <div className="text-sm font-bold text-red-400">
                  {formatCurrency(monthSpending)}
                </div>
              </div>
              
              <div className="pt-2 border-t border-gray-600">
                <div className="text-gray-400 text-xs">Invoice Amount</div>
                <div className="text-sm font-bold text-red-400">
                  {formatCurrency(totalAmount)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pay Invoice Button */}
        {!invoiceData.invoice?.isPaid && totalAmount > 0 && (
          <Button
            onClick={handleOpenPaymentModal}
            className="w-full h-14 text-sm font-semibold bg-green-600 hover:bg-green-700 mb-2"
          >
            <Wallet className="h-5 w-5 mr-2" />
            Pay Invoice
          </Button>
        )}

        {/* Payment Status Banner */}
        {invoiceData.invoice?.isPaid && (
          <div className="mb-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-700 font-semibold">
                <CheckCircle className="h-5 w-5" />
                <span>Fully Paid{invoiceData.invoice.paidAt && ` on ${new Date(invoiceData.invoice.paidAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleOpenEditModal}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {invoiceData.invoice && invoiceData.invoice.paidAmount > 0 && !invoiceData.invoice.isPaid && (
          <div className="mb-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Partially Paid:</span>
                <span className="font-bold text-green-700">{formatCurrency(invoiceData.invoice.paidAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Remaining:</span>
                <span className="font-bold text-red-700">{formatCurrency(totalAmount - invoiceData.invoice.paidAmount)}</span>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleOpenEditModal}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  variant="outline"
                  size="sm"
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Section */}
        <div className="mb-4 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterDialogOpen(true)}
            className="flex items-center gap-2 h-9"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {(filterCategory ? 1 : 0) + (filterName ? 1 : 0)}
              </span>
            )}
          </Button>
          
          {hasActiveFilters && (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                {filterCategory && (
                  <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    <span>Category: {filterCategory}</span>
                    <button
                      onClick={() => setFilterCategory("")}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {filterName && (
                  <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    <span>Name: {filterName}</span>
                    <button
                      onClick={() => setFilterName("")}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-9 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear all
              </Button>
            </>
          )}
        </div>

        {/* Filter Summary */}
        {hasActiveFilters && filteredTransactions.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-900">
                <span className="font-medium">{filteredTransactions.length}</span> transaction{filteredTransactions.length !== 1 ? 's' : ''} found
              </div>
              <div className="text-sm font-semibold">
                Total: <span className={filteredTotal < 0 ? "text-green-600" : "text-red-600"}>
                  {formatCurrency(Math.abs(filteredTotal))}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Transactions List - Simplified */}
        <div className="mb-20">
          {transactions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 text-sm">No transactions in this billing period</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedTransactions).map(([dateKey, dayTransactions]) => (
                <div key={dateKey}>
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    {dateKey}
                  </div>
                  <div className="space-y-2">
                    {dayTransactions.map((transaction) => {
                      const isIncome = transaction.amount < 0;
                      return (
                        <div 
                          key={transaction.id} 
                          className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Category Icon */}
                            <div className={`w-10 h-10 ${isIncome ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center flex-shrink-0`}>
                              <div className={`${isIncome ? 'text-green-600' : 'text-red-600'} text-xs font-bold`}>
                                {transaction.category.substring(0, 2).toUpperCase()}
                              </div>
                            </div>
                            
                            {/* Transaction Info */}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">
                                {transaction.name}
                              </div>
                              <div className="flex items-center gap-2">
                                {transaction.installments > 1 && (
                                  <div className="text-xs text-gray-500">
                                    {transaction.installments} installments
                                  </div>
                                )}
                                {/* Amount - shown below name on mobile */}
                                <div className={`text-xs font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                                  {isIncome ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              onClick={() => handleEditTransaction(transaction)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              onClick={() => {
                                setDeletingTransactionId(transaction.id);
                                setIsDeleteTransactionConfirmOpen(true);
                              }}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
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
        className="fixed bottom-24 right-6 w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-20"
        aria-label="Add transaction"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Total Invoice Amount:</span>
                  <span className="text-sm font-bold text-red-600">
                    {formatCurrency(invoiceData.totalAmount)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Billing Period: {formatDate(invoiceData.billStartDate)} - {formatDate(invoiceData.billEndDate)}
                </div>
                {invoiceData.invoice && invoiceData.invoice.paidAmount > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Already Paid:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(invoiceData.invoice.paidAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-gray-600">Remaining:</span>
                      <span className="font-bold text-red-600">
                        {formatCurrency(invoiceData.totalAmount - invoiceData.invoice.paidAmount)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment-amount">Payment Amount <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    id="payment-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={invoiceData.totalAmount - (invoiceData.invoice?.paidAmount || 0)}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    disabled={paymentLoading}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentAmount((invoiceData.totalAmount - (invoiceData.invoice?.paidAmount || 0)).toString())}
                    disabled={paymentLoading}
                    className="text-xs"
                  >
                    Full Amount
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentAmount(((invoiceData.totalAmount - (invoiceData.invoice?.paidAmount || 0)) / 2).toFixed(2))}
                    disabled={paymentLoading}
                    className="text-xs"
                  >
                    50%
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bank-account">Select Bank Account <span className="text-red-500">*</span></Label>
                <select
                  id="bank-account"
                  value={selectedBankAccountId}
                  onChange={(e) => setSelectedBankAccountId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={paymentLoading}
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
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Partial Payment:</strong> After paying {formatCurrency(parseFloat(paymentAmount))}, 
                    you will still owe {formatCurrency((invoiceData.totalAmount - (invoiceData.invoice?.paidAmount || 0)) - parseFloat(paymentAmount))} on this invoice.
                  </p>
                </div>
              )}
              
              {paymentError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {paymentError}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentModalOpen(false)}
              disabled={paymentLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayInvoice}
              disabled={paymentLoading || !selectedBankAccountId || !paymentAmount}
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
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Invoice Amount:</span>
                  <span className="text-sm font-bold text-red-600">
                    {formatCurrency(invoiceData.totalAmount)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Billing Period: {formatDate(invoiceData.billStartDate)} - {formatDate(invoiceData.billEndDate)}
                </div>
                {invoiceData.invoice?.paidFromBankAccount && (
                  <div className="text-xs text-gray-500 mt-2">
                    Currently paid from: {invoiceData.invoice.paidFromBankAccount.name}
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={handleUnpayInvoice}
                  variant="outline"
                  className="w-full justify-start"
                  disabled={editLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Mark as Unpaid (Reverse Payment)
                </Button>
                
                <div className="text-sm text-gray-500 text-center">or</div>
                
                <p className="text-sm text-gray-600">Change payment source (coming soon)</p>
              </div>
              
              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {editError}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={editLoading}
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
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-red-700 font-semibold">Invoice Amount:</span>
                  <span className="text-sm font-bold text-red-600">
                    {formatCurrency(invoiceData.totalAmount)}
                  </span>
                </div>
                <div className="text-xs text-red-600">
                  Billing Period: {formatDate(invoiceData.billStartDate)} - {formatDate(invoiceData.billEndDate)}
                </div>
              </div>
              
              {invoiceData.invoice?.isPaid && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> This invoice has been paid. Deleting it will reverse the payment transaction:
                  </p>
                  <ul className="text-xs text-yellow-700 mt-2 ml-4 list-disc space-y-1">
                    <li>Money will be returned to the bank account</li>
                    <li>Credit card available balance will be reduced</li>
                  </ul>
                </div>
              )}
              
              {deleteError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {deleteError}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteInvoice}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
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
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {transactionDeleteError}
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteTransactionConfirmOpen(false);
                setDeletingTransactionId(null);
                setTransactionDeleteError(null);
              }}
              disabled={transactionDeleteLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteTransaction}
              disabled={transactionDeleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
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
