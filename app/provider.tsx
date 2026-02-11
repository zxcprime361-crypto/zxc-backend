"use client";

import { ThemeProvider } from "@/components/ui/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import DisableDevtool from "disable-devtool";
export default function Provider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [queryClient] = useState(() => new QueryClient());

  // useEffect(() => {
  //   if (process.env.NODE_ENV === "production") {
  //     DisableDevtool({
  //       disableMenu: true, // Disable right click
  //       disableSelect: false, // Disable text selection
  //       disableCopy: false, // Disable copy
  //       disableCut: false, // Disable cut
  //       disablePaste: false, // Disable paste
  //       clearLog: true, // Auto clear console
  //       interval: 1000, // Devtool detection interval (ms)
  //       ondevtoolopen: () => {
  //         window.location.href = "/"; // Redirect if devtools opened
  //       },
  //     });
  //   }
  // }, []);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="bg-black fixed inset-0"></div>;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
