import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { WorkflowStatus } from '../types';
import { colors, fontSize } from '../theme';

const WORKFLOW_STEPS: WorkflowStatus[] = [
  'AVAILABLE',
  'BOOKING_INITIATED',
  'TOKEN_RECEIVED',
  'ADVANCE_PAYMENT',
  'REGISTRATION_PENDING',
  'FINAL_SETTLEMENT_PENDING',
  'COMPLETED',
];

const STEP_LABELS: Record<WorkflowStatus, string> = {
  AVAILABLE:                 'Available',
  BOOKING_INITIATED:         'Booking Initiated',
  TOKEN_RECEIVED:            'Token Received',
  ADVANCE_PAYMENT:           'Advance Payment',
  REGISTRATION_PENDING:      'Registration Pending',
  FINAL_SETTLEMENT_PENDING:  'Final Settlement',
  COMPLETED:                 'Completed',
};

interface WorkflowTimelineProps {
  currentStatus: WorkflowStatus;
}

export function WorkflowTimeline({ currentStatus }: WorkflowTimelineProps) {
  const currentIndex = WORKFLOW_STEPS.indexOf(currentStatus);

  return (
    <View style={styles.container}>
      {WORKFLOW_STEPS.map((step, idx) => {
        const isPast    = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isDone    = idx <= currentIndex;

        return (
          <View key={step} style={styles.stepRow}>
            <View style={styles.lineCol}>
              {idx < WORKFLOW_STEPS.length - 1 && (
                <View style={[styles.line, isPast ? styles.lineDone : styles.linePending]} />
              )}
              <View style={[
                styles.circle,
                isCurrent && styles.circleCurrent,
                isPast    && styles.circleDone,
                !isDone   && styles.circlePending,
              ]}>
                {isPast ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : (
                  <Text style={[styles.circleNum, isCurrent ? styles.circleNumActive : styles.circleNumInactive]}>
                    {idx + 1}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.labelCol}>
              <Text style={[
                styles.stepLabel,
                isCurrent && styles.stepLabelCurrent,
                isPast    && styles.stepLabelDone,
                !isDone   && styles.stepLabelPending,
              ]}>
                {STEP_LABELS[step]}
              </Text>
              {isCurrent && <Text style={styles.currentTag}>Current</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 4 },
  stepRow:   { flexDirection: 'row', alignItems: 'flex-start' },
  lineCol:   { alignItems: 'center', width: 32, marginRight: 12 },
  line: {
    position: 'absolute', top: 28, width: 2, height: 36, zIndex: 0,
  },
  lineDone:    { backgroundColor: colors.success },
  linePending: { backgroundColor: colors.border },

  circle: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', zIndex: 1,
  },
  circleCurrent: {
    backgroundColor: colors.gold,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 6, elevation: 4,
  },
  circleDone:    { backgroundColor: colors.success },
  circlePending: { backgroundColor: colors.border },

  checkmark:          { color: colors.textInverse, fontSize: fontSize.sm, fontWeight: '700' },
  circleNum:          { fontSize: 12, fontWeight: '700' },
  circleNumActive:    { color: colors.textInverse },
  circleNumInactive:  { color: colors.textMuted },

  labelCol:    { flex: 1, paddingBottom: 36, justifyContent: 'center', paddingTop: 4 },
  stepLabel:   { fontSize: fontSize.sm },
  stepLabelCurrent: { color: colors.gold, fontWeight: '700' },
  stepLabelDone:    { color: colors.success, fontWeight: '600' },
  stepLabelPending: { color: colors.textMuted },
  currentTag:  { fontSize: fontSize.xs, color: colors.gold, marginTop: 2, fontWeight: '500' },
});
