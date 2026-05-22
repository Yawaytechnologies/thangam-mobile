import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from '../theme';

type Status = string;

const STATUS_MAP: Record<string, { bg: string; text: string; label?: string }> = {
  ACTIVE: { bg: '#dcfce7', text: '#15803d' },
  INACTIVE: { bg: '#f3f4f6', text: '#6b7280' },
  PENDING: { bg: '#fef9c3', text: '#a16207' },
  AVAILABLE: { bg: '#dcfce7', text: '#15803d' },
  BOOKING_INITIATED: { bg: '#dbeafe', text: '#1d4ed8', label: 'Booking Initiated' },
  TOKEN_RECEIVED: { bg: '#e0e7ff', text: '#4338ca', label: 'Token Received' },
  ADVANCE_PAYMENT: { bg: '#fce7f3', text: '#9d174d', label: 'Advance Payment' },
  REGISTRATION_PENDING: { bg: '#ffedd5', text: '#c2410c', label: 'Registration Pending' },
  FINAL_SETTLEMENT_PENDING: { bg: '#fef3c7', text: '#b45309', label: 'Final Settlement' },
  COMPLETED: { bg: '#d1fae5', text: '#065f46' },
  CANCELLED: { bg: '#fee2e2', text: '#b91c1c' },
  PARTIAL_PAYMENT: { bg: '#fce7f3', text: '#be185d', label: 'Partial Payment' },
  PAID: { bg: '#dcfce7', text: '#15803d' },
  FINAL_SETTLEMENT: { bg: '#fef3c7', text: '#92400e', label: 'Final Settlement' },
  UNREAD: { bg: '#dbeafe', text: '#1e40af' },
  READ: { bg: '#f3f4f6', text: '#6b7280' },
  RESOLVED: { bg: '#dcfce7', text: '#166534' },
  IMPORTANT: { bg: '#fee2e2', text: '#991b1b' },
};

function formatLabel(status: string): string {
  return status
    .replace(/_ACTIVITY$/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StatusBadge({ status }: { status: Status }) {
  const config = STATUS_MAP[status] ?? { bg: '#f3f4f6', text: '#6b7280' };
  const label = config.label ?? formatLabel(status);

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },
});
