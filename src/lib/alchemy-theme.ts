/** Alchemy / brewing laboratory palette — web theme only (not offline APK). */
export const ALCHEMY = {
  void: "#060a08",
  deep: "#0a100d",
  panel: "#0f1512",
  parchment: "#f4f1e8",
  parchmentDark: "#1a1612",
  brew: "#2d6a4f",
  vapour: "#40916c",
  glow: "#52b788",
  mist: "#74c69d",
  gold: "#c9a227",
  brass: "#d4a853",
  copper: "#b87333",
} as const;

/** Wavy hero — deep greens with brass vapour */
export const ALCHEMY_WAVE_COLORS = [
  "#1b4332",
  "#2d6a4f",
  "#40916c",
  "#52b788",
  "#c9a227",
];

export function isAlchemyWeb() {
  return process.env.NEXT_PUBLIC_OFFLINE_DEMO !== "true";
}
