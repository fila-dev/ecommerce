import {useState} from 'react'
import {useAuthContext} from './useAuthContext'
import {useNavigate} from 'react-router-dom'


export const useLogin = () => {
      
     const [error, setError] = useState(null)
     const [isLoading, setIsLoading] = useState(false)
     const {dispatch} = useAuthContext()
     const navigate = useNavigate()


     const login = async (email, password) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, password})
            })  

            const json = await response.json()

            if (!response.ok) {
                setIsLoading(false)
                setError(json.error)
                return { success: false, error: json.error }
            }

            // Save to localStorage
            localStorage.setItem('user', JSON.stringify(json))
            
            // Update auth context
            dispatch({ type: 'LOGIN', payload: json })
            
            setIsLoading(false)

            // Navigate based on account type
            switch(json.accountType.toLowerCase()) {
                case 'Admin':
                    navigate('/admin')
                    break
                case 'provider':
                    navigate('/provider')
                    break
                default:
                    navigate('/')
            }

            return { 
                success: true, 
                data: json 
            }

        } catch (err) {
            console.error('Login error:', err)
            setIsLoading(false)
            setError('Network error - please try again')
            return { success: false, error: 'Network error - please try again' }
        }
     }

     return { login, isLoading, error }
}   