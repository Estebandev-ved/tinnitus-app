import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { NotificationService } from '../../services/notificationService';

export function NotificationPreferences() {
  const [enabled, setEnabled] = useState(
    () => localStorage.getItem('tinnitoff_notif_enabled') !== 'false'
  );
  const [hour, setHour] = useState(
    () => parseInt(localStorage.getItem('tinnitoff_notif_hour') || '20', 10)
  );

  useEffect(() => {
    if (enabled) {
      NotificationService.scheduleDailyReminder(hour, 0);
    } else {
      NotificationService.cancelDailyReminder();
    }
    localStorage.setItem('tinnitoff_notif_enabled', String(enabled));
    localStorage.setItem('tinnitoff_notif_hour', String(hour));
  }, [enabled, hour]);

  return (
    <div style={{ background: 'var(--card-bg)', padding: 20, borderRadius: 12, color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        {enabled ? <Bell size={20} color="#007AFF" /> : <BellOff size={20} color="#8e8e93" />}
        <h3 style={{ margin: 0, fontSize: 16 }}>Recordatorio Diario</h3>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
        Te avisamos para que registres tu día y mantengas tu racha.
      </p>

      <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={() => setEnabled(v => !v)}
          style={{ width: 20, height: 20, accentColor: '#007AFF' }}
        />
        <span>Activar recordatorio diario</span>
      </label>

      {enabled && (
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Hora del recordatorio</span>
          <input
            type="time"
            value={`${String(hour).padStart(2, '0')}:00`}
            onChange={e => setHour(parseInt(e.target.value.split(':')[0], 10))}
            style={{
              padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: 15, width: 130
            }}
          />
        </label>
      )}
    </div>
  );
}
