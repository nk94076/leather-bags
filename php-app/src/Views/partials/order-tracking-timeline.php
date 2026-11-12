<?php
/** Expects $history (array of ['status','date','note']) in scope. */
$stepLabels = [
    'PENDING' => 'Order Placed', 'CONFIRMED' => 'Confirmed', 'PROCESSING' => 'Processing',
    'SHIPPED' => 'Shipped', 'OUT_FOR_DELIVERY' => 'Out for Delivery', 'DELIVERED' => 'Delivered',
    'CANCELLED' => 'Cancelled',
];
$history = $history ?? [];
?>
<ol class="flex flex-col gap-0">
  <?php if (empty($history)): ?>
    <li class="flex gap-4">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="text-black/20"><circle cx="12" cy="12" r="9"/></svg>
      <p class="text-sm text-black/50">No tracking updates yet.</p>
    </li>
  <?php endif; ?>
  <?php foreach ($history as $i => $step): ?>
    <li class="flex gap-4">
      <div class="flex flex-col items-center">
        <span class="flex h-7 w-7 items-center justify-center rounded-full <?= ($step['status'] ?? '') === 'CANCELLED' ? 'text-red-500' : 'text-green-600' ?>">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1" stroke-linecap="round"/><path d="m9 11 3 3L22 4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
        <?php if ($i < count($history) - 1): ?><span class="w-px flex-1 bg-black/10"></span><?php endif; ?>
      </div>
      <div class="pb-8">
        <p class="text-sm font-semibold text-brand-ink"><?= e($stepLabels[$step['status'] ?? ''] ?? ($step['status'] ?? '')) ?></p>
        <p class="text-xs text-black/50"><?= e($step['note'] ?? '') ?></p>
        <p class="mt-0.5 text-xs text-black/35"><?= format_date($step['date'] ?? '') ?></p>
      </div>
    </li>
  <?php endforeach; ?>
</ol>
