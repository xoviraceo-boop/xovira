import Header from "./Header";
import Footer from "./Footer";

export default function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto]">
      <Header />
      <main className="w-full overflow-y-auto overflow-x-none">{children}</main>
    </div>
  );
}


