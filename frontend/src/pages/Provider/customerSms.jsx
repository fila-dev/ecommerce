import Sidebar from '../../components/Provider/Sidebar'
import ProviderHeader from '../../components/Provider/ProviderHeader'
import CustomerSms from '../../components/Provider/CustomerSms'
import { useAuthContext } from '../../hooks/useAuthContext'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CustomerMessage() {
    const { user } = useAuthContext()
    const navigate = useNavigate()

    useEffect(() => {
        if (!user || user.accountType !== 'provider') {
            navigate('/')
        }
    }, [user, navigate])

    if (!user) return null

    return(  
        <div className="min-h-screen bg-gray-50 py-0 antialiased dark:bg-gray-900 flex items-start justify-start border-b-white px-8 sm:px-6 lg:px-8">
        <div className="w-full">
          <ProviderHeader/>
          <div className="flex">
            <Sidebar/>
            <div className="flex-1">
              <CustomerSms/>
            </div>
          </div>
        </div>
        </div>
    )
}