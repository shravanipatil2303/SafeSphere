import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isDemoMode, getModeStatus } from '../services/supabaseClient';

const AuthContext = createContext();

const BACKEND_URL = import.meta.env.VITE_BACKEND_SERVER_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth state
  useEffect(() => {
    if (!isDemoMode && supabase) {
      // Supabase Real Mode listener
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchUserProfile(session.user);
        } else {
          setUser(null);
          setLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          fetchUserProfile(session.user);
        } else {
          setUser(null);
          setLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Demo Mode Auth persistence
      const savedUser = localStorage.getItem('safesphere_user');
      if (savedUser) {
        try { setUser(JSON.parse(savedUser)); } catch (e) {}
      } else {
        // Default seed demo citizen session
        const defaultCitizen = {
          id: 'usr-citizen-demo',
          email: 'citizen@safesphere.org',
          name: 'Demo Citizen',
          role: 'citizen'
        };
        setUser(defaultCitizen);
        localStorage.setItem('safesphere_user', JSON.stringify(defaultCitizen));
      }
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        setUser({ ...authUser, ...profile });
      } else {
        setUser({
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name || 'User',
          role: authUser.user_metadata?.role || 'citizen'
        });
      }
    } catch (e) {
      setUser({
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || 'User',
        role: authUser.user_metadata?.role || 'citizen'
      });
    } finally {
      setLoading(false);
    }
  };

  // Citizen Login
  const login = async (email, password, expectedRole = 'citizen') => {
    if (!isDemoMode && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // Check role authorization
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
      const actualRole = profile?.role || data.user.user_metadata?.role || 'citizen';

      if (expectedRole === 'admin' && actualRole !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Access Denied: Account does not possess Admin privileges.');
      }
      return data;
    }

    // Demo Mode Authentication
    if (expectedRole === 'admin') {
      const adminUser = {
        id: 'usr-admin-1',
        email: email || 'admin@safesphere.gov',
        name: 'Emergency Command Center Admin',
        role: 'admin'
      };
      setUser(adminUser);
      localStorage.setItem('safesphere_user', JSON.stringify(adminUser));
      return { user: adminUser };
    }

    const citizenUser = {
      id: `usr-citizen-${Date.now()}`,
      email: email || 'citizen@safesphere.org',
      name: email.split('@')[0] || 'Registered Citizen',
      role: 'citizen'
    };
    setUser(citizenUser);
    localStorage.setItem('safesphere_user', JSON.stringify(citizenUser));
    return { user: citizenUser };
  };

  // Citizen Signup
  const citizenSignup = async (email, password, name, phone) => {
    if (!isDemoMode && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone, role: 'citizen' }
        }
      });
      if (error) throw error;
      return data;
    }

    const newUser = {
      id: `usr-citizen-${Date.now()}`,
      email,
      name,
      phone,
      role: 'citizen'
    };
    setUser(newUser);
    localStorage.setItem('safesphere_user', JSON.stringify(newUser));
    return { user: newUser };
  };

  // Restricted Admin Signup (Requires Admin Authorization Code)
  const adminSignup = async (email, password, name, phone, inviteCode) => {
    // Verify Admin Authorization Code
    let isCodeValid = false;
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode })
      });
      const json = await res.json();
      isCodeValid = json.valid;
    } catch (err) {
      // Fallback check if backend proxy is offline
      isCodeValid = inviteCode.trim() === 'SAFESPHERE_ADMIN_2026';
    }

    if (!isCodeValid) {
      throw new Error('SECURITY VIOLATION: Invalid Admin Authorization Code. Public admin registration is prohibited.');
    }

    if (!isDemoMode && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone, role: 'admin' }
        }
      });
      if (error) throw error;
      return data;
    }

    const adminUser = {
      id: `usr-admin-${Date.now()}`,
      email,
      name,
      phone,
      role: 'admin'
    };
    setUser(adminUser);
    localStorage.setItem('safesphere_user', JSON.stringify(adminUser));
    return { user: adminUser };
  };

  // Logout
  const logout = async () => {
    if (!isDemoMode && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('safesphere_user');
  };

  const modeStatus = getModeStatus();

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        role: user?.role || 'citizen',
        isLoggedIn: !!user,
        isDemoMode,
        modeLabel: modeStatus.modeLabel,
        login,
        citizenSignup,
        adminSignup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
