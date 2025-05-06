import Sidebar from '../../components/Provider/Sidebar'
import ProviderHeader from '../../components/Provider/ProviderHeader'
import UseronProvider from '../../components/Provider/UseronProvider'

export default function UseronProviderPage(){
    return(  
        <div className="min-h-screen bg-gray-50 py-0 antialiased dark:bg-gray-900 flex items-start justify-start border-b-white px-8 sm:px-6 lg:px-8">
        <div className="w-full">  
          <ProviderHeader/>
          <div className="flex">
            <Sidebar/>
            <div className="flex-1">
              <UseronProvider/>
            </div>
          </div>
        </div>
        </div>

        
    )
}