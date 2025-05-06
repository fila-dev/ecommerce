import Sidebar from '../../components/Dashbord/Sidebar'
import AdminHeader from '../../components/Dashbord/AdminHeader'
import Report from '../../components/Dashbord/Report'
import VisitorChart from '../../components/Dashbord/VisitorChart'
import { RevenueChart } from '../../components/Dashbord/RevenuChart'
import CatagoriVisted from '../../components/Dashbord/CatagoriVisted'

export default function Admin() {
    return(
        <div className="min-h-screen bg-gray-50 py-0 antialiased dark:bg-gray-900 flex items-start justify-start border-b-white px-8 sm:px-6 lg:px-8">
           <div className="w-full">
             <AdminHeader/>
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