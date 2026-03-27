import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, type ViewStyle } from "react-native";
import { colors } from "../lib/theme";

/**
 * Animated skeleton placeholder — pulses between 0.35 → 0.8 opacity.
 * Uses plain RN Animated (not Reanimated) for Android compatibility.
 */
export function Bone({
  width,
  height,
  borderRadius = 8,
  style,
}: {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 750, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: "rgba(120,110,100,0.12)",
          opacity,
        },
        style,
      ]}
    />
  );
}

/** Skeleton for card-based list screens (bank accounts, goals) */
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={sk.container}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={sk.card}>
          <View style={sk.row}>
            <Bone width={48} height={48} borderRadius={16} />
            <View style={{ flex: 1, gap: 8 }}>
              <Bone width={"60%" as `${number}%`} height={14} />
              <Bone width={"35%" as `${number}%`} height={10} />
            </View>
            <Bone width={80} height={18} />
          </View>
          <View style={[sk.row, { marginTop: 12 }]}>
            <Bone width={"100%" as `${number}%`} height={8} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
}

/** Skeleton for row-based list screens (transactions) */
export function ListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View style={sk.container}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={sk.listRow}>
          <Bone width={40} height={40} borderRadius={13} />
          <View style={{ flex: 1, gap: 6 }}>
            <Bone width={"55%" as `${number}%`} height={14} />
            <Bone width={"35%" as `${number}%`} height={10} />
          </View>
          <Bone width={70} height={16} />
        </View>
      ))}
    </View>
  );
}

/** Skeleton for budget / spending-limit cards */
export function BudgetSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={sk.container}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={sk.card}>
          <View style={sk.row}>
            <Bone width={10} height={10} borderRadius={5} />
            <View style={{ flex: 1, gap: 6 }}>
              <Bone width={"45%" as `${number}%`} height={14} />
              <Bone width={"60%" as `${number}%`} height={10} />
            </View>
          </View>
          <Bone width={"100%" as `${number}%`} height={8} borderRadius={4} style={{ marginTop: 12 }} />
          <View style={[sk.row, { marginTop: 10, justifyContent: "space-between" }]}>
            <Bone width={40} height={12} />
            <Bone width={100} height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

/** Skeleton for credit-card gradient cards */
export function CreditCardSkeleton({ count = 2 }: { count?: number }) {
  return (
    <View style={[sk.container, { gap: 20 }]}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={sk.creditCard}>
          <View style={sk.row}>
            <Bone width={36} height={36} borderRadius={12} />
            <View style={{ flex: 1, gap: 6 }}>
              <Bone width={"50%" as `${number}%`} height={16} />
            </View>
          </View>
          <View style={{ marginTop: 28 }}>
            <Bone width={"40%" as `${number}%`} height={12} />
            <Bone width={"65%" as `${number}%`} height={30} style={{ marginTop: 6 }} />
          </View>
          <Bone width={"100%" as `${number}%`} height={8} borderRadius={99} style={{ marginTop: 20 }} />
          <View style={[sk.row, { marginTop: 24, gap: 10 }]}>
            <Bone width={"30%" as `${number}%`} height={48} borderRadius={16} />
            <Bone width={"30%" as `${number}%`} height={48} borderRadius={16} />
            <Bone width={"30%" as `${number}%`} height={48} borderRadius={16} />
          </View>
        </View>
      ))}
    </View>
  );
}

/** Skeleton for invoice cards */
export function InvoiceSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={sk.container}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={sk.card}>
          <View style={sk.row}>
            <Bone width={8} height={8} borderRadius={4} />
            <View style={{ flex: 1, gap: 6 }}>
              <Bone width={"40%" as `${number}%`} height={14} />
              <Bone width={"25%" as `${number}%`} height={10} />
            </View>
            <Bone width={50} height={22} borderRadius={99} />
          </View>
          <View style={[sk.row, { marginTop: 14, gap: 24 }]}>
            <View style={{ gap: 4 }}>
              <Bone width={40} height={8} />
              <Bone width={70} height={16} />
            </View>
            <View style={{ gap: 4 }}>
              <Bone width={30} height={8} />
              <Bone width={60} height={16} />
            </View>
          </View>
          <Bone width={"100%" as `${number}%`} height={44} borderRadius={14} style={{ marginTop: 14 }} />
        </View>
      ))}
    </View>
  );
}

/** Skeleton for dashboard body sections (below hero) */
export function DashboardBodySkeleton() {
  return (
    <View style={{ paddingBottom: 40 }}>
      {/* Quick actions skeleton */}
      <View style={sk.section}>
        <Bone width={130} height={20} style={{ marginBottom: 14 }} />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={{ alignItems: "center", gap: 8, flex: 1 }}>
              <Bone width={56} height={56} borderRadius={20} />
              <Bone width={50} height={10} />
            </View>
          ))}
        </View>
      </View>
      {/* Bank accounts skeleton */}
      <View style={sk.section}>
        <Bone width={150} height={20} style={{ marginBottom: 14 }} />
        {[1, 2].map((i) => (
          <View key={i} style={[sk.dashRow, { marginBottom: 12 }]}>
            <Bone width={48} height={48} borderRadius={16} />
            <View style={{ flex: 1, gap: 8 }}>
              <Bone width={"50%" as `${number}%`} height={14} />
              <Bone width={"30%" as `${number}%`} height={10} />
            </View>
            <Bone width={80} height={18} />
          </View>
        ))}
      </View>
      {/* Credit cards skeleton */}
      <View style={sk.section}>
        <Bone width={100} height={20} style={{ marginBottom: 14 }} />
        {[1, 2].map((i) => (
          <View key={i} style={[sk.dashCard, { marginBottom: 14 }]}>
            <View style={sk.row}>
              <Bone width={48} height={38} borderRadius={14} />
              <View style={{ flex: 1, gap: 8 }}>
                <Bone width={"55%" as `${number}%`} height={14} />
                <Bone width={"40%" as `${number}%`} height={10} />
              </View>
            </View>
            <Bone width={"60%" as `${number}%`} height={24} style={{ marginTop: 16 }} />
            <Bone width={"100%" as `${number}%`} height={7} borderRadius={99} style={{ marginTop: 14 }} />
          </View>
        ))}
      </View>
    </View>
  );
}

const sk = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 16, gap: 10, paddingBottom: 100 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  creditCard: {
    backgroundColor: colors.surface2,
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  section: { marginTop: 24, paddingHorizontal: 20 },
  dashRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  dashCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
});
