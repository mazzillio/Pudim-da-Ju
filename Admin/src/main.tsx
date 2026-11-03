import "@/index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import { Toaster } from "@/components/ui/sonner";
import { applyTheme } from "@/config";
import { AdminLayout } from "@/pages/admin-layout";
import { EditProductPage } from "@/pages/edit-product-page";
import { LoginPage } from "@/pages/login-page";
import { NewProductPage } from "@/pages/new-product-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { ProductsPage } from "@/pages/products-page";

applyTheme();

const queryClient = new QueryClient({
  defaultOptions: {
    // The owner may toggle a pudim on the phone and check on the laptop: refetch on focus keeps both in sync.
    queries: { staleTime: 10_000, refetchOnWindowFocus: true },
  },
});

const root = document.getElementById("root");
if (!root) throw new Error("#root not found");

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "") || "/"}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AdminLayout />}>
            <Route index element={<ProductsPage />} />
            <Route path="pudins/novo" element={<NewProductPage />} />
            <Route path="pudins/:id" element={<EditProductPage />} />
          </Route>
          <Route path="/404" element={<NotFoundPage />} />
          {/* Any unknown path, logged in or not, lands on the 404 page. */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
);
