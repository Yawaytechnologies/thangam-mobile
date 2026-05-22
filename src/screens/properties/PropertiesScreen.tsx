import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, TextInput,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useInfiniteProperties } from '../../hooks/useProperties';
import { StatusBadge } from '../../components/StatusBadge';
import { colors, radius, shadow, fontSize, fonts } from '../../theme';
import type { PropertiesStackParamList } from '../../navigation/types';
import type { Property, WorkflowStatus } from '../../types';

type NavProp = NativeStackNavigationProp<PropertiesStackParamList, 'PropertiesList'>;

const WORKFLOW_FILTERS: Array<{ label: string; value: WorkflowStatus | '' }> = [
  { label: 'All',          value: '' },
  { label: 'Available',    value: 'AVAILABLE' },
  { label: 'Booking',      value: 'BOOKING_INITIATED' },
  { label: 'Token',        value: 'TOKEN_RECEIVED' },
  { label: 'Advance',      value: 'ADVANCE_PAYMENT' },
  { label: 'Registration', value: 'REGISTRATION_PENDING' },
  { label: 'Settlement',   value: 'FINAL_SETTLEMENT_PENDING' },
  { label: 'Completed',    value: 'COMPLETED' },
];

function PropertyCard({ property, onPress }: { property: Property; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <Text style={styles.projectName} numberOfLines={1}>{property.projectName}</Text>
        <StatusBadge status={property.workflowStatus} />
      </View>
      <Text style={styles.plotNumber}>Plot: {property.plotNumber}</Text>
      <View style={styles.cardMeta}>
        <Text style={styles.metaText}>{property.propertyType}</Text>
        {property.squareFeet && <Text style={styles.metaText}>•  {property.squareFeet} sq.ft</Text>}
        {(property.city || property.state) && (
          <Text style={styles.metaText}>•  {[property.city, property.state].filter(Boolean).join(', ')}</Text>
        )}
      </View>
      <Text style={styles.propId}>{property.propertyId}</Text>
    </TouchableOpacity>
  );
}

export default function PropertiesScreen() {
  const navigation = useNavigation<NavProp>();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus | ''>('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const {
    data, isLoading, isRefetching, refetch,
    fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useInfiniteProperties({
    search: debouncedSearch || undefined,
    workflowStatus: workflowStatus || undefined,
  });

  const items = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.total;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.pageHeader}>
        <Text style={styles.headerTitle}>Properties</Text>
        {total ? <Text style={styles.headerSub}>{total} total</Text> : null}
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchInput}
          onChangeText={(t) => setSearchInput(t)}
          placeholder="Search by project, plot, ID..."
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={WORKFLOW_FILTERS}
        keyExtractor={(item) => item.value || item.label}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, workflowStatus === item.value && styles.filterChipActive]}
            onPress={() => setWorkflowStatus(item.value)}
          >
            <Text style={[styles.filterChipText, workflowStatus === item.value && styles.filterChipTextActive]}>
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
              <Text style={styles.emptyText}>No properties found</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator color={colors.gold} style={{ paddingVertical: 16 }} /> : null
        }
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
          />
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
    backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontFamily: fonts.bold,    fontSize: fontSize.xl, color: colors.textPrimary },
  headerSub:   { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 1 },

  searchContainer: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.surface },
  searchInput: {
    fontFamily: fonts.regular,
    backgroundColor: colors.background, borderRadius: radius.sm,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: fontSize.sm, color: colors.textPrimary,
    borderWidth: 1, borderColor: colors.border,
  },

  filterList: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, backgroundColor: colors.surface },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full,
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
  },
  filterChipActive:     { backgroundColor: colors.gold, borderColor: colors.gold },
  filterChipText:       { fontFamily: fonts.semiBold, fontSize: 12, color: colors.textSecondary },
  filterChipTextActive: { color: colors.textInverse },

  listContent: { padding: 16, paddingBottom: 32, gap: 12 },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: 14,
    ...shadow.sm,
  },
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  projectName: { fontFamily: fonts.bold,    flex: 1, fontSize: fontSize.base, color: colors.textPrimary, marginRight: 8 },
  plotNumber:  { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: 6 },
  cardMeta:    { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 6 },
  metaText:    { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  propId:      { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textMuted },

  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyText:      { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.textMuted },
});
