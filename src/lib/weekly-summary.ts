import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";

export async function scheduleWeeklySummary(brewCount: number, blendCount: number) {
  if (!Capacitor.isNativePlatform()) return;

  await LocalNotifications.requestPermissions();

  const nextSunday = new Date();
  nextSunday.setDate(nextSunday.getDate() + ((7 - nextSunday.getDay()) % 7 || 7));
  nextSunday.setHours(9, 0, 0, 0);

  await LocalNotifications.schedule({
    notifications: [
      {
        id: 9001,
        title: "Your week in brewing ☕",
        body: `${brewCount} brew${brewCount !== 1 ? "s" : ""} logged · ${blendCount} blend${blendCount !== 1 ? "s" : ""} created this week`,
        schedule: { at: nextSunday, allowWhileIdle: true },
      },
    ],
  });
}
