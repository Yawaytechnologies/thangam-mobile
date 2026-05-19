import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLogin } from '../../hooks/useAuth';
import { getApiError } from '../../api/error';
import { colors, radius, shadow, fontSize } from '../../theme';

export default function LoginScreen() {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const login = useLogin();

  function handleLogin() {
    const trimmed = credential.trim();
    if (!trimmed || !password.trim()) {
      Alert.alert('Required', 'Please enter your phone/email and password.');
      return;
    }
    const isEmail = trimmed.includes('@');
    login.mutate(
      isEmail ? { email: trimmed, password } : { phone: trimmed, password },
      { onError: (err) => Alert.alert('Login Failed', getApiError(err)) },
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
          {/* Branding */}
          <View style={styles.brandSection}>
            <View style={styles.logoBox}>
              <MaterialCommunityIcons name="home-city" size={36} color={colors.textInverse} />
            </View>
            <Text style={styles.appName}>Sri Thangam</Text>
            <Text style={styles.appTag}>HOUSING</Text>
            <Text style={styles.appSubtitle}>Member Portal</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSubtitle}>Access your team dashboard</Text>

            {/* Credential field */}
            <View style={styles.field}>
              <Text style={styles.label}>Phone or Email</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="account-outline"
                  size={18}
                  color={colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={credential}
                  onChangeText={setCredential}
                  placeholder="Enter phone or email"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password field */}
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={18}
                  color={colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { paddingRight: 44 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPwd}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPwd((v) => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialCommunityIcons
                    name={showPwd ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, login.isPending && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={login.isPending}
              activeOpacity={0.85}
            >
              {login.isPending
                ? <Text style={styles.loginBtnText}>Signing in...</Text>
                : <Text style={styles.loginBtnText}>Sign In  →</Text>
              }
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>RESTRICTED ACCESS AREA</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navy },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 24 },

  brandSection: { alignItems: 'center', marginBottom: 32 },
  logoBox: {
    width: 72, height: 72, borderRadius: radius.lg,
    backgroundColor: colors.gold,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    ...shadow.md,
    shadowColor: colors.gold,
  },
  appName: { fontSize: fontSize['2xl'], fontWeight: '700', color: colors.textInverse, letterSpacing: 0.5 },
  appTag: { fontSize: fontSize.xs, fontWeight: '700', color: colors.gold, letterSpacing: 4, marginTop: 2 },
  appSubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 6 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 24,
    ...shadow.md,
  },
  cardTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  cardSubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: 24 },

  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    position: 'relative',
  },
  inputIcon: { paddingLeft: 12 },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: 0, bottom: 0,
    justifyContent: 'center',
  },

  loginBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: colors.textInverse, fontSize: fontSize.base, fontWeight: '700' },

  footer: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 24,
    letterSpacing: 1,
  },
});
