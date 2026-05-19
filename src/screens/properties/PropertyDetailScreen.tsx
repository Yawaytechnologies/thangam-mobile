import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProperty, usePropertyWorkflow } from '../../hooks/useProperties';
import { WorkflowTimeline } from '../../components/WorkflowTimeline';
import { StatusBadge } from '../../components/StatusBadge';
import { colors, radius, shadow, fontSize } from '../../theme';
import type { PropertiesStackParamList } from '../../navigation/types';

type NavProp = NativeStackNavigationProp<PropertiesStackParamList, 'PropertyDetail'>;
type RoutePropType = RouteProp<PropertiesStackParamList, 'PropertyDetail'>;

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function PropertyDetailScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { propertyId } = route.params;

  const { data: property, isLoading } = useProperty(propertyId);
  const { data: workflow } = usePropertyWorkflow(propertyId);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      </SafeAreaView>
    );
  }

  if (!property) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Property not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackBtn}>
            <Text style={styles.goBackText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Back */}
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={colors.gold} />
          <Text style={styles.backText}>Properties</Text>
        </TouchableOpacity>

        {/* Header card */}
        <View style={styles.card}>
          <View style={styles.propertyHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.propertyName}>{property.propertyName}</Text>
              <Text style={styles.projectName}>{property.projectName}</Text>
            </View>
            <StatusBadge status={property.workflowStatus} />
          </View>
          <View style={styles.divider} />
          <InfoRow label="Property ID" value={property.propertyId} />
          <InfoRow label="Plot Number" value={property.plotNumber} />
          <InfoRow label="Type"        value={property.propertyType} />
          {property.squareFeet != null && (
            <InfoRow label="Area" value={`${property.squareFeet} sq.ft`} />
          )}
          {property.facing          && <InfoRow label="Facing"   value={property.facing} />}
          {property.approvalStatus  && <InfoRow label="Approval" value={property.approvalStatus} />}
          {(property.city || property.state) && (
            <InfoRow label="Location" value={[property.city, property.state].filter(Boolean).join(', ')} />
          )}
          {property.address && <InfoRow label="Address" value={property.address} />}
          <InfoRow
            label="Added On"
            value={new Date(property.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          />
        </View>

        {/* Workflow */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Workflow Timeline</Text>
          <WorkflowTimeline currentStatus={workflow?.status ?? property.workflowStatus} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  backText: { fontSize: fontSize.sm, color: colors.gold, fontWeight: '600' },

  errorText: { fontSize: fontSize.base, color: colors.textSecondary, marginBottom: 16 },
  goBackBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.gold, borderRadius: radius.sm },
  goBackText: { color: colors.textInverse, fontWeight: '600' },

  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16,
    marginBottom: 12, ...shadow.sm,
  },
  propertyHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  propertyName:   { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  projectName:    { fontSize: fontSize.sm, color: colors.textSecondary },
  divider:        { height: 1, backgroundColor: colors.borderLight, marginBottom: 14 },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  infoLabel: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '500' },
  infoValue: { fontSize: fontSize.sm, color: colors.textPrimary, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },

  sectionTitle: { fontSize: fontSize.base, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 },
});
