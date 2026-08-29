import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="w-full px-6 sm:px-12">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
