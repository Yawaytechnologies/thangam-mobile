import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInfiniteNotifications, useMarkRead } from '../../hooks/useNotifications';
import { colors, radius, shadow, fontSize, fonts } from '../../theme';
import type { NotificationRecipient, NotificationType } from '../../types';

const TYPE_FILTERS: Array<{ label: string; value: NotificationType | '' }> = [
  { label: 'All',      value: '' },
  { label: 'Booking',  value: 'BOOKING_ACTIVITY' },
  { label: 'Billing',  value: 'BILLING_ACTIVITY' },
  { label: 'Property', value: 'PROPERTY_ACTIVITY' },
  { label: 'Member',   value: 'MEMBER_ACTIVITY' },
  { label: 'System',   value: 'SYSTEM_ACTIVITY' },
];

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  HIGH:   { bg: colors.errorBg,   text: colors.error },
  MEDIUM: { bg: colors.warningBg, text: colors.warning },
  LOW:    { bg: colors.successBg, text: colors.success },
};

function NotificationItem({ item, onMarkRead }: { item: NotificationRecipient; onMarkRead: () => void }) {
  const n = item.notification;
  const isUnread = item.status === 'UNREAD';
  const priorityStyle = n?.priority ? PRIORITY_COLORS[n.priority] : null;

  return (
    <View style={[styles.notifCard, isUnread && styles.notifCardUnread]}>
      <View style={styles.notifDotRow}>
        <View style={[styles.dot, isUnread ? styles.dotUnread : styles.dotRead]} />
        <View style={{ flex: 1 }}>
          <View style={styles.notifTitleRow}>
            <Text style={styles.notifTitle} numberOfLines={1}>{n?.title ?? 'Notification'}</Text>
            {n?.priority && priorityStyle && (
              <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
                <Text style={[styles.priorityText, { color: priorityStyle.text }]}>{n.priority}</Text>
              </View>
            )}
          </View>
          <Text style={styles.notifMessage} numberOfLines={2}>{n?.message ?? ''}</Text>
          <View style={styles.notifFooter}>
            <Text style={styles.notifDate}>
              {n?.createdAt ? new Date(n.createdAt).toLocaleString('en-IN', {
                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
              }) : '—'}
            </Text>
            {n?.type && (
              <Text style={styles.notifType}>{n.type.replace(/_ACTIVITY$/, '').replace(/_/g, ' ')}</Text>
            )}
          </View>
        </View>
      </View>
      {isUnread && (
        <TouchableOpacity style={styles.markReadBtn} onPress={onMarkRead}>
          <Text style={styles.markReadText}>Mark read</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function NotificationsScreen() {
  const [type, setType] = useState<NotificationType | ''>('');

  const {
    data, isLoading, isRefetching, refetch,
    fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useInfiniteNotifications({ type: type || undefined });
  const markRead = useMarkRead();

  const items = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.pageHeader}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={TYPE_FILTERS}
        keyExtractor={(item) => item.value || item.label}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, type === item.value && styles.filterChipActive]}
            onPress={() => setType(item.value)}
          >
            <Text style={[styles.filterChipText, type === item.value && styles.filterChipTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.gold} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No notifications</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator color={colors.gold} style={{ paddingVertical: 16 }} /> : null
        }
        renderItem={({ item }) => (
          <NotificationItem item={item} onMarkRead={() => markRead.mutate(item.id)} />
        )}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  pageHeader: {
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontFamily: fonts.bold, fontSize: fontSize.xl, color: colors.textPrimary },

  filterList: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, backgroundColor: colors.surface },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full,
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
  },
  filterChipActive:     { backgroundColor: colors.gold, borderColor: colors.gold },
  filterChipText:       { fontFamily: fonts.semiBold, fontSize: 12, color: colors.textSecondary },
  filterChipTextActive: { color: colors.textInverse },

  listContent: { padding: 16, paddingBottom: 32, gap: 10 },
  notifCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, ...shadow.sm,
  },
  notifCardUnread: {
    borderLeftWidth: 3, borderLeftColor: colors.gold,
    backgroundColor: '#fdf8ec',
  },
  notifDotRow: { flexDirection: 'row', gap: 10 },
  dot:        { width: 8, height: 8, borderRadius: 4, marginTop: 5, flexShrink: 0 },
  dotUnread:  { backgroundColor: colors.gold },
  dotRead:    { backgroundColor: colors.border },

  notifTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  notifTitle:    { fontFamily: fonts.bold, flex: 1, fontSize: fontSize.sm, color: colors.textPrimary },
  priorityBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  priorityText:  { fontFamily: fonts.bold, fontSize: fontSize.xs },
  notifMessage:  { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 6 },
  notifFooter:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notifDate:     { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textMuted },
  notifType:     { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textMuted },
  markReadBtn:   { alignSelf: 'flex-end', marginTop: 8 },
  markReadText:  { fontFamily: fonts.semiBold, fontSize: 12, color: colors.gold },

  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyText:      { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.textMuted },
});
