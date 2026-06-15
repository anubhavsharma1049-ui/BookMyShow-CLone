import React, { useState } from 'react';
import { X, User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { UserAccount } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export default function AuthModal({ onClose, onLoginSuccess }: AuthModalProps) {
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  
  // Registration and Login form fields
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneSuffix, setPhoneSuffix] = useState<string>(''); // 10 digit number block
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Single login credential input (can be either email or 10-digit phone number)
  const [loginCredential, setLoginCredential] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  // Custom validation states & error strings
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Helper validation routines
  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const validatePhone = (val: string) => {
    // Check if exactly 10 digits
    return /^\d{10}$/.test(val);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    // Validate Name
    if (!name.trim()) {
      newErrors.name = 'Please enter your full name.';
    }

    // Validate Email
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please provide a valid email structure (e.g. name@domain.com).';
    }

    // Validate Phone: must contain exactly 10 digits (added on top of +91)
    const phoneClean = phoneSuffix.replace(/\D/g, ''); // strip any spaces/dashes
    if (!phoneClean) {
      newErrors.phone = '10-digit Indian phone number is required.';
    } else if (!validatePhone(phoneClean)) {
      newErrors.phone = 'Indian phone number must be exactly 10 digits.';
    }

    // Validate Password
    if (!password) {
      newErrors.password = 'Please configure a password.';
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters for security.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Success validation: Retrieve current registers
    setErrors({});
    const storedUsersJson = localStorage.getItem('BMT_REGISTERED_USERS');
    const registeredUsers: UserAccount[] = storedUsersJson ? JSON.parse(storedUsersJson) : [];

    // Check pre-existence of phone or email
    const fullPhoneNumber = `+91 ${phoneClean}`;
    const emailCollision = registeredUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
    const phoneCollision = registeredUsers.some(u => u.phoneNumber === fullPhoneNumber);

    if (emailCollision) {
      setErrors({ email: 'This email address is already registered.' });
      return;
    }
    if (phoneCollision) {
      setErrors({ phone: 'This +91 phone number is already registered.' });
      return;
    }

    // Add new user context
    const newUser: UserAccount = {
      name: name.trim(),
      email: email.trim(),
      phoneNumber: fullPhoneNumber,
      password: password,
      balance: 1500 // starts with ₹1500 free movie allowance
    };

    registeredUsers.push(newUser);
    localStorage.setItem('BMT_REGISTERED_USERS', JSON.stringify(registeredUsers));

    // Sign them in immediately
    onLoginSuccess(newUser);
    onClose();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!loginCredential.trim()) {
      newErrors.credential = 'Please enter your registered Email or +91 Phone Number.';
    }

    if (!loginPassword) {
      newErrors.loginPassword = 'Password is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Attempt retrieval
    setErrors({});
    const storedUsersJson = localStorage.getItem('BMT_REGISTERED_USERS');
    const registeredUsers: UserAccount[] = storedUsersJson ? JSON.parse(storedUsersJson) : [];

    // Custom helper to normalization check
    const cred = loginCredential.trim().toLowerCase();
    
    // Support either clean decimal lookup, with or without '+91'
    const foundUser = registeredUsers.find(u => {
      const uEmail = u.email.toLowerCase();
      const uPhoneClean = u.phoneNumber.replace(/\s+/g, ''); // '+919999999999'
      const inputPhoneClean = cred.replace(/\D/g, ''); // clear formatting

      const phoneMatches = uPhoneClean.includes(inputPhoneClean) && inputPhoneClean.length >= 10;
      return uEmail === cred || phoneMatches;
    });

    if (!foundUser) {
      setErrors({ 
        credential: 'No registered account found matching this Email or Phone.',
        suggestSignup: 'true'
      });
      return;
    }

    if (foundUser.password !== loginPassword) {
      setErrors({ loginPassword: 'The entered password is incorrect.' });
      return;
    }

    // Success Authentication
    onLoginSuccess(foundUser);
    onClose();
  };

  return (
    <div id="auth-modal-backdrop" className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-55 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 border border-slate-100">
        
        {/* Banner header line colored */}
        <div className="bg-slate-900 px-6 py-5 text-white flex justify-between items-center relative">
          <div>
            <div className="flex items-center gap-1.5 text-rose-500 font-extrabold text-sm uppercase tracking-wider">
              <Sparkles className="w-4 h-4 fill-rose-500" />
              BookMyTheatre Club
            </div>
            <h3 className="text-xl font-black mt-1">
              {isLoginMode ? 'Sign In to Your Account' : 'Create New Account'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              {isLoginMode 
                ? 'Unlock quick ticket checking & loyalty cash benefits' 
                : 'Get ₹1500 free play balance on signing up'
              }
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-colors rounded-xl p-2 cursor-pointer absolute right-4 top-4"
            title="Close authentication window"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {isLoginMode ? (
            /* LOGIN SCREEN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Login Credential input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Email URL or Indian Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="name@domain.com or 10-digit number"
                    value={loginCredential}
                    onChange={(e) => setLoginCredential(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 border border-slate-200 focus:border-rose-500 outline-none rounded-xl py-2.5 pl-9 pr-4 text-xs transition-colors"
                  />
                </div>
                {errors.credential && (
                  <div className="space-y-2 mt-1">
                    <p className="text-[10px] text-red-500 font-semibold leading-relaxed">{errors.credential}</p>
                    {errors.suggestSignup === 'true' && (
                      <button
                        type="button"
                        onClick={() => {
                          const cred = loginCredential.trim();
                          if (validateEmail(cred)) {
                            setEmail(cred);
                          } else {
                            const cleanDigits = cred.replace(/\D/g, '');
                            if (cleanDigits.length >= 10) {
                              setPhoneSuffix(cleanDigits.slice(-10));
                            } else if (cleanDigits.length > 0) {
                              setPhoneSuffix(cleanDigits);
                            }
                          }
                          setIsLoginMode(false);
                          setErrors({});
                        }}
                        className="text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-250 hover:border-rose-300 font-extrabold px-3 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 w-full uppercase tracking-wider"
                      >
                        Create BMT Profile with "{loginCredential}" instead?
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Enter password input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Enter Account Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 border border-slate-200 focus:border-rose-500 outline-none rounded-xl py-2.5 pl-9 pr-10 text-xs transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.loginPassword && (
                  <p className="text-[10px] text-red-500 font-semibold">{errors.loginPassword}</p>
                )}
              </div>

              {/* Login submit action */}
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 rounded-xl transition-all shadow-md text-xs tracking-wide uppercase mt-6 cursor-pointer"
              >
                Let me in! • Log In
              </button>

              <div className="text-center pt-3">
                <p className="text-[11px] text-slate-400 font-medium">
                  Not signed in?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginMode(false);
                      setErrors({});
                    }}
                    className="text-rose-500 hover:underline font-bold cursor-pointer"
                  >
                    Sign Up
                  </button>
                </p>
              </div>

            </form>
          ) : (
            /* SIGN UP SCREEN FORM WITH +91 NATIVE VALIDATION */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              
              {/* Sign up Name input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Amit Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 border border-slate-200 focus:border-rose-500 outline-none rounded-xl py-2.5 pl-9 pr-4 text-xs transition-colors"
                  />
                </div>
                {errors.name && (
                  <p className="text-[10px] text-red-500 font-semibold">{errors.name}</p>
                )}
              </div>

              {/* Sign up Email Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="amit.kumar@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 border border-slate-200 focus:border-rose-500 outline-none rounded-xl py-2.5 pl-9 pr-4 text-xs transition-colors"
                  />
                </div>
                {errors.email && (
                  <p className="text-[10px] text-red-500 font-semibold">{errors.email}</p>
                )}
              </div>

              {/* Sign up Phone Input with forced India country code "+91" */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  India Mobile Number (10-Digit)
                </label>
                <div className="flex gap-2">
                  <div className="bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center justify-center select-none shrink-0 min-w-[65px]">
                    🇮🇳 +91
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="98765 43210"
                      value={phoneSuffix}
                      onChange={(e) => {
                        // Allow only numerals up to 10 characters
                        const clean = e.target.value.replace(/\D/g, '');
                        setPhoneSuffix(clean);
                      }}
                      className="w-full bg-slate-50 text-slate-900 border border-slate-200 focus:border-rose-500 outline-none rounded-xl py-2.5 pl-9 pr-4 text-xs transition-colors"
                    />
                  </div>
                </div>
                {errors.phone ? (
                  <p className="text-[10px] text-red-500 font-semibold">{errors.phone}</p>
                ) : (
                  <p className="text-[9px] text-slate-400 block ml-1 leading-snug">
                    Enter the subsequent <span className="font-bold text-slate-550">10 numeric digits</span> without space.
                  </p>
                )}
              </div>

              {/* Sign up Password Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Set Account Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimum 4 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 border border-slate-200 focus:border-rose-500 outline-none rounded-xl py-2.5 pl-9 pr-10 text-xs transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[10px] text-red-500 font-semibold">{errors.password}</p>
                )}
              </div>

              {/* Sign up submit action button */}
              <button
                type="submit"
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-extrabold py-3 rounded-xl transition-all shadow-md text-xs tracking-wide uppercase mt-6 cursor-pointer"
              >
                Register & Claim ₹1500 Bonus
              </button>

              <div className="text-center pt-2">
                <p className="text-[11px] text-slate-400 font-medium">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginMode(true);
                      setErrors({});
                    }}
                    className="text-rose-500 hover:underline font-bold"
                  >
                    Log In instead
                  </button>
                </p>
              </div>

            </form>
          )}

          {/* Core high-contrast safety trust badge */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            BMT Security Enforced • TLS 256-Bit
          </div>

        </div>

      </div>
    </div>
  );
}
