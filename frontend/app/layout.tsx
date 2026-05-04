import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EdukSim | Avaliação Escolar com Inteligência Artificial",
  description: "Plataforma definitiva para gestão de avaliações, análise de desempenho e excelência acadêmica.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
