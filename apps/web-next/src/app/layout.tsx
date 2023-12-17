import Fathom from "@peated/web-next/components/Fathom";
import type { Metadata } from "next";
import getConfig from "next/config";
import "./globals.css";

const { publicRuntimeConfig } = getConfig();

export const metadata: Metadata = {
  title: "Peated",
  description: publicRuntimeConfig.DESCRIPTION,
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=0",
  themeColor: publicRuntimeConfig.THEME_COLOR,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-full">
        {children}

        {publicRuntimeConfig.FATHOM_SITE_ID && (
          <Fathom
            siteId={publicRuntimeConfig.FATHOM_SITE_ID}
            includedDomains={["peated.com"]}
          />
        )}
      </body>
    </html>
  );
}
