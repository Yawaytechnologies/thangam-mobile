import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLogin } from '../../hooks/useAuth';
import { getApiError } from '../../api/error';
import { colors, radius, shadow, fontSize, fonts } from '../../theme';

export default function LoginScreen() {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const login = useLogin();

  const isValidPhone = (phone: string) => /^[6-9]\d{9}$/.test(phone);

  function handleLogin() {
    const trimmed = credential.trim();
    if (!trimmed || !password.trim()) {
      Alert.alert('Required', 'Please enter your credentials and password.');
      return;
    }
    const isEmail = trimmed.includes('@');
    if (!isEmail && !isValidPhone(trimmed)) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit mobile number');
      return;
    }
    login.mutate(
      {
        credentials: isEmail ? { email: trimmed, password } : { phone: trimmed, password },
        keepSignedIn,
      },
      { onError: (err) => Alert.alert('Login Failed', getApiError(err)) },
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
          {/* Branding */}
          <View style={styles.brandSection}>
            <View style={styles.logoBox}>
              <MaterialCommunityIcons name="home-city" size={36} color={colors.navy} />
            </View>
            <Text style={styles.appName}>Sri Thangam</Text>
            <Text style={styles.appTag}>HOUSING</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Member Login</Text>
            <Text style={styles.cardSubtitle}>Access your team dashboard</Text>

            <View style={styles.field}>
              <Text style={styles.label}>CREDENTIALS</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="account-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={credential}
                  onChangeText={setCredential}
                  placeholder="Phone number or email"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="default"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="lock-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
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
              style={styles.checkRow}
              onPress={() => setKeepSignedIn((v) => !v)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, keepSignedIn && styles.checkboxChecked]}>
                {keepSignedIn && <MaterialCommunityIcons name="check" size={12} color={colors.navy} />}
              </View>
              <Text style={styles.checkLabel}>Keep me signed in</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginBtn, login.isPending && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={login.isPending}
              activeOpacity={0.85}
            >
              <Text style={styles.loginBtnText}>
                {login.isPending ? 'Signing in...' : 'Continue to Dashboard'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert('Request Membership', 'Please contact your branch administrator to request membership.')}
              activeOpacity={0.7}
            >
              <Text style={styles.memberLink}>
                New to the platform?{' '}
                <Text style={styles.memberLinkHighlight}>Request Membership</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => Alert.alert('Privacy Policy', 'Contact your administrator for the privacy policy document.')}>
              <Text style={styles.footerLink}>PRIVACY</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>·</Text>
            <TouchableOpacity onPress={() => Alert.alert('Terms of Use', 'Contact your administrator for terms and conditions.')}>
              <Text style={styles.footerLink}>TERMS</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>·</Text>
            <TouchableOpacity onPress={() => Alert.alert('Support', 'For assistance, please contact your branch administrator or call the helpline.')}>
              <Text style={styles.footerLink}>SUPPORT</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 14, ...shadow.md, shadowColor: colors.gold,
  },
  appName: { fontFamily: fonts.bold, fontSize: fontSize['2xl'], color: colors.textInverse, letterSpacing: 0.5 },
  appTag:  { fontFamily: fonts.bold, fontSize: fontSize.xs, color: colors.gold, letterSpacing: 4, marginTop: 2 },

  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 24, ...shadow.md },
  cardTitle:    { fontFamily: fonts.bold,    fontSize: fontSize.xl, color: colors.textPrimary, marginBottom: 4 },
  cardSubtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: 24 },

  field: { marginBottom: 16 },
  label: { fontFamily: fonts.bold, fontSize: 11, color: colors.textMuted, marginBottom: 6, letterSpacing: 1 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.sm, backgroundColor: colors.background,
    position: 'relative',
  },
  inputIcon: { paddingLeft: 12 },
  input: { fontFamily: fonts.regular, flex: 1, paddingHorizontal: 10, paddingVertical: 12, fontSize: fontSize.base, color: colors.textPrimary },
  eyeBtn: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' },

  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkbox: {
    width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  checkboxChecked: { backgroundColor: colors.gold, borderColor: colors.gold },
  checkLabel: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary },

  loginBtn: { backgroundColor: colors.gold, borderRadius: radius.sm, paddingVertical: 14, alignItems: 'center' },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { fontFamily: fonts.bold, color: colors.navy, fontSize: fontSize.base },

  memberLink: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', marginTop: 16 },
  memberLinkHighlight: { fontFamily: fonts.semiBold, color: colors.gold },

  footerLinks: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 28, gap: 10 },
  footerLink: { fontFamily: fonts.semiBold, fontSize: fontSize.xs, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.5 },
  footerDot:  { fontFamily: fonts.regular, fontSize: fontSize.xs, color: 'rgba(255,255,255,0.2)' },
});
