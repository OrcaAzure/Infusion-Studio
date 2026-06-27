import { MouseSensor, TouchSensor, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core";

/** Sensors tuned for desktop mouse + mobile touch (Capacitor / Samsung WebView). */
export function useDndSensors() {
  return useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 6 },
    }),
    useSensor(KeyboardSensor)
  );
}
