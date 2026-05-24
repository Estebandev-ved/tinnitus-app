import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

const isNative = () => Capacitor.isNativePlatform();

export const NotificationService = {
  async requestPermission() {
    if (!isNative()) return true;
    const { display } = await LocalNotifications.requestPermissions();
    return display === 'granted';
  },

  async scheduleDailyReminder(hour = 20, minute = 0) {
    if (!isNative()) return;
    const granted = await this.requestPermission();
    if (!granted) return;

    await LocalNotifications.cancel({ notifications: [{ id: 1 }] }).catch(() => {});

    await LocalNotifications.schedule({
      notifications: [{
        id: 1,
        title: 'TinnitOff 🎧',
        body: '¿Ya registraste tu día? Tu racha te espera.',
        schedule: {
          on: { hour, minute },
          repeats: true,
          allowWhileIdle: true
        },
        sound: null,
        actionTypeId: '',
        extra: null
      }]
    });
  },

  async cancelDailyReminder() {
    if (!isNative()) return;
    await LocalNotifications.cancel({ notifications: [{ id: 1 }] }).catch(() => {});
  },

  async scheduleHourlyReminder() {
    if (!isNative()) return;
    const granted = await this.requestPermission();
    if (!granted) return;

    await LocalNotifications.cancel({ notifications: [{ id: 2 }] }).catch(() => {});

    await LocalNotifications.schedule({
      notifications: [{
        id: 2,
        title: 'TinnitOff: Alivio Auditivo 🧘',
        body: 'Es hora de un breve descanso acústico o de realizar una respiración profunda.',
        schedule: {
          every: 'hour',
          allowWhileIdle: true
        },
        sound: null,
        actionTypeId: '',
        extra: null
      }]
    });
  },

  async cancelHourlyReminder() {
    if (!isNative()) return;
    await LocalNotifications.cancel({ notifications: [{ id: 2 }] }).catch(() => {});
  },

  async scheduleSessionReminder(sessionName, delayMinutes = 30) {
    if (!isNative()) return;
    const granted = await this.requestPermission();
    if (!granted) return;

    await LocalNotifications.schedule({
      notifications: [{
        id: Date.now(),
        title: 'Recordatorio de sesión',
        body: `Tu sesión "${sessionName}" está lista.`,
        schedule: { at: new Date(Date.now() + delayMinutes * 60 * 1000) },
        sound: null,
        actionTypeId: '',
        extra: null
      }]
    });
  }
};
