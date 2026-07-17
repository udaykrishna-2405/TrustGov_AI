export const DEMO_MODE = true;

// Mock user definition for the demo
export const DEMO_CITIZEN_USER = {
  id: 'citizen-demo',
  name: 'Citizen User',
  email: 'citizen@tn.gov.in',
  role: 'citizen',
  workspace_id: 'tn_gov',
  workspace: {
    id: 'tn_gov',
    name: 'TN Government',
    type: 'government' as const
  }
};

export const authService = {
  async sendOTP(phone: string): Promise<{ success: boolean; message: string }> {
    if (DEMO_MODE) {
      // Simulate network delay
      await new Promise(r => setTimeout(r, 1500));
      return { success: true, message: 'OTP Sent Successfully' };
    } else {
      // TODO: Supabase Phone Auth
      // const { data, error } = await supabase.auth.signInWithOtp({ phone });
      // if (error) throw error;
      // return { success: true, message: 'OTP Sent Successfully' };
      return { success: false, message: 'Not implemented' };
    }
  },

  async verifyOTP(phone: string, otp: string): Promise<{ success: boolean; message: string }> {
    if (DEMO_MODE) {
      // Simulate network delay
      await new Promise(r => setTimeout(r, 1500));
      
      if (otp === '123456') {
        localStorage.setItem("citizenAuthenticated", "true");
        localStorage.setItem("citizenPhone", phone);
        return { success: true, message: 'Phone Number Verified Successfully' };
      } else {
        return { success: false, message: 'Invalid OTP' };
      }
    } else {
      // TODO: Supabase Phone Auth
      // const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
      // if (error) throw error;
      // return { success: true, message: 'Phone Number Verified Successfully' };
      return { success: false, message: 'Not implemented' };
    }
  },

  async logout(): Promise<void> {
    if (DEMO_MODE) {
      localStorage.removeItem("citizenAuthenticated");
      localStorage.removeItem("citizenPhone");
    } else {
      // TODO: Supabase Phone Auth
      // await supabase.auth.signOut();
    }
  },

  isAuthenticated(): boolean {
    if (DEMO_MODE) {
      return localStorage.getItem("citizenAuthenticated") === "true";
    } else {
      // TODO: Supabase Phone Auth
      // const session = await supabase.auth.getSession();
      // return !!session.data.session;
      return false;
    }
  },

  getCurrentUser(): any {
    if (DEMO_MODE) {
      if (this.isAuthenticated()) {
        const phone = localStorage.getItem("citizenPhone") || '';
        return { ...DEMO_CITIZEN_USER, phone };
      }
      return null;
    } else {
      // TODO: Supabase Phone Auth
      // const { data } = await supabase.auth.getUser();
      // return data.user;
      return null;
    }
  }
};
