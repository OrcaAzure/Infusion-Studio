/** Play a short chime when brew timer completes (PWA / web fallback). */
export function playBrewChime() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch {
    /* WebView may block AudioContext */
  }
}

export async function vibrateOnComplete() {
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: ImpactStyle.Heavy });
    setTimeout(() => Haptics.impact({ style: ImpactStyle.Heavy }), 400);
  } catch {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([400, 200, 400]);
    }
  }
}

const TIMER_NOTIFICATION_ID = 9001;

export async function scheduleBrewNotification(seconds: number, blendName: string) {
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== "granted") return;

    await LocalNotifications.schedule({
      notifications: [
        {
          id: TIMER_NOTIFICATION_ID,
          title: "Brew complete",
          body: blendName ? `${blendName} is ready` : "Your infusion is ready",
          schedule: { at: new Date(Date.now() + seconds * 1000) },
        },
      ],
    });
  } catch {
    /* Not on native — web Notification handled elsewhere */
  }
}

export async function cancelBrewNotification() {
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.cancel({ notifications: [{ id: TIMER_NOTIFICATION_ID }] });
  } catch {
    /* ignore */
  }
}
