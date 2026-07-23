<?php
/** Expects $ratingValue (float) and optional $ratingCount (int|null) in scope. */
$ratingValue = $ratingValue ?? 0;
$ratingSize = $ratingSize ?? 14;
?>
<div class="flex items-center gap-1">
  <div class="flex items-center">
    <?php for ($i = 1; $i <= 5; $i++): $filled = $i <= round($ratingValue); ?>
      <svg width="<?= (int) $ratingSize ?>" height="<?= (int) $ratingSize ?>" viewBox="0 0 24 24" fill="<?= $filled ? '#C9A24B' : 'none' ?>" stroke="<?= $filled ? '#C9A24B' : 'rgba(0,0,0,0.2)' ?>" stroke-width="1.5"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z" stroke-linejoin="round"/></svg>
    <?php endfor; ?>
  </div>
  <?php if (isset($ratingCount)): ?>
    <span class="text-xs text-black/50">(<?= (int) $ratingCount ?>)</span>
  <?php endif; ?>
</div>
