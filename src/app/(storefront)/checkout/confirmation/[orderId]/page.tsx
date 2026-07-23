import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, Package } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/utils";

interface Props {
  params: Promise<{ orderId: string }>;
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { orderId } = await params;
  const session = await auth();
  if (!session?.user) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, address: true },
  });

  if (!order || order.userId !== session.user.id) notFound();

  return (
    <div className="py-14 sm:py-20">
      <Container className="max-w-3xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 size={32} />
          </span>
          <h1 className="font-display text-3xl text-brand-ink sm:text-4xl">Thank You For Your Order!</h1>
          <p className="text-sm text-black/60">
            Your order <span className="font-semibold text-brand-ink">#{order.orderNumber}</span> has been placed
            successfully. A confirmation has been sent to your registered email.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-black/5 bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-black/40">Order Date</p>
              <p className="text-sm font-medium text-brand-ink">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-black/40">Payment Method</p>
              <p className="text-sm font-medium text-brand-ink">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-black/40">Order Total</p>
              <p className="text-sm font-semibold text-brand-ink">{formatPrice(order.total)}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 py-6">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-brand-cream-dark">
                  {item.productImage && <Image src={item.productImage} alt={item.productName} fill sizes="80px" className="object-cover" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-brand-ink">{item.productName}</p>
                  <p className="text-xs text-black/40">
                    {item.color ? `${item.color} • ` : ""}Qty {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium text-brand-ink">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {order.address && (
            <div className="border-t border-black/5 pt-6">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-ink">
                <Package size={14} /> Shipping To
              </p>
              <p className="text-sm text-black/60">
                {order.address.fullName}, {order.address.line1}, {order.address.city}, {order.address.state}{" "}
                {order.address.postalCode}
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <LinkButton href={`/account/orders/${order.id}`}>Track Your Order</LinkButton>
          <LinkButton href="/shop" variant="outline">
            Continue Shopping
          </LinkButton>
        </div>
      </Container>
    </div>
  );
}
