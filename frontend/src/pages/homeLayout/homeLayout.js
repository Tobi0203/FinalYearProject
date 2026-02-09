import Navbar from "../../Components/Navbar/Navbar";
import Sidebar from "../../Components/Sidebar/Sidebar";
import Suggestions from "../../Components/Suggestions/Suggestions";

export default function HomeLayout({ children }) {
  return (
    <>
      <Navbar />
      <div className="home">
        <Sidebar />
        {children}
        <Suggestions />
      </div>
    </>
  );
}
