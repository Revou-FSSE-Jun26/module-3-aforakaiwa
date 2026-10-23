import type { Metadata } from "next";
import ProtectedRoute from "@/components/ProtectedRoute";
import CheckoutForm from "@/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutForm />
    </ProtectedRoute>
  );
}
