import type { Metadata } from "next";
import ProtectedRoute from "@/components/ProtectedRoute";
import OrderDetailView from "@/components/OrderDetailView";

export async function generateMetadata({
  params,
}: PageProps<"/orders/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order #${id}` };
}

export default async function OrderDetailPage({
  params,
}: PageProps<"/orders/[id]">) {
  const { id } = await params;
  return (
    <ProtectedRoute>
      <OrderDetailView orderId={id} />
    </ProtectedRoute>
  );
}
