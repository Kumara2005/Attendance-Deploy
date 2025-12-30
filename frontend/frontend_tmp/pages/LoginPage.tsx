
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { ShieldCheck, User, Users, GraduationCap, ArrowLeft, Mail, Lock, Loader2, Sparkles } from 'lucide-react';
import { authService } from '../services/authService';

interface LoginPageProps {
  onLogin: (role: UserRole, email?: string) => void;
}

type LoginStep = 'role-selection' | 'login-form';

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [step, setStep] = useState<LoginStep>('role-selection');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('login-form');
    setError('');
    // Pre-fill for convenience
    if (role === UserRole.STAFF) {
      setUsername('staff');
      setPassword('staff123');
    } else if (role === UserRole.ADMIN) {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('student');
      setPassword('student123');
    }
  };

  const handleBack = () => {
    setStep('role-selection');
    setSelectedRole(null);
    setError('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // FRONTEND-ONLY MODE: Mock authentication without backend
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock authentication - validate credentials
      const mockUsers = {
        'admin': { password: 'admin123', role: UserRole.ADMIN, name: 'Dr. Sarah Jenkins', email: 'admin@attendx.edu', userId: 'admin_1' },
        'staff': { password: 'staff123', role: UserRole.STAFF, name: 'Prof. John Smith', email: 'staff@attendx.edu', userId: 'staff_1' },
        'student': { password: 'student123', role: UserRole.STUDENT, name: 'Alex Rivera', email: 'alex.rivera@attendx.edu', userId: 'student_1' }
      };

      const user = mockUsers[username.toLowerCase() as keyof typeof mockUsers];
      
      if (!user || user.password !== password) {
        throw new Error('Invalid credentials. Please try again.');
      }

      // Store mock user data in localStorage with correct key that App.tsx expects
      localStorage.setItem('user_data', JSON.stringify({
        userId: user.userId,
        username: username,
        role: user.role,
        name: user.name,
        email: user.email
      }));

      // Call onLogin for App state management
      onLogin(user.role, user.email);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showSplash) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8 animate-out fade-out duration-700 ease-in-out fill-mode-forwards">
        <div className="max-w-4xl w-full text-center space-y-12">
          <div className="flex flex-col items-center animate-in fade-in zoom-in-95 slide-in-from-bottom-12 duration-1000 ease-out">
            <div className="flex items-center gap-6 mb-16">
              <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-3xl shadow-indigo-500/30">
                <GraduationCap className="text-white w-9 h-9" />
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter">AttendX</h1>
            </div>
            
            <h2 className="text-[5rem] md:text-[8rem] font-black text-slate-900 leading-[0.9] tracking-tightest text-left">
              The <br />
              <span className="text-indigo-600">Future</span> of <br />
              Campus <br />
              Engagement.
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-jakarta animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out">
      {/* Left Side: Branding Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative p-16 flex-col justify-center overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1523050338692-7b84ba2111ef?auto=format&fit=crop&q=80&w=2070" 
            alt="Campus" 
            className="w-full h-full object-cover opacity-60 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-white via-white/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white"></div>
        </div>

        <div className="relative z-10 animate-in slide-in-from-left-12 duration-1000">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40">
              <GraduationCap className="text-white w-7 h-7" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">AttendX</h1>
          </div>
          <h2 className="text-7xl font-extrabold text-slate-900 leading-tight tracking-tighter max-w-lg">
            The <br /><span className="text-indigo-600">Future</span> of Campus Engagement.
          </h2>
        </div>
      </div>

      {/* Right Side: Portal Selection Portal */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 relative bg-slate-50">
        <div className="w-full max-w-xl relative z-10">
          {step === 'role-selection' ? (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-12 duration-1000">
              <div className="text-center lg:text-left">
                <h3 className="text-[3.5rem] font-black text-slate-900 tracking-tight leading-none mb-4">Welcome</h3>
                <p className="text-slate-500 text-lg font-medium">Select your portal to continue to your dashboard.</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <RoleSelectionButton 
                  title="Institutional Admin" 
                  icon={<ShieldCheck className="w-6 h-6" />}
                  color="indigo"
                  onClick={() => handleRoleSelect(UserRole.ADMIN)}
                />
                <RoleSelectionButton 
                  title="Academic Staff" 
                  icon={<Users className="w-6 h-6" />}
                  color="emerald"
                  onClick={() => handleRoleSelect(UserRole.STAFF)}
                />
                <RoleSelectionButton 
                  title="Student Portal" 
                  icon={<User className="w-6 h-6" />}
                  color="violet"
                  onClick={() => handleRoleSelect(UserRole.STUDENT)}
                />
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-12 duration-700">
              <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200">
                <button 
                  onClick={handleBack}
                  className="flex items-center gap-3 text-slate-400 hover:text-indigo-600 mb-10 transition-all text-xs font-black uppercase tracking-widest group"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                  Back to Roles
                </button>
                
                <div className="mb-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-100">
                    <Sparkles className="w-3 h-3" /> Secure Access
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                    {selectedRole} Login
                  </h2>
                  <p className="text-slate-400 font-medium">Please enter your institutional credentials.</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-8">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                      <input 
                        required
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        className="w-full bg-slate-50 border border-slate-100 text-slate-900 pl-14 pr-6 py-5 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 font-medium text-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                      <input 
                        required
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-100 text-slate-900 pl-14 pr-6 py-5 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 font-medium text-lg"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-6 rounded-3xl shadow-2xl transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-xs mt-4 group"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Initialize Dashboard
                        <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RoleSelectionButton: React.FC<{ title: string; icon: React.ReactNode; color: string; onClick: () => void }> = ({ title, icon, color, onClick }) => {
  const colorMap: any = {
    indigo: 'bg-indigo-600 shadow-indigo-500/20',
    emerald: 'bg-emerald-600 shadow-emerald-500/20',
    violet: 'bg-violet-600 shadow-violet-500/20'
  };

  return (
    <button
      onClick={onClick}
      className="bg-white p-7 rounded-[3rem] flex items-center justify-between group hover:bg-slate-50 transition-all duration-500 border border-slate-100 hover:border-indigo-200 active:scale-[0.98] card-shadow"
    >
      <div className="flex items-center gap-6">
        <div className={`w-16 h-16 rounded-2xl ${colorMap[color]} flex items-center justify-center text-white shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
          {icon}
        </div>
        <div className="text-left">
          <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{title}</h4>
        </div>
      </div>
      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:translate-x-2 transition-all">
        <ArrowLeft className="w-5 h-5 rotate-180 text-slate-400 group-hover:text-indigo-600" />
      </div>
    </button>
  );
};

export default LoginPage;
