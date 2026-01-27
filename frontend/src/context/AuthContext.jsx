import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { authAPI, userAPI } from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const navigate = useNavigate()

  // Настройка заголовка Authorization и перехватчик ошибок
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Если сессия невалидна - разлогиниваем
          setUser(null)
          setToken(null)
          localStorage.removeItem('token')
          delete axios.defaults.headers.common['Authorization']
          navigate('/')
        } else if (error.response && error.response.status === 403 && error.response.data?.code === 'USER_BLOCKED') {
          // Если пользователь заблокирован
          setUser(prev => prev ? { ...prev, is_blocked: true, blocked_until: error.response.data.blocked_until } : null);
          navigate('/blocked');
        }
        return Promise.reject(error)
      }
    )

    return () => {
      axios.interceptors.response.eject(interceptor)
    }
  }, [token, navigate])

  // Проверка токена при загрузке страницы
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await authAPI.verifyToken()
        setUser(response.data.user)

        // Check if blocked
        if (response.data.user.is_blocked) {
          navigate('/blocked');
        }

        // Check terms acceptance from DB
        const accepted = !!response.data.user.rules_accepted_at
        setTermsAccepted(accepted)
      } catch (error) {
        console.error('Token verification failed:', error)
        logout()
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [token])

  // Listen for Steam Login Success
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'STEAM_LOGIN_SUCCESS') {
        const { token, user } = event.data;
        directLogin(user, token);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const loginWithSteam = () => {
    const width = 800;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    window.open(
      '/api/auth/steam',
      'Steam Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const directLogin = (userData, token) => {
    setUser(userData)
    setToken(token)
    localStorage.setItem('token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

    if (userData.is_blocked) {
      navigate('/blocked');
    }

    // Check terms on direct login too
    const accepted = !!userData.rules_accepted_at
    setTermsAccepted(accepted)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    navigate('/')
  }

  const acceptTerms = async () => {
    if (user) {
      try {
        await userAPI.acceptRules()
        // Update local user state
        setUser(prev => ({ ...prev, rules_accepted_at: new Date() }))
        setTermsAccepted(true)
      } catch (error) {
        console.error('Failed to accept rules:', error)
      }
    }
  }

  const value = {
    user,
    token,
    loading,
    loginWithSteam,
    directLogin,
    logout,
    isAuthenticated: !!user,
    termsAccepted,
    acceptTerms
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}