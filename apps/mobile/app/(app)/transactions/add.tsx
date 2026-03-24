import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { transactions, creditCards, bankAccounts } from "@simple-expenses/api";
import { createTransactionSchema, type CreateTransactionInput } from "@simple-expenses/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AuthInput from "../../../components/AuthInput";
import AuthButton from "../../../components/AuthButton";

type TransactionType = "expense" | "income" | "transfer";

function ControlledInput({
  control,
  name,
  ...props
}: Parameters<typeof AuthInput>[0] & { control: ReturnType<typeof useForm>["control"]; name: string }) {
  const { field, fieldState } = useController({ control, name });
  return (
    <AuthInput
      {...props}
      value={String(field.value ?? "")}
      onChangeText={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
    />
  );
}

export default function AddTransactionScreen() {
  const qc = useQueryClient();
  const [txType, setTxType] = useState<TransactionType>("expense");
  const [accountType, setAccountType] = useState<"card" | "bank">("card");

  const { data: cards = [] } = useQuery({ queryKey: ["credit-cards"], queryFn: () => creditCards.list() });
  const { data: accounts = [] } = useQuery({ queryKey: ["bank-accounts"], queryFn: () => bankAccounts.list() });

  const { control, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      name: "",
      amount: undefined,
      date: new Date().toISOString().slice(0, 10),
      category: "",
      type: "expense",
      notes: "",
      installments: 1,
      creditCardId: cards[0]?.id,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateTransactionInput) => transactions.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["credit-cards"] });
      qc.invalidateQueries({ queryKey: ["bank-accounts"] });
      Alert.alert("Success", "Transaction added!", [{ text: "OK", onPress: () => router.back() }]);
    },
    onError: (e: Error) => Alert.alert("Error", e.message),
  });

  function onTypeChange(type: TransactionType) {
    setTxType(type);
    setValue("type", type);
  }

  const watchedCardId = watch("creditCardId");
  const watchedAccountId = watch("bankAccountId");

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="flex-row items-center px-5 pt-4 pb-4">
            <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 rounded-full bg-white border border-slate-200 items-center justify-center mr-3">
              <Ionicons name="arrow-back" size={18} color="#475569" />
            </TouchableOpacity>
            <Text className="text-slate-900 text-xl font-bold">Add Transaction</Text>
          </View>

          {/* Type selector */}
          <View className="flex-row mx-5 mb-5 bg-white rounded-2xl p-1 border border-slate-100">
            {(["expense", "income", "transfer"] as TransactionType[]).map((t) => (
              <TouchableOpacity
                key={t}
                className={`flex-1 py-2 rounded-xl items-center ${txType === t ? "bg-blue-600" : ""}`}
                onPress={() => onTypeChange(t)}
              >
                <Text className={`text-sm font-semibold capitalize ${txType === t ? "text-white" : "text-slate-500"}`}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="px-5">
            <ControlledInput control={control} name="name" label="Description" placeholder="Coffee, Groceries…" />
            <ControlledInput control={control} name="amount" label="Amount" placeholder="0.00" keyboardType="decimal-pad" />
            <ControlledInput control={control} name="category" label="Category" placeholder="Food, Shopping, Bills…" />
            <ControlledInput control={control} name="date" label="Date" placeholder="YYYY-MM-DD" />
            <ControlledInput control={control} name="notes" label="Notes (optional)" placeholder="Add a note…" />

            {/* Account toggle */}
            <View className="mb-4">
              <Text className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Account</Text>
              <View className="flex-row bg-white rounded-xl p-1 border border-slate-200 mb-2">
                {[{ key: "card", label: "Credit Card" }, { key: "bank", label: "Bank Account" }].map(({ key, label }) => (
                  <TouchableOpacity
                    key={key}
                    className={`flex-1 py-2 rounded-lg items-center ${accountType === key ? "bg-blue-600" : ""}`}
                    onPress={() => {
                      setAccountType(key as "card" | "bank");
                      if (key === "card") { setValue("bankAccountId", undefined); setValue("creditCardId", cards[0]?.id); }
                      else { setValue("creditCardId", undefined); setValue("bankAccountId", accounts[0]?.id); }
                    }}
                  >
                    <Text className={`text-sm font-medium ${accountType === key ? "text-white" : "text-slate-500"}`}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {accountType === "card"
                ? cards.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    className={`flex-row items-center p-3 rounded-xl mb-1 border ${watchedCardId === c.id ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`}
                    onPress={() => { setValue("creditCardId", c.id); setValue("bankAccountId", undefined); }}
                  >
                    <Ionicons name="card-outline" size={16} color={watchedCardId === c.id ? "#2563eb" : "#94a3b8"} />
                    <Text className={`ml-2 text-sm font-medium ${watchedCardId === c.id ? "text-blue-600" : "text-slate-600"}`}>{c.name}</Text>
                  </TouchableOpacity>
                ))
                : accounts.map((a) => (
                  <TouchableOpacity
                    key={a.id}
                    className={`flex-row items-center p-3 rounded-xl mb-1 border ${watchedAccountId === a.id ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`}
                    onPress={() => { setValue("bankAccountId", a.id); setValue("creditCardId", undefined); }}
                  >
                    <Ionicons name="wallet-outline" size={16} color={watchedAccountId === a.id ? "#2563eb" : "#94a3b8"} />
                    <Text className={`ml-2 text-sm font-medium ${watchedAccountId === a.id ? "text-blue-600" : "text-slate-600"}`}>{a.name}</Text>
                  </TouchableOpacity>
                ))
              }
            </View>

            <AuthButton label="Add Transaction" loading={isSubmitting || mutation.isPending} onPress={handleSubmit((d) => mutation.mutate(d))} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
