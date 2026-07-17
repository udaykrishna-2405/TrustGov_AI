import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Loader2, CheckCircle, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface CitizenOTPLoginProps {
  onSuccess?: () => void;
}

export function CitizenOTPLogin({ onSuccess }: CitizenOTPLoginProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  
  // Phone State
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Resend Timer
  const [timeLeft, setTimeLeft] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: any;
    if (step === 'otp' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const validatePhone = (p: string) => {
    const cleaned = p.replace(/\D/g, '');
    if (cleaned.length !== 10 && cleaned.length !== 12) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(phone)) return;
    
    setIsSending(true);
    setPhoneError('');
    
    const res = await authService.sendOTP(phone);
    setIsSending(false);
    
    if (res.success) {
      setStep('otp');
      setTimeLeft(30);
    } else {
      setPhoneError(res.message);
    }
  };

  const handleResendOTP = async () => {
    setIsSending(true);
    await authService.sendOTP(phone);
    setIsSending(false);
    setTimeLeft(30);
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setOtpError('Please enter the full 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    setOtpError('');

    const res = await authService.verifyOTP(phone, otpString);
    setIsVerifying(false);

    if (res.success) {
      setStep('success');
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = '/gov/dashboard';
        }
      }, 1500);
    } else {
      setOtpError(res.message);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        
        {step === 'phone' && (
          <motion.form 
            key="phone-form"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onSubmit={handleSendOTP}
            className="space-y-5"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                <Smartphone className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Citizen Secure Login</h2>
              <p className="text-sm text-slate-500 mt-1">Enter your mobile number to receive an OTP.</p>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneError) setPhoneError('');
                  }}
                  className={`w-full pl-12 pr-4 py-4 rounded-xl border ${phoneError ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'} focus:outline-none transition-colors text-lg`}
                  placeholder="+91 98765 43210"
                  autoFocus
                />
              </div>
              {phoneError && (
                <div className="flex items-center gap-2 text-red-600 text-xs mt-2 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{phoneError}</span>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isSending || phone.length < 10}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
            </button>
          </motion.form>
        )}

        {step === 'otp' && (
          <motion.div 
            key="otp-form"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-5"
          >
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Verification Code</h2>
              <p className="text-sm text-slate-500 mt-1">
                Enter the 6-digit code sent to <br/><span className="font-bold text-slate-900">{phone}</span>
              </p>
            </div>

            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(index, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(index, e)}
                  className={`w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold rounded-xl border ${otpError ? 'border-red-300' : 'border-slate-200 focus:border-blue-500'} focus:outline-none bg-slate-50 focus:bg-white transition-all`}
                />
              ))}
            </div>

            {otpError && (
              <div className="flex items-center gap-2 text-red-600 text-xs mt-2 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            <button 
              onClick={() => handleVerifyOTP()}
              disabled={isVerifying || otp.join('').length !== 6}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Access'}
            </button>

            <div className="text-center mt-6">
              <button 
                onClick={handleResendOTP}
                disabled={timeLeft > 0 || isSending}
                className="text-sm font-bold text-slate-500 hover:text-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {timeLeft > 0 ? `Resend OTP in ${timeLeft}s` : 'Resend OTP'}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-10 flex flex-col items-center justify-center text-center space-y-4"
          >
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Verified Successfully</h2>
            <p className="text-slate-500">Redirecting you to the Citizen Portal...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
