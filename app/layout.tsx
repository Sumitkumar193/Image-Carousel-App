import type { Metadata } from "next";
import "./globals.css";
import RecoilProvider from "@/components/RecoilProvider";
import MasterProvider from "@/components/MasterProvider";

export const metadata: Metadata = {
  title: "Images Carousel App",
  description: "Created with v0",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <RecoilProvider>
          <MasterProvider>
            {children}
          </MasterProvider>
        </RecoilProvider>
      </body>
    </html>
  );
}
