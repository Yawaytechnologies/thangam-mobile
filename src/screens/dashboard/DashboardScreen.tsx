import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDashboard, useAlerts } from '../../hooks/useDashboard';
import { useProperties } from '../../hooks/useProperties';
import { useAuthStore } from '../../stores/auth.store';
import { colors, radius, shadow, fontSize, fonts } from '../../theme';
import type { DashboardAlert, WorkflowStatus } from '../../types';

const ALERT_COLORS: Record<DashboardAlert['type'], { bg: string; text: string; border: string }> = {
  SETTLEMENT_DUE:       { bg: colors.errorBg,   text: colors.error,   border: colors.errorBorder },
  REGISTRATION_PENDING: { bg: colors.warningBg, text: colors.warning, border: colors.warningBorder },
  WORKFLOW_DELAY:       { bg: colors.infoBg,    text: colors.info,    border: colors.infoBorder },
};

const WORKFLOW_CONFIG: Record<WorkflowStatus, { label: string; color: string }> = {
  AVAILABLE:                { label: 'Available',            color: colors.success },
  BOOKING_INITIATED:        { label: 'Booking Initiated',    color: colors.gold },
  TOKEN_RECEIVED:           { label: 'Token Received',       color: colors.gold },
  ADVANCE_PAYMENT:          { label: 'Advance Payment',      color: colors.warning },
  REGISTRATION_PENDING:     { label: 'Reg. Pending',         color: colors.warning },
  FINAL_SETTLEMENT_PENDING: { label: 'Final Settlement',     color: colors.error },
  COMPLETED:                { label: 'Completed',            color: colors.success },
};

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
  const { data: propertiesData, isLoading: propertiesLoading, refetch: refetchProperties } = useProperties({ limit: 6 });
  const [refreshing, setRefreshing] = React.useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchAlerts(), refetchProperties()]);
    setRefreshing(false);
  }

  const member = user?.member;
  const displayName = member?.fullName ?? user?.email ?? 'Member';
  const roleLabel = (member?.role ?? user?.role ?? '').replace(/_/g, ' ');
  const branchName = member?.branch?.name ?? '';
  const memberId = member?.memberId ?? '';
  const initials = displayName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.gold} />}
      >
        {/* Member Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{roleLabel}</Text>
            </View>
            {!!branchName && <Text style={styles.profileBranch}>{branchName}</Text>}
            {!!memberId && <Text style={styles.profileId}>ID: {memberId}</Text>}
          </View>
        </View>

        {/* Stats Grid */}
        {statsLoading ? (
          <View style={styles.loadingRow}><Text style={styles.loadingText}>Loading stats...</Text></View>
        ) : (
          <View style={styles.statsGrid}>
            <StatCard label="Network Size"          value={stats?.totalNetwork ?? 0}        accentColor={colors.gold} />
            <StatCard label="Active Members"         value={stats?.activeMembers ?? 0}       accentColor={colors.success} />
            <StatCard label="Properties Available"   value={stats?.availableProperties ?? 0} accentColor={colors.warning} />
            <StatCard label="Notifications"          value={stats?.unreadNotifications ?? 0} accentColor={colors.error} />
          </View>
        )}

        {/* Action Required */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACTION REQUIRED</Text>
          {alertsLoading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : !alerts?.length ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No pending actions</Text>
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

        {/* Property Workflow */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PROPERTY WORKFLOW</Text>
          {propertiesLoading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : !propertiesData?.data?.length ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No properties</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.propScroll}>
              {propertiesData.data.map((p) => {
                const cfg = WORKFLOW_CONFIG[p.workflowStatus];
                return (
                  <View key={p.id} style={styles.propCard}>
                    <View style={[styles.propDot, { backgroundColor: cfg.color }]} />
                    <Text style={styles.propProject} numberOfLines={1}>{p.projectName}</Text>
                    <Text style={styles.propPlot}>Plot {p.plotNumber}</Text>
                    <View style={[styles.propBadge, { backgroundColor: cfg.color + '22' }]}>
                      <Text style={[styles.propBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                    {!!p.city && <Text style={styles.propCity}>{p.city}</Text>}
                  </View>
                );
              })}
            </ScrollView>
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

  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.navy, borderRadius: radius.lg, padding: 20, marginBottom: 16,
  },
  profileAvatar: {
    width: 56, height: 56, borderRadius: radius.full, backgroundColor: colors.gold,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  profileAvatarText: { fontFamily: fonts.bold, fontSize: fontSize.xl, color: colors.navy },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: fonts.bold,    fontSize: fontSize.lg, color: colors.textInverse, marginBottom: 5 },
  roleBadge: {
    alignSelf: 'flex-start', backgroundColor: colors.gold,
    borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 5,
  },
  roleBadgeText: { fontFamily: fonts.bold, fontSize: 10, color: colors.navy, textTransform: 'uppercase', letterSpacing: 0.5 },
  profileBranch: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: 'rgba(255,255,255,0.55)', marginTop: 1 },
  profileId:     { fontFamily: fonts.regular, fontSize: fontSize.xs, color: 'rgba(255,255,255,0.35)', marginTop: 2 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, ...shadow.sm,
  },
  statValue: { fontFamily: fonts.bold,   fontSize: fontSize['2xl'], color: colors.textPrimary, marginBottom: 4 },
  statLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.textSecondary },

  section:      { marginBottom: 16 },
  sectionLabel: { fontFamily: fonts.bold, fontSize: 11, color: colors.textMuted, marginBottom: 10, letterSpacing: 1 },

  loadingRow: { paddingVertical: 20, alignItems: 'center' },
  loadingText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textMuted },

  emptyCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 20, alignItems: 'center' },
  emptyText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textMuted },

  alertCard:    { borderRadius: radius.md, borderWidth: 1, padding: 14, marginBottom: 8 },
  alertTitle:   { fontFamily: fonts.bold,    fontSize: fontSize.sm, marginBottom: 4 },
  alertMessage: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  alertDate:    { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textMuted, marginTop: 6 },

  propScroll: { gap: 10 },
  propCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, width: 160, ...shadow.sm,
  },
  propDot:       { width: 8, height: 8, borderRadius: 4, marginBottom: 8 },
  propProject:   { fontFamily: fonts.bold,    fontSize: fontSize.sm, color: colors.textPrimary, marginBottom: 2 },
  propPlot:      { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 8 },
  propBadge:     { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 4 },
  propBadgeText: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 0.3 },
  propCity:      { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
});
