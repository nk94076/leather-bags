<?php
$homepageSections = get_homepage_sections();
$announcementContent = json_decode_assoc($homepageSections['announcement']['content'] ?? null);
$messages = $announcementContent['messages'] ?? [
    'Free Shipping on All Orders Over ₹999',
    'Easy 15-Day Returns & Exchanges',
    '100% Genuine Full-Grain Leather',
];
?>
<div class="bg-brand-ink text-brand-cream">
  <div class="mx-auto flex h-9 max-w-[1400px] items-center justify-center overflow-hidden px-4 text-center">
    <div id="announcement-track" class="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider sm:text-xs" data-messages='<?= e(json_encode(array_values($messages))) ?>'>
      <span id="announcement-text"><?= e($messages[0] ?? '') ?></span>
    </div>
  </div>
</div>
