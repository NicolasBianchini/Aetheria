import React, { createContext, useContext, useEffect, useState } from 'react';
import AuthService from '../services/AuthService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simular inicialização rápida sem auth
    setLoading(false);
  }, []);

  // Funções de autenticação - agora funcionam com Firestore
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const result = await AuthService.login(email, password);
      
      if (result.success) {
        setUser(result.user);
      } else {
        setError(result.message);
      }
      
      return result;
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await AuthService.register(email, password, userData);
      
      if (result.success) {
        setUser(result.user);
      } else {
        setError(result.message);
      }
      
      return result;
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    return { success: true, message: 'Logout realizado com sucesso!' };
  };

  const updateProfile = async (profileData) => {
    setError('Funcionalidade de atualização de perfil não implementada');
    return { success: false, message: 'Funcionalidade de atualização de perfil não implementada' };
  };

  const resetPassword = async (email) => {
    setError('Funcionalidade de redefinição de senha não implementada');
    return { success: false, message: 'Funcionalidade de redefinição de senha não implementada' };
  };

  const resendVerificationEmail = async () => {
    setError('Funcionalidade de verificação de email não implementada');
    return { success: false, message: 'Funcionalidade de verificação de email não implementada' };
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    // Estado
    user,
    loading,
    error,
    
    // Funções
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
    resendVerificationEmail,
    clearError,
    
    // Helpers
    isAuthenticated: !!user,
    isEmailVerified: false,
    getCurrentUserId: user?.id || null
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;