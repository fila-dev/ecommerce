import React, { useState } from "react";
import { useLogout } from "../../hooks/useLogout";
import { Link } from "react-router-dom";
import { HiBars3 } from "react-icons/hi2";
import { MdOutlineDashboard } from "react-icons/md";
import { RiSettings4Line } from "react-icons/ri";
import { TbReportAnalytics } from "react-icons/tb";
import { AiOutlineUser } from "react-icons/ai";
import { FiMessageSquare, FiLogOut } from "react-icons/fi";
import { HiUserGroup } from "react-icons/hi";
import { IoMdAddCircleOutline } from "react-icons/io";

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const {logout} = useLogout();

  const handleClick = () => {
    logout();
  };

  const menus = [
    { name: "dashboard", link: "/provider/dashboard", icon: MdOutlineDashboard },
    { name: "users", link: "/provider/users", icon: HiUserGroup },
    { name: "Add post", link: "/provider", icon: IoMdAddCircleOutline },
    { name: "Purchase Payment", link: "/provider/purchase-payment", icon: TbReportAnalytics },
  //  { name: "Add categories", link: "/admin/categories", icon: TbReportAnalytics },
    { name: "messages", link: "/provider/sms", icon: FiMessageSquare },
    // { name: "analytics", link: "/analytics", icon: TbReportAnalytics, margin: true },
    // { name: "settings", link: "/settings", icon: RiSettings4Line },
    { name: "logout", link: "/logout", icon: FiLogOut, margin: true, onClick: handleClick }
  ];

  return (
    <section className="flex gap-6">
      <div
        className={`bg-[#0e0e0e] min-h-screen ${
          open ? "w-72" : "w-16"
        } duration-500 text-gray-100 px-4`}
      >
        <div className="py-3 flex justify-end">
          <HiBars3
            size={26}
            className="cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>
        
        <div className="mt-4 flex flex-col gap-4 relative">
          {menus?.map((menu, i) => (
            <Link
              to={menu?.link}
              key={i}
              className={`${
                menu?.margin && "mt-5"
              } group flex items-center text-sm gap-3.5 font-medium p-2 hover:bg-gray-800 rounded-md`}
              onClick={menu.onClick}
            >
              <div>{React.createElement(menu.icon, { size: "20" })}</div>
              <h2
                style={{
                  transitionDelay: `${i + 3}00ms`,
                }}
                className={`whitespace-pre duration-500 ${
                  !open && "opacity-0 translate-x-28 overflow-hidden"
                }`}
              >
                {menu.name}
              </h2>
              <h2
                className={`${
                  open && "hidden"
                } absolute left-48 bg-white font-semibold whitespace-pre text-gray-900 rounded-md drop-shadow-lg px-0 py-0 w-0 overflow-hidden group-hover:px-2 group-hover:py-1 group-hover:left-14 group-hover:duration-300 group-hover:w-fit`}
              >
                {menu.name}
              </h2>
            </Link>
          ))}
        </div>
      </div>
      
    
    </section>
  );
};

export default Sidebar;  
