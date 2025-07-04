import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  console.log("dashboard");
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default DashboardLayout;
