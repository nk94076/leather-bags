<?php
/** Expects $status (string) in scope. */
$statusStyles = [
    'PENDING' => 'bg-amber-50 text-amber-700',
    'CONFIRMED' => 'bg-blue-50 text-blue-700',
    'PROCESSING' => 'bg-blue-50 text-blue-700',
    'SHIPPED' => 'bg-indigo-50 text-indigo-700',
    'OUT_FOR_DELIVERY' => 'bg-indigo-50 text-indigo-700',
    'DELIVERED' => 'bg-green-50 text-green-700',
    'CANCELLED' => 'bg-red-50 text-red-700',
    'RETURNED' => 'bg-red-50 text-red-700',
    'REFUNDED' => 'bg-gray-100 text-gray-700',
];
$statusLabels = [
    'PENDING' => 'Pending', 'CONFIRMED' => 'Confirmed', 'PROCESSING' => 'Processing',
    'SHIPPED' => 'Shipped', 'OUT_FOR_DELIVERY' => 'Out for Delivery', 'DELIVERED' => 'Delivered',
    'CANCELLED' => 'Cancelled', 'RETURNED' => 'Returned', 'REFUNDED' => 'Refunded',
];
?>
<span class="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide <?= $statusStyles[$status] ?? 'bg-gray-100 text-gray-700' ?>">
  <?= e($statusLabels[$status] ?? $status) ?>
</span>
