<?php
/** Expects $category (array) in scope. */
?>
<a href="<?= e(base_url('/shop/' . $category['slug'])) ?>" class="group relative flex aspect-[3/4] w-[46vw] shrink-0 flex-col justify-end overflow-hidden rounded-2xl sm:w-56">
  <img src="<?= e($category['image_url']) ?>" alt="<?= e($category['name']) ?> collection" class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" loading="lazy">
  <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-300 group-hover:from-black/80"></div>
  <div class="relative flex items-center justify-between p-4">
    <span class="font-display text-lg text-white"><?= e($category['name']) ?></span>
    <span class="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-transform duration-300 group-hover:translate-x-1">→</span>
  </div>
</a>
