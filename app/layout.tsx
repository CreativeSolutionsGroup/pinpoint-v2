import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import "./globals.css";
import SidebarHelper from "@/components/ui/sidebar-helper";

export const metadata: Metadata = {
  title: "Pinpoint",
  description: "Custom map software designed by CSG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased w-screen h-screen overflow-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarHelper>{children}</SidebarHelper>
        </ThemeProvider>
      </body>
    </html>
  );
}
