import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDashboard, useAlerts } from '../../hooks/useDashboard';
import { useAuthStore } from '../../stores/auth.store';
import { colors, radius, shadow, fontSize } from '../../theme';
import type { DashboardAlert } from '../../types';

const ALERT_COLORS: Record<DashboardAlert['type'], { bg: string; text: string; border: string }> = {
  SETTLEMENT_DUE:       { bg: colors.errorBg,   text: colors.error,   border: colors.errorBorder },
  REGISTRATION_PENDING: { bg: colors.warningBg, text: colors.warning, border: colors.warningBorder },
  WORKFLOW_DELAY:       { bg: colors.infoBg,    text: colors.info,    border: colors.infoBorder },
};

const STAT_COLORS = [colors.gold, colors.success, colors.warning, colors.error];
const STAT_LABELS = ['Network Size', 'Active Members', 'Available Properties', 'Notifications'] as const;

function StatCard({ label, value, accentColor }: { label: string; value: number; accentColor: string }) {
  return (
    <View style={[styles.statCard, { borderTopColor: accentColor, borderTopWidth: 3 }]}>
      <Text style={styles.statValue}>{value.toLocaleString('en-IN')}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboard();
  const { data: alerts, isLoading: alertsLoading, refetch: refetchAlerts } = useAlerts();
  const [refreshing, setRefreshing] = React.useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchAlerts()]);
    setRefreshing(false);
  }

  const member = user?.member;
  const displayName = member?.fullName ?? user?.email ?? 'Member';
  const roleLabel = member?.role?.replace(/_/g, ' ') ?? user?.role?.replace(/_/g, ' ') ?? '';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.gold} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.role}>{roleLabel}</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
        </View>

        {/* Stats Grid */}
        {statsLoading ? (
          <View style={styles.loadingRow}>
            <Text style={styles.loadingText}>Loading stats...</Text>
          </View>
        ) : (
          <View style={styles.statsGrid}>
            <StatCard label={STAT_LABELS[0]} value={stats?.totalNetwork ?? 0}         accentColor={STAT_COLORS[0]} />
            <StatCard label={STAT_LABELS[1]} value={stats?.activeMembers ?? 0}        accentColor={STAT_COLORS[1]} />
            <StatCard label={STAT_LABELS[2]} value={stats?.availableProperties ?? 0}  accentColor={STAT_COLORS[2]} />
            <StatCard label={STAT_LABELS[3]} value={stats?.notificationsCount ?? 0}   accentColor={STAT_COLORS[3]} />
          </View>
        )}

        {/* Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alerts</Text>
          {alertsLoading ? (
            <Text style={styles.loadingText}>Loading alerts...</Text>
          ) : !alerts?.length ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No active alerts</Text>
            </View>
          ) : (
            alerts.map((alert) => {
              const c = ALERT_COLORS[alert.type] ?? { bg: colors.background, text: colors.textSecondary, border: colors.border };
              return (
                <View key={alert.id} style={[styles.alertCard, { backgroundColor: c.bg, borderColor: c.border }]}>
                  <Text style={[styles.alertTitle, { color: c.text }]}>{alert.title}</Text>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                  <Text style={styles.alertDate}>
                    {new Date(alert.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.background },
  scroll:  { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: colors.navy,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 16,
  },
  greeting: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.5)', marginBottom: 2 },
  name:     { fontSize: fontSize.xl, fontWeight: '700', color: colors.textInverse },
  role:     { fontSize: 12, color: colors.gold, marginTop: 2 },
  avatarCircle: {
    width: 44, height: 44, borderRadius: radius.full,
    backgroundColor: colors.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: colors.navy, fontSize: fontSize.lg, fontWeight: '800' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1, minWidth: '45%',
    backgroundColor: colors.surface, borderRadius: radius.md, padding: 16,
    ...shadow.sm,
  },
  statValue: { fontSize: fontSize['2xl'], fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  statLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },

  section:      { marginBottom: 16 },
  sectionTitle: { fontSize: fontSize.base, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },

  loadingRow: { paddingVertical: 20, alignItems: 'center' },
  loadingText: { fontSize: fontSize.sm, color: colors.textMuted },

  emptyCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 20, alignItems: 'center' },
  emptyText: { fontSize: fontSize.sm, color: colors.textMuted },

  alertCard: { borderRadius: radius.md, borderWidth: 1, padding: 14, marginBottom: 8 },
  alertTitle:   { fontSize: fontSize.sm, fontWeight: '700', marginBottom: 4 },
  alertMessage: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  alertDate:    { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 6 },
});
