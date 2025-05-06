import Sidebar from '../../components/Dashbord/Sidebar'
import AdminHeader from '../../components/Dashbord/AdminHeader'
import UserManage from '../../components/Dashbord/UserManage'

export default function userManage(){
    return(  
        <div className="min-h-screen bg-gray-50 py-0 antialiased dark:bg-gray-900 flex items-start justify-start border-b-white px-8 sm:px-6 lg:px-8">
        <div className="w-full">
          <AdminHeader/>
          <div className="flex">
            <Sidebar/>
            <div className="flex-1">
              <UserManage/>
            </div>
          </div>
        </div>
        </div>

        
    )
}