import { Breadcrumb } from "@/components/Breadcrumb";
import { CheckoutClient } from "./CheckoutClient";

export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <main className="shell py-2">
      <Breadcrumb items={[["Home", "/"], ["Cart", "/cart"], ["Checkout"]]} />
      <h1 className="text-[clamp(1.8rem,4vw,2.6rem)]">Checkout</h1>
      <CheckoutClient />
    </main>
  );
}
