import { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts } from "../lib/theme";

const { width } = Dimensions.get("window");

interface Props {
  onFinish: () => void;
}

export default function SplashScreenView({ onFinish }: Props) {
  const logo = useRef(new Animated.Value(0)).current;
  const name = useRef(new Animated.Value(0)).current;
  const tagline = useRef(new Animated.Value(0)).current;
  const dots = useRef(new Animated.Value(0)).current;
  const exit = useRef(new Animated.Value(1)).current;

  // Pulsing dots
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);

    Animated.sequence([
      // Logo: scale + fade in
      Animated.timing(logo, { toValue: 1, duration: 500, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),

      // App name slides up + fades in
      Animated.timing(name, { toValue: 1, duration: 400, easing: ease, useNativeDriver: true }),

      // Tagline fades in
      Animated.timing(tagline, { toValue: 1, duration: 400, easing: ease, useNativeDriver: true }),

      // Dots appear
      Animated.timing(dots, { toValue: 1, duration: 300, easing: ease, useNativeDriver: true }),

      // Hold
      Animated.delay(800),

      // Exit
      Animated.timing(exit, { toValue: 0, duration: 350, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) onFinish();
    });

    // Pulsing dots animation (starts with a small delay)
    const pulseDot = (dot: Animated.Value, delay: number) =>
      Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot, { toValue: 1, duration: 450, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0.3, duration: 450, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          ]),
        ),
      ]);

    // Start dot pulses after the dots row appears (~1300ms into the sequence)
    const dotTimer = setTimeout(() => {
      pulseDot(dot1, 0).start();
      pulseDot(dot2, 150).start();
      pulseDot(dot3, 300).start();
    }, 1300);

    return () => clearTimeout(dotTimer);
  }, []);

  return (
    <Animated.View
      style={[
        s.root,
        {
          opacity: exit,
          transform: [{ scale: exit.interpolate({ inputRange: [0, 1], outputRange: [1.05, 1] }) }],
        },
      ]}
    >
      {/* Subtle radial glow behind logo */}
      <View style={s.glowWrap}>
        <LinearGradient
          colors={["rgba(26,158,92,0.12)", "rgba(26,158,92,0.03)", "transparent"]}
          style={s.glow}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      {/* Logo icon */}
      <Animated.View
        style={[
          s.logoWrap,
          {
            opacity: logo,
            transform: [{ scale: logo.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }],
          },
        ]}
      >
        <LinearGradient
          colors={["#34D399", colors.primary, "#15803D"]}
          style={s.logoGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="wallet" size={40} color="#fff" />
        </LinearGradient>
      </Animated.View>

      {/* App name */}
      <Animated.Text
        style={[
          s.appName,
          {
            opacity: name,
            transform: [{ translateY: name.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
          },
        ]}
      >
        Fixpenses
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text
        style={[
          s.tagline,
          {
            opacity: tagline,
            transform: [{ translateY: tagline.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
          },
        ]}
      >
        Your finances, beautifully tracked
      </Animated.Text>

      {/* Loading dots */}
      <Animated.View style={[s.dotsRow, { opacity: dots }]}>
        <Animated.View style={[s.dot, { opacity: dot1, transform: [{ scale: dot1 }] }]} />
        <Animated.View style={[s.dot, { opacity: dot2, transform: [{ scale: dot2 }] }]} />
        <Animated.View style={[s.dot, { opacity: dot3, transform: [{ scale: dot3 }] }]} />
      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  glowWrap: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    top: "50%",
    left: "50%",
    transform: [{ translateX: -(width * 0.4) }, { translateY: -(width * 0.5) }],
  },
  glow: {
    flex: 1,
    borderRadius: width * 0.4,
  },
  logoWrap: {
    width: 96,
    height: 96,
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  logoGrad: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontSize: 30,
    fontFamily: fonts.extrabold,
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.textSub,
    marginBottom: 48,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});
