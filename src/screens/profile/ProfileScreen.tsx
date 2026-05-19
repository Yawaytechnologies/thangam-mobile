import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/auth.store';
import { useLogout } from '../../hooks/useAuth';
import { StatusBadge } from '../../components/StatusBadge';
import { colors, radius, shadow, fontSize } from '../../theme';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const logout = useLogout();

  const member = user?.member;
  const displayName = member?.fullName ?? user?.email ?? 'Member';
  const roleLabel = member?.role?.replace(/_/g, ' ') ?? user?.role?.replace(/_/g, ' ') ?? '';

  function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout.mutate() },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.roleLabel}>{roleLabel}</Text>
          {user?.status && (
            <View style={styles.badgeRow}>
              <StatusBadge status={user.status} />
            </View>
          )}
        </View>

        {/* Member details */}
        {member && (
          <SectionCard title="Member Details">
            <InfoRow label="Member ID"    value={member.memberId} />
            <InfoRow label="Phone"        value={member.phone} />
            {member.email         && <InfoRow label="Email"       value={member.email} />}
            <InfoRow label="Branch"       value={member.branch?.name ?? '—'} />
            {member.codeNumber    && <InfoRow label="Code Number" value={member.codeNumber} />}
            {member.qualification && <InfoRow label="Qualification" value={member.qualification} />}
            {member.bloodGroup    && <InfoRow label="Blood Group"   value={member.bloodGroup} />}
            {member.dateOfBirth   && (
              <InfoRow
                label="Date of Birth"
                value={new Date(member.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              />
            )}
            <InfoRow
              label="Joined"
              value={new Date(member.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            />
          </SectionCard>
        )}

        {/* Branch */}
        {member?.branch && (
          <SectionCard title="Branch">
            <InfoRow label="Branch Name" value={member.branch.name} />
            <InfoRow label="Branch Code" value={member.branch.branchCode} />
            {member.branch.city && (
              <InfoRow label="Location" value={[member.branch.city, member.branch.state].filter(Boolean).join(', ')} />
            )}
            {member.branch.phone && <InfoRow label="Branch Phone" value={member.branch.phone} />}
          </SectionCard>
        )}

        <TouchableOpacity
          style={[styles.logoutBtn, logout.isPending && styles.logoutBtnDisabled]}
          onPress={handleLogout}
          disabled={logout.isPending}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>
            {logout.isPending ? 'Logging out...' : 'Logout'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },

  profileHeader: {
    alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: 24, marginBottom: 12, ...shadow.sm,
  },
  avatarCircle: {
    width: 72, height: 72, borderRadius: radius.full,
    backgroundColor: colors.gold,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText:   { fontSize: fontSize['3xl'], fontWeight: '800', color: colors.navy },
  displayName:  { fontSize: fontSize.xl, fontWeight: '700', color: colors.textPrimary },
  roleLabel:    { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  badgeRow:     { marginTop: 8 },

  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: 16, marginBottom: 12, ...shadow.sm,
  },
  cardTitle: {
    fontSize: 12, fontWeight: '700', color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  infoLabel: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '500' },
  infoValue: { fontSize: fontSize.sm, color: colors.textPrimary, fontWeight: '600', maxWidth: '55%', textAlign: 'right' },

  logoutBtn: {
    backgroundColor: colors.error,
    borderRadius: radius.md, paddingVertical: 14,
    alignItems: 'center', marginTop: 8,
  },
  logoutBtnDisabled: { opacity: 0.6 },
  logoutText: { color: colors.textInverse, fontSize: fontSize.base, fontWeight: '700' },
});
