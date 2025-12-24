"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getCreditCards, deleteCreditCard } from "@/app/api/credit-card-action";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CreditCardModal from "@/components/credit-card-modal";
import { CreditCard as CreditCardIcon, Edit2, Trash2, Plus, Calendar } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CreditCard = {
  id: string;
  name: string;
  billGenerationDate: number;
  paymentDate: number;
  cardLimit: number;
  availableBalance: number;
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
      <div className="min-h-screen flex flex-col bg-[#E3E3E3]">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="text-center py-12">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const usedAmount = (card: CreditCard) => card.cardLimit - card.availableBalance;
  const usagePercentage = (card: CreditCard) => (usedAmount(card) / card.cardLimit) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-[#E3E3E3]">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Manage Credit Cards</h1>
          <Button onClick={handleAddCard} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Card
          </Button>
        </div>

        {cards.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <CreditCardIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 mb-4">No credit cards found</p>
                <Button onClick={handleAddCard}>Add Your First Card</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <Card key={card.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <CreditCardIcon className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">{card.name}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCard(card)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(card)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Available Balance</span>
                      <span className="font-semibold">{formatCurrency(card.availableBalance)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Card Limit</span>
                      <span className="font-semibold">{formatCurrency(card.cardLimit)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${usagePercentage(card)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {usagePercentage(card).toFixed(1)}% used
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <div className="flex items-center gap-1 text-gray-600 text-xs mb-1">
                        <Calendar className="h-3 w-3" />
                        <span>Bill Date</span>
                      </div>
                      <p className="font-semibold text-sm">Day {card.billGenerationDate}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-gray-600 text-xs mb-1">
                        <Calendar className="h-3 w-3" />
                        <span>Payment Date</span>
                      </div>
                      <p className="font-semibold text-sm">Day {card.paymentDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the credit card &quot;{deletingCard?.name}&quot;. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
