import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProperty, usePropertyWorkflow, usePropertyDocuments } from '../../hooks/useProperties';
import { WorkflowTimeline } from '../../components/WorkflowTimeline';
import { StatusBadge } from '../../components/StatusBadge';
import { colors, radius, shadow, fontSize, fonts } from '../../theme';
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

type Tab = 'overview' | 'workflow' | 'documents';

export default function PropertyDetailScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { propertyId } = route.params;
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const { data: property, isLoading } = useProperty(propertyId);
  const { data: workflow } = usePropertyWorkflow(propertyId);
  const { data: documents, isLoading: docsLoading } = usePropertyDocuments(propertyId);

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

  const currentStatus = workflow?.status ?? property.workflowStatus;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{property.projectName}</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(['overview', 'workflow', 'documents'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'overview' ? (
          <>
            {/* Status banner */}
            <View style={styles.statusBanner}>
              <Text style={styles.statusLabel}>STATUS</Text>
              <StatusBadge status={property.workflowStatus} />
            </View>

            {/* Details card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Property Details</Text>
              <InfoRow label="Property ID" value={property.propertyId} />
              <InfoRow label="Plot Number" value={property.plotNumber} />
              <InfoRow label="Type" value={property.propertyType} />
              {property.squareFeet != null && (
                <InfoRow label="Area" value={`${property.squareFeet} sq.ft`} />
              )}
              {property.facing && <InfoRow label="Facing" value={property.facing} />}
              {property.approvalStatus && <InfoRow label="Approval" value={property.approvalStatus} />}
              {(property.city || property.state) && (
                <InfoRow
                  label="Location"
                  value={[property.city, property.state].filter((v): v is string => !!v).join(', ')}
                />
              )}
              {property.address && <InfoRow label="Address" value={property.address} />}
              <InfoRow
                label="Added On"
                value={new Date(property.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              />
            </View>
          </>
        ) : activeTab === 'workflow' ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Sales Pipeline Status</Text>
            <WorkflowTimeline currentStatus={currentStatus} />
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Documents</Text>
            {docsLoading ? (
              <ActivityIndicator color={colors.gold} style={{ marginTop: 16 }} />
            ) : !documents?.length ? (
              <Text style={styles.infoLabel}>No documents uploaded yet</Text>
            ) : (
              documents.map((doc) => (
                <TouchableOpacity
                  key={doc.id}
                  style={styles.docRow}
                  onPress={() => Linking.openURL(doc.documentUrl).catch(() => Alert.alert('Error', 'Could not open document'))}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docType}>{doc.documentType.replace(/_/g, ' ')}</Text>
                    <Text style={styles.docDate}>
                      {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="open-in-new" size={18} color={colors.gold} />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: {
    fontFamily: fonts.bold, flex: 1, fontSize: fontSize.base,
    color: colors.textPrimary, textAlign: 'center', marginHorizontal: 8,
  },

  tabBar: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  tab: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.gold },
  tabText: { fontFamily: fonts.bold, fontSize: 12, color: colors.textMuted, letterSpacing: 0.5 },
  tabTextActive: { color: colors.gold },

  statusBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface, borderRadius: radius.md, padding: 14,
    marginBottom: 12, ...shadow.sm,
  },
  statusLabel: { fontFamily: fonts.bold, fontSize: 12, color: colors.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' },

  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16,
    marginBottom: 12, ...shadow.sm,
  },
  sectionTitle: { fontFamily: fonts.bold, fontSize: fontSize.base, color: colors.textPrimary, marginBottom: 14 },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  infoLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textMuted },
  infoValue: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textPrimary, maxWidth: '60%', textAlign: 'right' },

  docRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  docType: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textPrimary, marginBottom: 2 },
  docDate: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textMuted },

  errorText: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.textSecondary, marginBottom: 16 },
  goBackBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.gold, borderRadius: radius.sm },
  goBackText: { fontFamily: fonts.bold, color: colors.navy },
});
