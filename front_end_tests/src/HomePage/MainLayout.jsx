import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet /> {/* Aquí se renderizan las páginas hijas */}
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
