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
import { ArrowLeft, Calendar, DollarSign, CreditCard, Clock, ChevronLeft, ChevronRight, CheckCircle, Wallet, Pencil, Trash2, XCircle, Utensils, ShoppingCart, Home, Car, Coffee, Gift, Heart, TrendingUp, TrendingDown } from "lucide-react";
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
      month: "long",
    });
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
        <Header />
        <main className="p-4 md:p-6 pb-48 md:pb-52">
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
        <Header />
        <main className="p-4 md:p-6 pb-48 md:pb-52">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="mb-6"
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
  
  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups: Record<string, Transaction[]>, transaction) => {
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

  return (
    <div className="max-w-7xl mx-auto min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-6 pb-32 md:pb-36">
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {/* Card Header - More Compact */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            {card.name}
          </h1>

          <div className="grid grid-cols-3 gap-3">
            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="text-xs text-gray-500 mb-1">Limit</div>
                <div className="text-base font-bold">{formatCurrency(card.cardLimit)}</div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="text-xs text-gray-500 mb-1">Available</div>
                <div className="text-base font-bold text-green-600">
                  {formatCurrency(card.availableBalance)}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="text-xs text-gray-500 mb-1">Used</div>
                <div className="text-base font-bold text-red-600">
                  {formatCurrency(usedAmount)}
                </div>
                <div className="text-xs text-gray-500">
                  {usagePercentage.toFixed(0)}%
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Month Navigation - More Compact */}
        <div className="mb-4">
          <div className="flex items-center justify-between bg-white rounded-lg p-3 border shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousMonth}
              className="h-8 px-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex flex-col items-center">
              <h2 className="text-base font-semibold">{getMonthYearLabel()}</h2>
              {!isCurrentMonth() && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleCurrentMonth}
                  className="text-xs h-auto p-0 mt-1"
                >
                  Current
                </Button>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="h-8 px-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Invoice Info - Compact */}
        <Card className="mb-4 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-semibold">{isCurrentMonth() ? "Upcoming Invoice" : "Invoice"}</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Total</div>
                <div className="text-lg font-bold text-red-600">
                  {formatCurrency(totalAmount)}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-gray-500 mb-1">Billing Period</div>
                <div className="font-medium">
                  {new Date(billStartDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(billEndDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Due Date</div>
                <div className="font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3 text-orange-500" />
                  {new Date(paymentDueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              </div>
            </div>
            
            
            {/* Payment Status */}
            {invoiceData.invoice?.isPaid ? (
              <div className="mt-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-2">
                  <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Fully Paid on {invoiceData.invoice.paidAt ? new Date(invoiceData.invoice.paidAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "N/A"}
                    {invoiceData.invoice.paidFromBankAccount && (
                      <> • {invoiceData.invoice.paidFromBankAccount.name}</>
                    )}
                  </div>
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
            ) : invoiceData.invoice && invoiceData.invoice.paidAmount > 0 ? (
              <div className="mt-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-2">
                  <div className="text-sm text-blue-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Partially Paid:</span>
                      <span className="font-bold text-green-700">{formatCurrency(invoiceData.invoice.paidAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Remaining:</span>
                      <span className="font-bold text-red-700">{formatCurrency(totalAmount - invoiceData.invoice.paidAmount)}</span>
                    </div>
                    {invoiceData.invoice.paidFromBankAccount && (
                      <div className="text-xs text-blue-600 pt-1 border-t border-blue-200">
                        Last paid from: {invoiceData.invoice.paidFromBankAccount.name}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleOpenPaymentModal}
                    size="sm"
                    className="h-8 text-xs"
                  >
                    <Wallet className="h-4 w-4 mr-1" />
                    Pay Remaining
                  </Button>
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
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ) : totalAmount > 0 ? (
              <div className="mt-3 flex gap-2">
                <Button
                  onClick={handleOpenPaymentModal}
                  size="sm"
                  className="h-8 text-xs"
                >
                  <Wallet className="h-4 w-4 mr-1" />
                  Pay Invoice
                </Button>
                {invoiceData.invoice && (
                  <Button
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Transactions List - Compact Style */}
        <div className="mb-20">
          {transactions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500 text-sm">No transactions in this billing period</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedTransactions).map(([dateKey, dayTransactions]) => (
                <div key={dateKey}>
                  <div className="text-xs font-semibold text-gray-500 mb-2 px-1">
                    {dateKey}
                  </div>
                  <div className="bg-white rounded-lg border shadow-sm divide-y">
                    {dayTransactions.map((transaction) => (
                      <div 
                        key={transaction.id} 
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                      >
                        {/* Category Icon */}
                        <div className={`${getCategoryColor(transaction.category)} text-white rounded-full p-2 flex-shrink-0`}>
                          {getCategoryIcon(transaction.category)}
                        </div>
                        
                        {/* Transaction Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {transaction.name}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span>{transaction.category}</span>
                            {transaction.installments > 1 && (
                              <span className="text-blue-600">• {transaction.installments}x</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Amount */}
                        <div className="flex-shrink-0 text-right">
                          <div className="text-base font-semibold text-red-600">
                            {formatCurrency(transaction.amount)}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex-shrink-0 flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTransaction(transaction)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeletingTransactionId(transaction.id);
                              setIsDeleteTransactionConfirmOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {/* Fixed Bottom Summary */}
      {transactions.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white border-t border-gray-700 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-around text-center">
              <div className="flex-1">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                  <span className="text-xs text-gray-400">total</span>
                </div>
                <div className="text-base font-semibold text-red-400">
                  {formatCurrency(totalAmount)}
                </div>
              </div>
              
              <div className="w-px h-12 bg-gray-700"></div>
              
              <div className="flex-1">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CreditCard className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-gray-400">available</span>
                </div>
                <div className="text-base font-semibold text-green-400">
                  {formatCurrency(card.availableBalance)}
                </div>
              </div>
              
              <div className="w-px h-12 bg-gray-700"></div>
              
              <div className="flex-1">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Wallet className="h-4 w-4 text-orange-400" />
                  <span className="text-xs text-gray-400">used</span>
                </div>
                <div className="text-base font-semibold text-orange-400">
                  {formatCurrency(usedAmount)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
                  <span className="text-xl font-bold text-red-600">
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
                  <span className="text-xl font-bold text-red-600">
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
                  <span className="text-xl font-bold text-red-600">
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
    </div>
  );
}
