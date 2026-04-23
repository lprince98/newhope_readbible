import { Header } from "@/src/presentation/components/layout/Header";
import { BottomNav } from "@/src/presentation/components/layout/BottomNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#fbf9f5] text-[#1b1c1a]">
      <Header />
      <main className="pt-16 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
