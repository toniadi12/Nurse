// Motion tokens — durasi & easing untuk semua animasi.
//
// Filosofi: animasi punya MAKNA, bukan dekorasi. Hindari loop tanpa henti.
// Hormati setting Reduce Motion OS (di Reanimated, set durasi → 0).
// Detail di DESIGN.md section 9.

export const motion = {
  duration: {
    fast: 150, // hover, tap feedback
    base: 250, // default — transisi screen, modal
    slow: 400, // bottom sheet, drawer
    deliberate: 600, // splash, onboarding step transition
  },
  easing: {
    // Bezier curves — kompatibel dengan CSS & Reanimated Easing.bezier()
    standard: [0.4, 0.0, 0.2, 1] as const,
    decelerate: [0.0, 0.0, 0.2, 1] as const, // enter animations
    accelerate: [0.4, 0.0, 1, 1] as const, // exit animations

    // Spring config untuk Reanimated withSpring()
    spring: { damping: 18, stiffness: 200 } as const,
  },
} as const;

export type MotionDuration = keyof typeof motion.duration;
