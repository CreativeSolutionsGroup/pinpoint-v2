import { ThemeProvider } from "@/components/theme-provider";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import type { Metadata } from "next";
import "./globals.css";
import SidebarHelper from "@/components/ui/sidebar-helper";
import { Suspense } from "react";

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
        <Suspense>
          <StackProvider app={stackClientApp}>
            <StackTheme>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <SidebarHelper>{children}</SidebarHelper>
              </ThemeProvider>
            </StackTheme>
          </StackProvider>
        </Suspense>
      </body>
    </html>
  );
}
