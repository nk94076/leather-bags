import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-primary text-white hover:bg-brand-primary-dark shadow-sm hover:shadow-luxury",
  secondary:
    "bg-brand-secondary text-white hover:bg-brand-secondary-dark shadow-sm hover:shadow-luxury",
  outline:
    "border border-brand-secondary/40 text-brand-secondary hover:bg-brand-secondary hover:text-white",
  ghost: "text-brand-secondary hover:bg-brand-cream-dark",
  dark: "bg-brand-ink text-white hover:bg-black",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-xs tracking-wide",
  md: "px-6 py-3 text-sm tracking-wide",
  lg: "px-8 py-4 text-base tracking-wide",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium uppercase transition-all duration-300 ease-out disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

interface LinkButtonProps {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function LinkButton({ href, variant = "primary", size = "md", className, children, onClick }: LinkButtonProps) {
  return (
    <Link href={href} onClick={onClick} className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </Link>
  );
}
