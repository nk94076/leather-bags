"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Star, MapPin } from "lucide-react";
import { AddressForm } from "@/components/checkout/address-form";
import { Button } from "@/components/ui/button";

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/addresses")
      .then((res) => res.json())
      .then((data) => {
        setAddresses(data);
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: string) {
    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Could not delete address");
      return;
    }
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success("Address removed");
  }

  async function handleSetDefault(id: string) {
    const res = await fetch(`/api/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    if (!res.ok) {
      toast.error("Could not update address");
      return;
    }
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    toast.success("Default address updated");
  }

  if (loading) return <p className="text-sm text-black/50">Loading addresses...</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {addresses.map((a) => (
          <div key={a.id} className="rounded-2xl border border-black/5 bg-white p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-brand-ink">
                <MapPin size={15} className="text-brand-primary" /> {a.label}
              </span>
              {a.isDefault && <span className="text-[10px] font-semibold uppercase text-brand-primary">Default</span>}
            </div>
            <p className="text-sm text-black/60">{a.fullName}</p>
            <p className="text-sm text-black/50">
              {a.line1}
              {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.postalCode}
            </p>
            <p className="text-sm text-black/50">{a.phone}</p>
            <div className="mt-4 flex gap-4">
              {!a.isDefault && (
                <button onClick={() => handleSetDefault(a.id)} className="flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline">
                  <Star size={12} /> Set as Default
                </button>
              )}
              <button onClick={() => handleDelete(a.id)} className="flex items-center gap-1 text-xs font-medium text-red-500 hover:underline">
                <Trash2 size={12} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm ? (
        <div className="rounded-2xl border border-black/5 bg-white p-6">
          <h3 className="mb-4 font-display text-lg text-brand-ink">Add New Address</h3>
          <AddressForm
            onSaved={(addr) => {
              setAddresses((prev) => [addr as unknown as Address, ...prev]);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)} className="self-start">
          <Plus size={15} /> Add New Address
        </Button>
      )}
    </div>
  );
}
