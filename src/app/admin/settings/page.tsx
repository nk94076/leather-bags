import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { SettingsForm, type SettingField } from "@/components/admin/settings-form";

const GENERAL_FIELDS: SettingField[] = [
  { key: "siteName", label: "Website Name" },
  { key: "tagline", label: "Tagline" },
  { key: "logoUrl", label: "Logo URL" },
  { key: "favicon", label: "Favicon URL" },
  { key: "email", label: "Contact Email" },
  { key: "supportEmail", label: "Support Email" },
  { key: "phone", label: "Phone Number" },
  { key: "whatsapp", label: "WhatsApp Number" },
  { key: "address", label: "Business Address", type: "textarea" },
];

const THEME_FIELDS: SettingField[] = [
  { key: "primary", label: "Primary Color (Light Brown)", type: "color" },
  { key: "secondary", label: "Secondary Color (Dark Brown)", type: "color" },
  { key: "gold", label: "Accent Color (Gold)", type: "color" },
];

const SOCIAL_FIELDS: SettingField[] = [
  { key: "instagram", label: "Instagram URL" },
  { key: "facebook", label: "Facebook URL" },
  { key: "twitter", label: "Twitter / X URL" },
  { key: "pinterest", label: "Pinterest URL" },
];

const SEO_FIELDS: SettingField[] = [
  { key: "defaultMetaTitle", label: "Default Meta Title" },
  { key: "defaultMetaDesc", label: "Default Meta Description", type: "textarea" },
  { key: "gaId", label: "Google Analytics ID" },
  { key: "gtmId", label: "Google Tag Manager ID" },
  { key: "metaPixelId", label: "Meta Pixel ID" },
  { key: "searchConsoleVerification", label: "Google Search Console Verification Code" },
];

const PAYMENT_FIELDS: SettingField[] = [
  { key: "codEnabled", label: "Cash on Delivery", type: "checkbox" },
  { key: "upiEnabled", label: "UPI", type: "checkbox" },
  { key: "cardEnabled", label: "Credit / Debit Card", type: "checkbox" },
  { key: "netbankingEnabled", label: "Net Banking", type: "checkbox" },
  { key: "walletEnabled", label: "Wallets", type: "checkbox" },
  { key: "codFee", label: "COD Handling Fee (₹)", type: "number" },
  { key: "codMaxOrderValue", label: "Max Order Value for COD (₹)", type: "number" },
];

const SHIPPING_FIELDS: SettingField[] = [
  { key: "freeShippingThreshold", label: "Free Shipping Threshold (₹)", type: "number" },
  { key: "standardFee", label: "Standard Shipping Fee (₹)", type: "number" },
  { key: "expressFee", label: "Express Shipping Fee (₹)", type: "number" },
  { key: "standardDeliveryDays", label: "Standard Delivery (days)" },
  { key: "expressDeliveryDays", label: "Express Delivery (days)" },
];

const TAX_FIELDS: SettingField[] = [
  { key: "gstPercent", label: "GST Percentage (%)", type: "number" },
  { key: "pricesIncludeTax", label: "Prices Include Tax", type: "checkbox" },
];

const CURRENCY_FIELDS: SettingField[] = [
  { key: "code", label: "Currency Code" },
  { key: "symbol", label: "Currency Symbol" },
];

const SMTP_FIELDS: SettingField[] = [
  { key: "host", label: "SMTP Host" },
  { key: "port", label: "SMTP Port", type: "number" },
  { key: "username", label: "SMTP Username" },
  { key: "password", label: "SMTP Password" },
  { key: "fromEmail", label: "From Email Address" },
];

export default async function AdminSettingsPage() {
  const settings = await prisma.setting.findMany();
  const map = new Map(settings.map((s) => [s.key, JSON.parse(s.value)]));

  return (
    <div>
      <AdminPageHeader title="Settings" description="Configure site-wide branding, payments, shipping, tax and SEO" />

      <div className="flex flex-col gap-6">
        <SettingsForm title="General" settingKey="general" fields={GENERAL_FIELDS} initialValue={map.get("general") ?? {}} />
        <SettingsForm title="Theme Colors" settingKey="theme" fields={THEME_FIELDS} initialValue={map.get("theme") ?? { primary: "#B9855A", secondary: "#6F4E37", gold: "#C9A24B" }} />
        <SettingsForm title="Social Links" settingKey="social" fields={SOCIAL_FIELDS} initialValue={map.get("social") ?? {}} />
        <SettingsForm title="SEO & Analytics" settingKey="seo" fields={SEO_FIELDS} initialValue={map.get("seo") ?? {}} />
        <SettingsForm title="Payment Settings" settingKey="payment" fields={PAYMENT_FIELDS} initialValue={map.get("payment") ?? {}} />
        <SettingsForm title="Shipping Settings" settingKey="shipping" fields={SHIPPING_FIELDS} initialValue={map.get("shipping") ?? {}} />
        <SettingsForm title="Tax Settings" settingKey="tax" fields={TAX_FIELDS} initialValue={map.get("tax") ?? {}} />
        <SettingsForm title="Currency" settingKey="currency" fields={CURRENCY_FIELDS} initialValue={map.get("currency") ?? {}} />
        <SettingsForm title="SMTP (Email Delivery)" settingKey="smtp" fields={SMTP_FIELDS} initialValue={map.get("smtp") ?? {}} />
      </div>
    </div>
  );
}
