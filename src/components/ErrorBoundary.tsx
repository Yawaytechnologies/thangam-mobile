import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, fontSize } from '../theme';

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Replace with Sentry.captureException(error) in production
    console.error('[ErrorBoundary]', error.message, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <View style={styles.iconBox}>
            <Text style={styles.iconText}>!</Text>
          </View>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => this.setState({ error: null })}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.background, padding: 32,
  },
  iconBox: {
    width: 64, height: 64, borderRadius: radius.full,
    backgroundColor: '#fef2f2',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  iconText: { fontSize: 28, fontWeight: '800', color: colors.error },
  title:   { fontSize: fontSize.xl, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  message: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', marginBottom: 24 },
  btn: {
    backgroundColor: colors.gold, borderRadius: radius.sm,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  btnText: { color: colors.textInverse, fontSize: fontSize.base, fontWeight: '700' },
});
