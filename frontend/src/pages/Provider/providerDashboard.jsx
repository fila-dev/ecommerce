import Sidebar from '../../components/Provider/Sidebar'
import ProviderHeader from '../../components/Provider/ProviderHeader'
import Report from '../../components/Provider/Report'
import VisitorChart from '../../components/Provider/VisitorChart'
import { RevenueChart } from '../../components/Provider/RevenuChart'
import CatagoriVisted from '../../components/Provider/CatagoriVisted'
import { useAuthContext } from '../../hooks/useAuthContext'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProviderDashboard() {
    const { user } = useAuthContext()
    const navigate = useNavigate()

    useEffect(() => {
        console.log('Current user:', user);
        console.log('Account type:', user?.accountType);
        
        if (!user) {
            console.log('No user found, redirecting to home');
            navigate('/');
            return;
        }
        
        if (user.accountType !== 'provider') {
            console.log('User is not a provider, redirecting to home');
            navigate('/');
            return;
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
                 <Report/>
                 <div className="grid grid-cols-2 gap-4 mt-4">
                   <div>
                     <VisitorChart/>
                   </div>
                   <div>
                     <RevenueChart/>
                   </div>
                 </div>
                 <div>
                   <CatagoriVisted/>
                 </div>
               </div>
             </div>
           </div>
        </div>
    )
}