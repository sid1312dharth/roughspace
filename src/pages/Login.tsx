import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store';
import { authService, DEMO_ACCOUNTS } from '@/services/auth';
import {
  PenSquare,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Cloud,
  Zap,
  User,
  X,
  Server,
  KeyRound,
  Rocket,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const perks = [
  { icon: Cloud, text: 'Cloud sync across every device' },
  { icon: ShieldCheck, text: 'Your writing stays private, always' },
  { icon: Zap, text: 'Offline-first — never lose a single word' },
];

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals & Drawers
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const [showCloudConfigModal, setShowCloudConfigModal] = useState(false);
  const [customCloudUrl, setCustomCloudUrl] = useState(
    () => authService.getCustomCloudConfig()?.url || import.meta.env.VITE_SUPABASE_URL || ''
  );
  const [customCloudKey, setCustomCloudKey] = useState(
    () => authService.getCustomCloudConfig()?.key || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );

  const navigate = useNavigate();
  const { addToast } = useAppStore();
  const { signIn, signUp, signInWithDemo, isSupabaseConfigured } = useAuth();

  // Password strength helper
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-transparent' };
    if (pass.length < 6) return { score: 1, label: 'Weak', color: 'bg-[var(--color-error)]' };
    const hasLetters = /[a-zA-Z]/.test(pass);
    const hasNumbers = /[0-9]/.test(pass);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pass);

    if (pass.length >= 8 && hasLetters && (hasNumbers || hasSpecial)) {
      return { score: 3, label: 'Strong', color: 'bg-[var(--color-success)]' };
    }
    return { score: 2, label: 'Fair', color: 'bg-[var(--color-warning)]' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signIn(email, password, rememberMe);
        addToast({
          type: 'success',
          title: 'Welcome back!',
          description: `Signed in as ${email}`,
        });
        navigate('/');
      } else {
        await signUp(name, email, password);
        addToast({
          type: 'success',
          title: 'Account created!',
          description: `Welcome to RoughSpace, ${name || 'writer'}!`,
        });
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoId: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithDemo(demoId);
      addToast({
        type: 'success',
        title: 'Logged in as Demo User',
        description: `Welcome, ${user.name}!`,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCloudConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCloudUrl && customCloudKey) {
      authService.setCustomCloudConfig(customCloudUrl, customCloudKey);
      addToast({
        type: 'success',
        title: 'Cloud Configuration Saved',
        description: 'Supabase credentials updated for this browser.',
      });
      setShowCloudConfigModal(false);
    } else {
      authService.clearCustomCloudConfig();
      addToast({
        type: 'info',
        title: 'Default Cloud Mode Active',
        description: 'Cleared custom Supabase configuration.',
      });
      setShowCloudConfigModal(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSubmitted(true);
    setTimeout(() => {
      addToast({
        type: 'info',
        title: 'Password reset email simulated',
        description: `If an account exists for ${forgotEmail}, instructions were logged.`,
      });
      setShowForgotModal(false);
      setForgotSubmitted(false);
      setForgotEmail('');
    }, 1200);
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-[var(--color-bg)]">
      {/* Ambient glow orbs */}
      <div
        className="orb w-[36rem] h-[36rem] -top-40 -left-40 animate-[var(--animate-drift)] pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--glow-primary), transparent 70%)' }}
      />
      <div
        className="orb w-[32rem] h-[32rem] -bottom-40 right-0 animate-[var(--animate-drift)] pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--glow-accent), transparent 70%)', animationDelay: '-9s' }}
      />

      {/* Top action bar */}
      <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors px-3 py-2 rounded-xl hover:bg-[var(--color-bg-hover)] border border-transparent hover:border-[var(--color-border)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to App</span>
        </button>

        <button
          onClick={() => setShowCloudConfigModal(true)}
          className={cn(
            'flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border transition-all',
            isSupabaseConfigured
              ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20'
              : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)] border-[var(--color-border)] hover:text-[var(--color-text)]'
          )}
          title="Configure Supabase Cloud Sync"
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Local Auth Mode'}</span>
        </button>
      </div>

      {/* Left panel — brand / value highlights */}
      <div className="relative z-10 hidden lg:flex lg:w-1/2 flex-col justify-between p-14 border-r border-[var(--color-border)]">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 pt-6"
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] shadow-[var(--shadow-glow)]">
            <PenSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-gradient block">RoughSpace</span>
            <span className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-semibold">
              My Writing Pad
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-md my-auto py-12"
        >
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)] mb-4 px-3 py-1 rounded-full bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20">
            <Sparkles className="w-3.5 h-3.5" />
            Distraction-Free Workspace
          </div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-[var(--color-text)] mb-4">
            Where your best thoughts take shape.
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed mb-8">
            An offline-first, private writing pad with instant templates, version history, and cloud sync.
          </p>

          <div className="space-y-4">
            {perks.map((perk, i) => (
              <motion.div
                key={perk.text}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + i * 0.08 }}
                className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-sm">
                  <perk.icon className="w-4 h-4 text-[var(--color-primary)]" />
                </div>
                <span className="font-medium text-[var(--color-text)]">{perk.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="flex items-center justify-between text-xs text-[var(--color-text-tertiary)] pt-4 border-t border-[var(--color-border)]">
          <span>End-to-end private & local by default</span>
          <span>Version 2.0 Reformation</span>
        </div>
      </div>

      {/* Right panel — authentication form */}
      <div className="relative z-10 flex flex-1 items-center justify-center p-6 sm:p-10 pt-20 lg:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md glass-panel-elevated glow-border rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="p-8 sm:p-10">
            {/* Mobile Header */}
            <div className="flex flex-col items-center mb-6 lg:hidden">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-white rounded-2xl flex items-center justify-center mb-3 shadow-[var(--shadow-glow)]">
                <PenSquare className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--color-text)]">RoughSpace</h1>
              <p className="text-xs text-[var(--color-text-tertiary)]">My Writing Pad</p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex p-1 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)] mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError(null);
                }}
                className={cn(
                  'flex-1 py-2 text-sm font-semibold rounded-xl transition-all',
                  isLogin
                    ? 'bg-[var(--color-surface-elevated)] text-[var(--color-text)] shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                )}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError(null);
                }}
                className={cn(
                  'flex-1 py-2 text-sm font-semibold rounded-xl transition-all',
                  !isLogin
                    ? 'bg-[var(--color-surface-elevated)] text-[var(--color-text)] shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                )}
              >
                Create Account
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[var(--color-text)]">
                {isLogin ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                {isLogin
                  ? 'Sign in to access your customized documents and settings.'
                  : 'Get started with a private, offline-first personal workspace.'}
              </p>
            </div>

            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 mb-4 rounded-xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)] text-xs font-medium flex items-center justify-between"
                >
                  <span>{error}</span>
                  <button onClick={() => setError(null)} className="p-1 hover:opacity-80">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name on Sign Up */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)]"
                      placeholder="Jane Writer"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)]"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    Password
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs text-[var(--color-primary)] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)]"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text)]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength indicator on sign-up */}
                {!isLogin && password && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex gap-1 h-1 w-full bg-[var(--color-bg)] rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full transition-all duration-300',
                          passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent',
                          passwordStrength.score === 1 ? 'w-1/3' : passwordStrength.score === 2 ? 'w-2/3' : 'w-full'
                        )}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[var(--color-text-tertiary)]">
                      <span>Must be at least 6 characters</span>
                      <span className="font-medium text-[var(--color-text-secondary)]">{passwordStrength.label}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Remember me checkbox */}
              {isLogin && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] h-4 w-4 bg-[var(--color-bg)] cursor-pointer"
                  />
                  <label htmlFor="rememberMe" className="text-xs text-[var(--color-text-secondary)] cursor-pointer select-none">
                    Remember me on this browser
                  </label>
                </div>
              )}

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={loading || !email || !password || (!isLogin && !name)}
                whileHover={{ scale: loading || !email || !password ? 1 : 1.01 }}
                whileTap={{ scale: loading || !email || !password ? 1 : 0.98 }}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold transition-all duration-300 mt-2 shadow-sm',
                  loading || !email || !password || (!isLogin && !name)
                    ? 'bg-[var(--color-primary)]/40 cursor-not-allowed text-white/70'
                    : 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] hover:shadow-[var(--shadow-glow)]'
                )}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isLogin ? (
                  'Sign In'
                ) : (
                  'Create Free Account'
                )}
              </motion.button>
            </form>

            {/* Quick 1-Click Demo Logins */}
            <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] flex items-center gap-1.5">
                  <Rocket className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  Instant Demo Access
                </span>
                <span className="text-[10px] text-[var(--color-primary)] font-medium">No signup needed</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((demo) => (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => handleDemoLogin(demo.id)}
                    disabled={loading}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-primary)]/40 text-left transition-all group"
                  >
                    <img
                      src={demo.avatar_url}
                      alt={demo.name}
                      className="w-7 h-7 rounded-full object-cover border border-[var(--color-border)]"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                        {demo.name}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-tertiary)] truncate">{demo.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm glass-panel-elevated glow-border rounded-2xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowForgotModal(false)}
                className="absolute top-4 right-4 text-[var(--color-text-tertiary)] hover:text-[var(--color-text)]"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[var(--color-text)]">Reset Password</h3>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mb-4">
                Enter your email address and we'll send a simulated recovery link.
              </p>

              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your account email"
                  required
                  className="w-full px-3 py-2 text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                />
                <button
                  type="submit"
                  disabled={forgotSubmitted || !forgotEmail}
                  className="w-full py-2 bg-[var(--color-primary)] text-white text-xs font-semibold rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors flex items-center justify-center gap-1.5"
                >
                  {forgotSubmitted ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Supabase Cloud Configuration Modal */}
      <AnimatePresence>
        {showCloudConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass-panel-elevated glow-border rounded-2xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowCloudConfigModal(false)}
                className="absolute top-4 right-4 text-[var(--color-text-tertiary)] hover:text-[var(--color-text)]"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)]">
                  <Server className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[var(--color-text)]">Cloud Sync Settings</h3>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mb-4">
                RoughSpace defaults to private offline-first storage. You can optionally connect your own Supabase project for real-time multi-device cloud synchronization.
              </p>

              <form onSubmit={handleSaveCloudConfig} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={customCloudUrl}
                    onChange={(e) => setCustomCloudUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3 py-2 text-xs bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    Supabase Anon Key
                  </label>
                  <input
                    type="password"
                    value={customCloudKey}
                    onChange={(e) => setCustomCloudKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className="w-full px-3 py-2 text-xs bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomCloudUrl('');
                      setCustomCloudKey('');
                      authService.clearCustomCloudConfig();
                      setShowCloudConfigModal(false);
                      addToast({ type: 'info', title: 'Reverted to local mode' });
                    }}
                    className="flex-1 py-2 text-xs font-semibold rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
                  >
                    Clear & Use Local
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[var(--color-primary)] text-white text-xs font-semibold rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors"
                  >
                    Save Configuration
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
