"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getCreditCards, deleteCreditCard } from "@/app/api/credit-card-action";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CreditCardModal from "@/components/credit-card-modal";
import { CreditCard as CreditCardIcon, Edit2, Trash2, Plus, Calendar, ChevronRight } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CARD_COLORS = [
  "bg-indigo-500",
  "bg-violet-500",
  "bg-blue-500",
  "bg-cyan-500",
  "bg-teal-500",
  "bg-pink-500",
  "bg-rose-500",
  "bg-orange-500",
];

type CreditCard = {
  id: string;
  name: string;
  billGenerationDate: number;
  paymentDate: number;
  cardLimit: number;
  availableBalance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function ManageCardsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [deletingCard, setDeletingCard] = useState<CreditCard | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const fetchedCards = await getCreditCards();
      setCards(fetchedCards);
    } catch (error) {
      console.error("Failed to fetch credit cards:", error);
      alert("Error fetching credit cards: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchCards();
    }
  }, [session]);

  const handleAddCard = () => {
    setEditingCard(null);
    setIsCardModalOpen(true);
  };

  const handleEditCard = (card: CreditCard) => {
    setEditingCard(card);
    setIsCardModalOpen(true);
  };

  const handleDeleteClick = (card: CreditCard) => {
    setDeletingCard(card);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCard) return;

    try {
      await deleteCreditCard(deletingCard.id);
      await fetchCards();
      setDeleteDialogOpen(false);
      setDeletingCard(null);
    } catch (error) {
      console.error("Failed to delete credit card:", error);
      alert("Error deleting credit card: " + (error as Error).message);
    }
  };

  const handleModalSuccess = () => {
    fetchCards();
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!session) return null;

  const usedAmount = (card: CreditCard) => card.cardLimit - card.availableBalance;
  const usagePercentage = (card: CreditCard) =>
    card.cardLimit > 0 ? (usedAmount(card) / card.cardLimit) * 100 : 0;

  const totalLimit = cards.reduce((s, c) => s + c.cardLimit, 0);
  const totalAvailable = cards.reduce((s, c) => s + c.availableBalance, 0);
  const totalUsed = totalLimit - totalAvailable;

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Header />

      {/* Page hero */}
      <div className="bg-[#1a9e5c] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">Credit Cards</h1>
              <p className="text-white/60 text-sm mt-0.5">
                {cards.length} card{cards.length !== 1 ? "s" : ""} managed
              </p>
            </div>
            <button
              onClick={handleAddCard}
              className="flex items-center gap-2 bg-white text-[#1a9e5c] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Card
            </button>
          </div>

          {cards.length > 0 && (
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="bg-white/10 rounded-2xl p-3.5">
                <p className="text-white/60 text-xs font-medium mb-1">Total Limit</p>
                <p className="text-white font-bold">{formatCurrency(totalLimit)}</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-3.5">
                <p className="text-white/60 text-xs font-medium mb-1">Total Used</p>
                <p className="text-white font-bold">{formatCurrency(totalUsed)}</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-3.5">
                <p className="text-white/60 text-xs font-medium mb-1">Available</p>
                <p className="text-white font-bold">{formatCurrency(totalAvailable)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 pb-24 lg:pb-8">
        {cards.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <CreditCardIcon className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-700 font-semibold mb-1">No credit cards yet</p>
            <p className="text-slate-400 text-sm mb-5">
              Add your first credit card to start tracking
            </p>
            <button
              onClick={handleAddCard}
              className="flex items-center gap-2 bg-[#1a9e5c] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#158a4f] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Card
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {cards.map((card, i) => {
              const used = usedAmount(card);
              const pct = usagePercentage(card);
              const colorClass = CARD_COLORS[i % CARD_COLORS.length];
              const initial = card.name.charAt(0).toUpperCase();

              return (
                <div
                  key={card.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden"
                >
                  <div className={`h-1.5 ${colorClass}`} />
                  <div className="p-5">
                    {/* Card header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl ${colorClass} flex items-center justify-center text-white font-bold text-lg`}
                        >
                          {initial}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">{card.name}</h3>
                          <p className="text-xs text-slate-400">Credit Card</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditCard(card)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit card"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(card)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete card"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        </button>
                        <button
                          onClick={() => router.push(`/credit-card/${card.id}`)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View details"
                        >
                          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        </button>
                      </div>
                    </div>

                    {/* Balance info + usage bar */}
                    <div className="mb-3">
                      <div className="flex justify-between items-end mb-1.5">
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Available</p>
                          <p className="text-xl font-bold text-slate-800">
                            {formatCurrency(card.availableBalance)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400 mb-0.5">Limit</p>
                          <p className="text-sm font-semibold text-slate-500">
                            {formatCurrency(card.cardLimit)}
                          </p>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct > 80 ? "bg-red-500" : pct > 50 ? "bg-amber-500" : colorClass
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatCurrency(used)} used &bull; {pct.toFixed(0)}%
                      </p>
                    </div>

                    {/* Dates */}
                    <div className="flex gap-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Calendar className="h-3 w-3 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400">Bill date</p>
                          <p className="font-semibold">Day {card.billGenerationDate}</p>
                        </div>
                      </div>
                      <div className="w-px bg-slate-100" />
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Calendar className="h-3 w-3 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400">Payment date</p>
                          <p className="font-semibold">Day {card.paymentDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      <CreditCardModal
        open={isCardModalOpen}
        setOpen={setIsCardModalOpen}
        onSuccess={handleModalSuccess}
        editCard={editingCard}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Credit Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingCard?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
