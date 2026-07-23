"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatPrice } from "@/lib/utils";

export function SalesChart({ data }: { data: { date: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B9855A" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#B9855A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#00000010" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#00000060" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#00000060" }} axisLine={false} tickLine={false} width={70} tickFormatter={(v) => formatPrice(v)} />
        <Tooltip
          formatter={(value) => formatPrice(Number(value))}
          contentStyle={{ borderRadius: 12, border: "1px solid #00000010", fontSize: 12 }}
        />
        <Area type="monotone" dataKey="revenue" stroke="#B9855A" strokeWidth={2} fill="url(#revenueGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
