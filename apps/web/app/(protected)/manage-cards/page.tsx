"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getCreditCards, deleteCreditCard } from "@/app/api/credit-card-action";
import { getUserProfile } from "@/app/api/user-action";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CreditCardModal from "@/components/credit-card-modal";
import {
  CreditCard as CreditCardIcon,
  Edit2,
  Trash2,
  Plus,
  Calendar,
  ChevronRight,
} from "lucide-react";
import EmptyState from "@/components/EmptyState";
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

const formatCompact = (amount: number) => {
  if (Math.abs(amount) >= 1000) {
    return `AED ${(amount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
};

const CARD_COLOR_CONFIGS = [
  { bgClass: "bg-indigo-500", from: "#4338ca", to: "#1e1b4b" },
  { bgClass: "bg-violet-500", from: "#7c3aed", to: "#2e1065" },
  { bgClass: "bg-blue-500", from: "#2563eb", to: "#1e3a8a" },
  { bgClass: "bg-cyan-500", from: "#0891b2", to: "#164e63" },
  { bgClass: "bg-teal-500", from: "#0d9488", to: "#134e4a" },
  { bgClass: "bg-pink-500", from: "#db2777", to: "#831843" },
  { bgClass: "bg-rose-500", from: "#e11d48", to: "#881337" },
  { bgClass: "bg-orange-500", from: "#f97316", to: "#7c2d12" },
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
  const [preferredCurrency, setPreferredCurrency] = useState("AED");

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const [fetchedCards, profile] = await Promise.all([
        getCreditCards(),
        getUserProfile(),
      ]);
      setCards(fetchedCards);
      if (profile?.preferredCurrency)
        setPreferredCurrency(profile.preferredCurrency);
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
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div
          className="h-48 animate-pulse"
          style={{
            background:
              "linear-gradient(135deg, #0b6e3a 0%, #1a9e5c 55%, #22c068 100%)",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-52 rounded-2xl bg-white animate-pulse shadow-sm"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!session) return null;

  const usedAmount = (card: CreditCard) =>
    card.cardLimit - card.availableBalance;
  const usagePercentage = (card: CreditCard) =>
    card.cardLimit > 0 ? (usedAmount(card) / card.cardLimit) * 100 : 0;

  const totalLimit = cards.reduce((s, c) => s + c.cardLimit, 0);
  const totalAvailable = cards.reduce((s, c) => s + c.availableBalance, 0);
  const totalUsed = totalLimit - totalAvailable;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero */}
      <div
        className="relative overflow-hidden text-white"
        style={{
          background:
            "linear-gradient(135deg, #0b6e3a 0%, #1a9e5c 55%, #22c068 100%)",
        }}
      >
        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1.5px, transparent 1.5px)",
            backgroundSize: "22px 22px",
          }}
        />
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-20 -left-8 w-48 h-48 rounded-full bg-black/10 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-white/50 text-[10px] font-semibold uppercase tracking-[0.15em] mb-1.5">
                Manage
              </p>
              <h1 className="text-2xl font-bold leading-tight">Credit Cards</h1>
              <p className="text-white/60 text-sm mt-1">
                {cards.length} card{cards.length !== 1 ? "s" : ""} on file
              </p>
            </div>
            <button
              onClick={handleAddCard}
              className="flex-shrink-0 flex items-center gap-2 bg-white text-[#1a9e5c] px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-white/90 active:scale-95 transition-all shadow-lg shadow-black/20"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Card</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          {cards.length > 0 && (
            <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-2.5 sm:p-3.5 min-w-0">
                <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1.5 sm:mb-2">
                  Limit
                </p>
                <p className="text-white font-bold text-xs sm:text-sm md:text-base leading-none">
                  <span className="sm:hidden">{formatCompact(totalLimit)}</span>
                  <span className="hidden sm:block">
                    {formatCurrency(totalLimit)}
                  </span>
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-2.5 sm:p-3.5 min-w-0">
                <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1.5 sm:mb-2">
                  Used
                </p>
                <p className="text-white font-bold text-xs sm:text-sm md:text-base leading-none">
                  <span className="sm:hidden">{formatCompact(totalUsed)}</span>
                  <span className="hidden sm:block">
                    {formatCurrency(totalUsed)}
                  </span>
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-2.5 sm:p-3.5 min-w-0">
                <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1.5 sm:mb-2">
                  Free
                </p>
                <p className="text-white font-bold text-xs sm:text-sm md:text-base leading-none">
                  <span className="sm:hidden">
                    {formatCompact(totalAvailable)}
                  </span>
                  <span className="hidden sm:block">
                    {formatCurrency(totalAvailable)}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 pb-28 lg:pb-10">
        {cards.length === 0 ? (
          <EmptyState
            icon={CreditCardIcon}
            title="No credit cards yet"
            description="Add your first credit card to start tracking"
            actionLabel="Add Card"
            onAction={handleAddCard}
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card, i) => {
              const used = usedAmount(card);
              const pct = usagePercentage(card);
              const config = CARD_COLOR_CONFIGS[i % CARD_COLOR_CONFIGS.length];
              const usageColor =
                pct > 80 ? "#ef4444" : pct > 50 ? "#f59e0b" : config.from;

              return (
                <div
                  key={card.id}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
                >
                  {/* Credit card visual */}
                  <div
                    className="relative h-40 p-4 overflow-hidden flex flex-col justify-between"
                    style={{
                      background: `linear-gradient(135deg, ${config.from}, ${config.to})`,
                    }}
                  >
                    {/* Decorative circles */}
                    <div className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
                    <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full bg-black/20 pointer-events-none" />

                    {/* Top row: chip + actions */}
                    <div className="relative flex items-start justify-between">
                      {/* SIM chip */}
                      <div className="w-8 h-5 rounded bg-gradient-to-br from-yellow-200/90 to-yellow-400/60 border border-yellow-300/30 shadow-sm" />
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditCard(card)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/25 text-white/70 hover:text-white transition-all"
                          title="Edit card"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(card)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/50 text-white/70 hover:text-white transition-all"
                          title="Delete card"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => router.push(`/credit-card/${card.id}`)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/25 text-white/70 hover:text-white transition-all"
                          title="View details"
                        >
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom: available + name */}
                    <div className="relative">
                      <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest mb-0.5">
                        Available
                      </p>
                      <p className="text-white font-bold text-2xl leading-none mb-2">
                        {formatCurrency(card.availableBalance)}
                      </p>
                      <p className="text-white/80 font-semibold text-sm tracking-wide">
                        {card.name}
                      </p>
                    </div>
                  </div>

                  {/* Card details */}
                  <div className="p-4">
                    {/* Usage bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1.5">
                        <p className="text-xs font-semibold text-slate-500">
                          {formatCurrency(used)} used
                        </p>
                        <p
                          className="text-xs font-bold"
                          style={{ color: usageColor }}
                        >
                          {pct.toFixed(0)}%
                        </p>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            backgroundColor: usageColor,
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5">
                        of {formatCurrency(card.cardLimit)} limit
                      </p>
                    </div>

                    {/* Date pills */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                      <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-2 border border-slate-100/80">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: config.from + "18" }}
                        >
                          <Calendar
                            className="h-3.5 w-3.5"
                            style={{ color: config.from }}
                          />
                        </div>
                        <div>
                          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">
                            Bill date
                          </p>
                          <p className="text-xs font-bold text-slate-700">
                            Day {card.billGenerationDate}
                          </p>
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-2 border border-slate-100/80">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: config.from + "18" }}
                        >
                          <Calendar
                            className="h-3.5 w-3.5"
                            style={{ color: config.from }}
                          />
                        </div>
                        <div>
                          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">
                            Pay date
                          </p>
                          <p className="text-xs font-bold text-slate-700">
                            Day {card.paymentDate}
                          </p>
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
        preferredCurrency={preferredCurrency}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Credit Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingCard?.name}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
