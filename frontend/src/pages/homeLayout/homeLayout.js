import Navbar from "../../Components/Navbar/navbar";
import Sidebar from "../../Components/Sidebar/sidebar";
import Suggestions from "../../Components/suggestions/suggestions";

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
