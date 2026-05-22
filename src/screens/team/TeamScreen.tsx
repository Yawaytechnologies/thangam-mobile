import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, Modal, ScrollView, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTeam, useTeamMember } from '../../hooks/useTeam';
import { StatusBadge } from '../../components/StatusBadge';
import { colors, radius, shadow, fontSize, fonts } from '../../theme';
import type { Member } from '../../types';

interface TreeNode {
  member: Member;
  children: TreeNode[];
}

function buildTree(members: Member[]): TreeNode[] {
  const idSet = new Set(members.map((m) => m.id));
  const map = new Map<string, TreeNode>();
  members.forEach((m) => map.set(m.id, { member: m, children: [] }));
  const roots: TreeNode[] = [];
  members.forEach((m) => {
    if (m.reportsToId && idSet.has(m.reportsToId)) {
      map.get(m.reportsToId)!.children.push(map.get(m.id)!);
    } else {
      roots.push(map.get(m.id)!);
    }
  });
  return roots;
}

const ROLE_COLORS: Record<string, string> = {
  DIRECTOR:           '#7c3aed',
  EXECUTIVE_DIRECTOR: '#2563eb',
  DEPUTY_DIRECTOR:    '#0891b2',
  SENIOR_MANAGER:     '#059669',
  BUSINESS_MANAGER:   '#d97706',
  AGENT:              '#6b7280',
};

function RolePill({ role }: { role: string }) {
  const clr = ROLE_COLORS[role] ?? '#6b7280';
  return (
    <View style={{ backgroundColor: clr + '20', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 3 }}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 10, color: clr, letterSpacing: 0.3 }}>
        {role.replace(/_/g, ' ')}
      </Text>
    </View>
  );
}

function TreeNodeView({
  node, level = 0, onPress,
}: { node: TreeNode; level?: number; onPress: (id: string) => void }) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = node.children.length > 0;
  const m = node.member;
  const roleColor = ROLE_COLORS[m.role] ?? colors.textMuted;
  const initials = m.fullName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <>
      <TouchableOpacity
        style={[styles.treeRow, { paddingLeft: 16 + level * 20 }]}
        onPress={() => onPress(m.id)}
        activeOpacity={0.7}
      >
        {level > 0 && (
          <View style={[styles.levelLine, { left: 16 + (level - 1) * 20 + 10, backgroundColor: roleColor + '30' }]} />
        )}
        <View style={[styles.treeAvatar, { backgroundColor: roleColor + '18' }]}>
          <Text style={[styles.treeAvatarText, { color: roleColor }]}>{initials}</Text>
        </View>
        <View style={{ flex: 1, marginRight: 6 }}>
          <Text style={styles.treeName}>{m.fullName}</Text>
          <RolePill role={m.role} />
        </View>
        {hasChildren ? (
          <TouchableOpacity
            onPress={() => setExpanded((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.expandBtn}
          >
            <View style={styles.expandBadge}>
              <Text style={styles.expandBadgeText}>{node.children.length}</Text>
            </View>
            <MaterialCommunityIcons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        ) : (
          <MaterialCommunityIcons name="chevron-right" size={16} color={colors.borderLight} />
        )}
      </TouchableOpacity>

      {expanded && hasChildren && node.children.map((child) => (
        <TreeNodeView key={child.member.id} node={child} level={level + 1} onPress={onPress} />
      ))}
    </>
  );
}

function MemberDetailModal({ memberId, onClose }: { memberId: string; onClose: () => void }) {
  const { data: member, isLoading } = useTeamMember(memberId);

  return (
    <Modal animationType="slide" transparent statusBarTranslucent visible onRequestClose={onClose}>
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
                <Text style={styles.memberAvatarText}>
                  {member.fullName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()}
                </Text>
              </View>
              <Text style={styles.memberName}>{member.fullName}</Text>
              <View style={{ alignItems: 'center', marginTop: 4 }}>
                <RolePill role={member.role} />
              </View>
              <View style={styles.badgeRow}>
                <StatusBadge status={member.status} />
              </View>
              <View style={styles.infoSection}>
                {(
                  [
                    ['Member ID',  member.memberId],
                    ['Phone',      member.phone],
                    ['Email',      member.email ?? '—'],
                    ['Branch',     member.branch?.name ?? '—'],
                    ['Code',       member.codeNumber ?? '—'],
                    ['Reports To', member.reportsTo?.fullName ?? '—'],
                    ['Joined',     new Date(member.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
                  ] as [string, string][]
                ).map(([label, val]) => (
                  <View key={label} style={styles.infoRow}>
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

function FlatMemberRow({ member, onPress }: { member: Member; onPress: () => void }) {
  const roleColor = ROLE_COLORS[member.role] ?? colors.textMuted;
  const initials = member.fullName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <TouchableOpacity style={styles.flatRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.flatAvatar, { backgroundColor: roleColor + '18' }]}>
        <Text style={[styles.flatAvatarText, { color: roleColor }]}>{initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.flatName}>{member.fullName}</Text>
        <RolePill role={member.role} />
        {!!member.branch?.name && <Text style={styles.flatBranch}>{member.branch.name}</Text>}
      </View>
      <StatusBadge status={member.status} />
    </TouchableOpacity>
  );
}

export default function TeamScreen() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isRefetching, refetch } = useTeam({ search: debouncedSearch || undefined, limit: 200 });
  const members = data?.data ?? [];
  const tree = useMemo(() => (debouncedSearch ? [] : buildTree(members)), [debouncedSearch, members]);
  const activeCount = members.filter((m) => m.status === 'ACTIVE').length;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.headerTitle}>My Team</Text>
        {data?.total != null && (
          <Text style={styles.headerSub}>{data.total} member{data.total !== 1 ? 's' : ''}</Text>
        )}
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <View style={styles.searchInputWrap}>
          <MaterialCommunityIcons name="magnify" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={searchInput}
            onChangeText={setSearchInput}
            placeholder="Search by name, role..."
            placeholderTextColor={colors.textMuted}
          />
          {!!searchInput && (
            <TouchableOpacity onPress={() => setSearchInput('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialCommunityIcons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.gold} />}
      >
        {debouncedSearch ? (
          /* Flat search results */
          members.length === 0 && !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No members found</Text>
            </View>
          ) : (
            <View style={styles.treeCard}>
              {members.map((m) => (
                <FlatMemberRow key={m.id} member={m} onPress={() => setSelectedId(m.id)} />
              ))}
            </View>
          )
        ) : (
          /* Hierarchy tree */
          <>
            <View style={styles.treeCard}>
              {tree.length === 0 && !isLoading ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No team members</Text>
                </View>
              ) : (
                tree.map((node) => (
                  <TreeNodeView key={node.member.id} node={node} level={0} onPress={setSelectedId} />
                ))
              )}
            </View>

            {/* Team Summary */}
            {!!data && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>TEAM SUMMARY</Text>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{data.total}</Text>
                    <Text style={styles.summaryLabel}>Total</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: colors.success }]}>{activeCount}</Text>
                    <Text style={styles.summaryLabel}>Active</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: colors.error }]}>{data.total - activeCount}</Text>
                    <Text style={styles.summaryLabel}>Inactive</Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {!!selectedId && (
        <MemberDetailModal memberId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  pageHeader: {
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontFamily: fonts.bold,    fontSize: fontSize.xl, color: colors.textPrimary },
  headerSub:   { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 1 },

  searchBar: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  searchInputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.background, borderRadius: radius.sm,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  searchInput: { fontFamily: fonts.regular, flex: 1, fontSize: fontSize.sm, color: colors.textPrimary, paddingVertical: 0 },

  listContent: { padding: 16, paddingBottom: 32, gap: 12 },

  treeCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', ...shadow.sm,
  },

  // Tree row
  treeRow: {
    flexDirection: 'row', alignItems: 'center', paddingRight: 14, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: colors.borderLight, position: 'relative',
  },
  levelLine: { position: 'absolute', top: 0, bottom: 0, width: 2 },
  treeAvatar: {
    width: 36, height: 36, borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  treeAvatarText: { fontFamily: fonts.bold,    fontSize: fontSize.sm },
  treeName:       { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textPrimary },
  expandBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  expandBadge: {
    backgroundColor: colors.background, borderRadius: 10, minWidth: 20, height: 20,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  expandBadgeText: { fontFamily: fonts.bold, fontSize: 10, color: colors.textSecondary },

  // Flat search results
  flatRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
  flatAvatar: { width: 40, height: 40, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  flatAvatarText: { fontFamily: fonts.bold,    fontSize: fontSize.sm },
  flatName:       { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textPrimary },
  flatBranch:     { fontFamily: fonts.regular,  fontSize: 12, color: colors.textMuted, marginTop: 3 },

  emptyContainer: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.textMuted },

  // Team Summary
  summaryCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, ...shadow.sm,
  },
  summaryTitle: { fontFamily: fonts.bold,    fontSize: 11, color: colors.textMuted, letterSpacing: 1, marginBottom: 14 },
  summaryRow:   { flexDirection: 'row', alignItems: 'center' },
  summaryItem:  { flex: 1, alignItems: 'center' },
  summaryValue: { fontFamily: fonts.bold,    fontSize: fontSize['2xl'], color: colors.textPrimary },
  summaryLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  summaryDivider: { width: 1, height: 40, backgroundColor: colors.border },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    padding: 20, maxHeight: '85%',
  },
  modalHandle: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:  { fontFamily: fonts.bold,    fontSize: fontSize.lg, color: colors.textPrimary },
  closeBtn:    { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.textSecondary },

  memberAvatarWrap: {
    width: 64, height: 64, borderRadius: radius.full, backgroundColor: colors.gold,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 10,
  },
  memberAvatarText: { fontFamily: fonts.bold, fontSize: fontSize['2xl'], color: colors.navy },
  memberName:       { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.textPrimary, textAlign: 'center' },
  badgeRow:   { alignItems: 'center', marginTop: 10, marginBottom: 16 },
  infoSection: {},
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  infoLabel: { fontFamily: fonts.medium,   fontSize: fontSize.sm, color: colors.textMuted },
  infoValue: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textPrimary, maxWidth: '55%', textAlign: 'right' },
  loadingText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', paddingVertical: 20 },
});
