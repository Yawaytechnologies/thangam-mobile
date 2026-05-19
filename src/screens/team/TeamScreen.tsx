import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TextInput,
  TouchableOpacity, Modal, ScrollView, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTeam, useTeamMember } from '../../hooks/useTeam';
import { StatusBadge } from '../../components/StatusBadge';
import { colors, radius, shadow, fontSize } from '../../theme';
import type { Member } from '../../types';

function MemberDetailModal({ memberId, onClose }: { memberId: string; onClose: () => void }) {
  const { data: member, isLoading } = useTeamMember(memberId);

  return (
    <Modal animationType="slide" transparent visible onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Member Details</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          {isLoading || !member ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.memberAvatarWrap}>
                <Text style={styles.memberAvatarText}>{member.fullName.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.memberName}>{member.fullName}</Text>
              <Text style={styles.memberRole}>{member.role.replace(/_/g, ' ')}</Text>
              <View style={styles.badgeRow}>
                <StatusBadge status={member.status} />
              </View>
              <View style={styles.infoSection}>
                {[
                  ['Member ID', member.memberId],
                  ['Phone',     member.phone],
                  ['Email',     member.email ?? '—'],
                  ['Branch',    member.branch?.name ?? '—'],
                  ['Code',      member.codeNumber ?? '—'],
                  ['Reports To', member.reportsTo?.fullName ?? '—'],
                  ['Joined',    new Date(member.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
                ].map(([label, val]) => (
                  <View key={label as string} style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{label}</Text>
                    <Text style={styles.infoValue}>{val}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

function MemberCard({ member, onPress }: { member: Member; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.memberCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardAvatar}>
        <Text style={styles.cardAvatarText}>{member.fullName.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.memberCardName}>{member.fullName}</Text>
        <Text style={styles.memberCardRole}>{member.role.replace(/_/g, ' ')}</Text>
        <Text style={styles.memberCardBranch}>{member.branch?.name ?? ''}</Text>
      </View>
      <StatusBadge status={member.status} />
    </TouchableOpacity>
  );
}

export default function TeamScreen() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useTeam({ search: search || undefined, limit: 50 });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.pageHeader}>
        <Text style={styles.headerTitle}>My Team</Text>
        {data?.total != null && <Text style={styles.headerSub}>{data.total} members</Text>}
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, role..."
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <FlatList
        data={data?.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.gold} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No team members found</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <MemberCard member={item} onPress={() => setSelectedId(item.id)} />
        )}
      />

      {selectedId && (
        <MemberDetailModal memberId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  pageHeader: {
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.textPrimary },
  headerSub:   { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 1 },

  searchContainer: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.surface },
  searchInput: {
    backgroundColor: colors.background, borderRadius: radius.sm,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: fontSize.sm, color: colors.textPrimary,
    borderWidth: 1, borderColor: colors.border,
  },

  listContent: { padding: 16, paddingBottom: 32, gap: 10 },
  memberCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12, ...shadow.sm,
  },
  cardAvatar: {
    width: 42, height: 42, borderRadius: radius.full,
    backgroundColor: colors.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  cardAvatarText:   { fontSize: fontSize.base, fontWeight: '700', color: colors.navy },
  memberCardName:   { fontSize: fontSize.sm, fontWeight: '600', color: colors.textPrimary },
  memberCardRole:   { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  memberCardBranch: { fontSize: 12, color: colors.textMuted, marginTop: 1 },

  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyText:      { fontSize: fontSize.base, color: colors.textMuted },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    padding: 20, maxHeight: '85%',
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: colors.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:  { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary },
  closeBtn:    { fontSize: fontSize.lg, color: colors.textSecondary, fontWeight: '600' },

  memberAvatarWrap: {
    width: 64, height: 64, borderRadius: radius.full, backgroundColor: colors.gold,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 10,
  },
  memberAvatarText: { fontSize: fontSize['2xl'], fontWeight: '700', color: colors.navy },
  memberName:   { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  memberRole:   { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', marginTop: 2 },
  badgeRow:     { alignItems: 'center', marginTop: 8, marginBottom: 16 },
  infoSection:  {},
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  infoLabel: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '500' },
  infoValue: { fontSize: fontSize.sm, color: colors.textPrimary, fontWeight: '600', maxWidth: '55%', textAlign: 'right' },
  loadingText: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', paddingVertical: 20 },
});
