import React, { useState } from 'react';
import { useReportStore } from '../store';
import { Eye, EyeOff, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess?: () => void;
}

type ErrorStateMode = 'none' | 'invalid_credentials' | 'not_authorized' | 'account_disabled';

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { actions } = useReportStore();

  const [viewMode, setViewMode] = useState<'login' | 'forgot_password'>('login');
  const [email, setEmail] = useState('name@agency.gov');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMode, setErrorMode] = useState<ErrorStateMode>('none');
  const [resetSent, setResetSent] = useState(false);

  // Handle standard credentials sign in
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (errorMode !== 'none') {
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      actions.loginWithCredentials(email, password);
      if (onLoginSuccess) onLoginSuccess();
    }, 700);
  };

  // Handle Sign In with Google
  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      actions.loginWithGoogle('juan.delacruz@environment.gov.ph', 'Juan Dela Cruz');
      if (onLoginSuccess) onLoginSuccess();
    }, 700);
  };

  // Handle Forgot Password reset
  const handleSendReset = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setResetSent(true);
    }, 600);
  };

  const getErrorMessage = () => {
    switch (errorMode) {
      case 'invalid_credentials':
        return 'Email or password is incorrect.';
      case 'not_authorized':
        return 'This account is not authorized to access the Government Portal.';
      case 'account_disabled':
        return 'This account has been disabled. Contact your system administrator.';
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F5F7FA] font-['Public_Sans',sans-serif] select-none">
      {/* LEFT PANEL: Deep Blue Brand Side */}
      <div className="w-full lg:w-5/12 bg-[#0B1370] text-white flex flex-col justify-between p-8 sm:p-12 lg:p-16 shrink-0 relative overflow-hidden">
        {/* Background ambient subtle geometric glow */}
        <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Brand Header */}
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-md shrink-0">
            <svg viewBox="0 0 100 143.6" className="w-6 h-auto" fill="none">
              <path
                d="M17.6 11.9L28.1 26.8L33.8 22.4L39.2 19.8L45.2 18.2L52.3 17.9L56.7 18.5L62.5 20.4L68.0 23.5L73.0 27.9L76.5 32.3L79.1 37.4L80.5 41.6L81.5 46.8L81.5 52.7L80.4 58.6L78.2 64.2L75.0 69.4L87.0 86.0L92.5 75.4L97.2 63.9L99.5 55.3L100.0 47.4L98.9 39.2L95.9 30.0L91.5 22.0L86.5 15.7L79.6 9.6L71.1 4.6L63.4 1.7L53.1 0.0L43.6 0.3L34.5 2.4L25.6 6.3Z"
                fill="#0018FF"
              />
              <path
                d="M17.4 12.1L13.7 15.5L10.2 19.6L4.4 29.4L1.3 38.6L0.0 48.7L0.5 55.1L3.3 65.1L8.5 77.2L14.8 89.0L27.0 71.7L23.4 66.7L20.7 61.4L18.7 52.7L18.7 46.8L19.2 43.5L21.0 37.4L24.0 31.9L27.9 27.0Z"
                fill="#FFCD13"
              />
              <path
                d="M27.2 71.7L14.9 89.0L22.6 102.2L34.5 120.3L39.2 125.0L43.5 127.2L48.5 128.3L54.6 127.8L60.6 125.1L62.6 123.5L65.8 119.9L79.1 99.2L64.4 78.3L59.2 80.4L54.2 81.5L47.6 81.6L40.5 80.2L35.3 78.0L30.6 74.9Z"
                fill="#D60E00"
              />
              <path
                d="M40.5 137.0L40.5 139.4L41.8 141.3L44.7 143.0L47.9 143.6L51.6 143.3L54.5 142.2L56.0 141.0L57.1 138.8L57.0 136.9L55.1 134.5L50.5 132.8L46.9 132.8L44.1 133.6L42.2 134.7Z"
                fill="#D60E00"
              />
            </svg>
          </div>
          <div className="font-extrabold text-base tracking-[0.18em] text-white">
            PROBELEMA
          </div>
        </div>

        {/* Center Hero Tagline matching wireframes */}
        <div className="my-16 lg:my-0 z-10 space-y-2">
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-white tracking-tight leading-[1.2]">
            Probe the Problem.
            <br />
            Track the Action.
            <br />
            See the Solution.
          </h1>
          <div className="w-14 h-1.5 bg-[#D60E00] rounded-full mt-4" />
        </div>

        {/* Bottom Version Tag matching wireframe */}
        <div className="text-xs text-white/50 tracking-wide font-medium z-10">
          Government Operations Portal · Foundations v0.1
        </div>
      </div>

      {/* RIGHT PANEL: Authentication Form & Wireframe State Inspector */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        {/* Wireframe State Tester Banner */}
        <div className="w-full max-w-md mb-4 bg-white/80 backdrop-blur-xs border border-slate-200 rounded-xl p-2.5 shadow-xs flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700">Wireframe States:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setErrorMode('none')}
              className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors ${
                errorMode === 'none'
                  ? 'bg-[#0B1370] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Default
            </button>
            <button
              onClick={() => setErrorMode('invalid_credentials')}
              className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors ${
                errorMode === 'invalid_credentials'
                  ? 'bg-[#D60E00] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Invalid
            </button>
            <button
              onClick={() => setErrorMode('not_authorized')}
              className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors ${
                errorMode === 'not_authorized'
                  ? 'bg-[#D60E00] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Unauthorized
            </button>
            <button
              onClick={() => setErrorMode('account_disabled')}
              className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors ${
                errorMode === 'account_disabled'
                  ? 'bg-[#D60E00] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Disabled
            </button>
          </div>
        </div>

        {/* LOGIN CARD */}
        {viewMode === 'login' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[#D5DCE5] p-8 sm:p-10 w-full max-w-md animate-in fade-in zoom-in-98 duration-150">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#0B1370] tracking-tight">
                Government Portal
              </h2>
              <p className="text-sm text-[#4B5563] mt-1">
                Sign in to manage community reports.
              </p>
            </div>

            {/* Error Banner matching wireframes */}
            {getErrorMessage() && (
              <div className="mb-5 p-3.5 border border-[#D60E00] bg-red-50/70 text-[#D60E00] rounded-xl text-xs flex items-center gap-2.5 font-medium leading-relaxed">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#D60E00]" />
                <span>{getErrorMessage()}</span>
              </div>
            )}

            {/* Google Authentication Button */}
            <div className="mb-5">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-11 px-4 border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-lg text-xs tracking-wider uppercase flex items-center justify-center gap-3 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {/* Official Google 'G' Logo SVG */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase tracking-wider text-slate-400">
                  <span className="bg-white px-2">or sign in with email</span>
                </div>
              </div>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Government Email Input */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Government Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agency.gov"
                  className={`w-full bg-white rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-all ${
                    errorMode !== 'none'
                      ? 'border border-[#D60E00] focus:ring-1 focus:ring-[#D60E00] focus:outline-none'
                      : 'border border-[#9AA5B1] focus:border-2 focus:border-[#0018FF] focus:outline-none'
                  }`}
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className={`w-full bg-white rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 pr-10 transition-all ${
                      errorMode !== 'none'
                        ? 'border border-[#D60E00] focus:ring-1 focus:ring-[#D60E00] focus:outline-none'
                        : 'border border-[#9AA5B1] focus:border-2 focus:border-[#0018FF] focus:outline-none'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot Password Row matching wireframe */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#0018FF] focus:ring-[#0018FF]"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setViewMode('forgot_password');
                    setResetSent(false);
                  }}
                  className="text-[#0018FF] font-semibold hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Action Button: SIGN IN or Signing in... */}
              <div className="pt-2">
                {isLoading ? (
                  <button
                    type="button"
                    disabled
                    className="w-full h-11 bg-slate-500 text-white font-bold rounded-lg text-xs tracking-wider uppercase flex items-center justify-center cursor-not-allowed shadow-xs"
                  >
                    Signing in...
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="w-full h-11 bg-[#0018FF] hover:bg-blue-700 text-white font-bold rounded-lg text-xs tracking-wider uppercase transition-colors shadow-sm cursor-pointer"
                  >
                    SIGN IN
                  </button>
                )}
              </div>
            </form>

            {/* Bottom note matching wireframe */}
            <div className="text-xs text-slate-500 text-center mt-6">
              Authorized government personnel only.
            </div>
          </div>
        ) : (
          /* FORGOT PASSWORD CARD matching wireframe */
          <div className="bg-white rounded-2xl shadow-sm border border-[#D5DCE5] p-8 sm:p-10 w-full max-w-md animate-in fade-in zoom-in-98 duration-150">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#0B1370] tracking-tight">
                Forgot password
              </h2>
              <p className="text-sm text-[#4B5563] mt-1">
                Enter your government email and we will send a reset link.
              </p>
            </div>

            {resetSent && (
              <div className="mb-5 p-3.5 border border-emerald-300 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2.5 font-medium leading-relaxed">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Reset link sent! Please check your official agency inbox.</span>
              </div>
            )}

            <form onSubmit={handleSendReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Government Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agency.gov"
                  className="w-full bg-white border border-[#9AA5B1] focus:border-2 focus:border-[#0018FF] rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-[#0018FF] hover:bg-blue-700 text-white font-bold rounded-lg text-xs tracking-wider uppercase transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'SEND RESET LINK'}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className="text-xs font-bold text-[#0018FF] hover:underline cursor-pointer"
                >
                  Back to sign in
                </button>
              </div>
            </form>

            <div className="text-xs text-slate-500 text-center mt-6">
              Authorized government personnel only.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
