<?php
declare(strict_types=1);

$pdo = Database::pdo();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && csrf_verify()) {
    $action = $_POST['action'] ?? '';

    if ($action === 'create') {
        $question = trim((string) ($_POST['question'] ?? ''));
        $answer = trim((string) ($_POST['answer'] ?? ''));
        $category = trim((string) ($_POST['category'] ?? 'General')) ?: 'General';
        if ($question !== '' && $answer !== '') {
            $pdo->prepare('INSERT INTO faq_items (question, answer, category, sort_order) VALUES (?,?,?,0)')
                ->execute([$question, $answer, $category]);
            flash_set('success', 'FAQ added.');
        }
    } elseif ($action === 'update') {
        $id = (int) ($_POST['faq_id'] ?? 0);
        $question = trim((string) ($_POST['question'] ?? ''));
        $answer = trim((string) ($_POST['answer'] ?? ''));
        $category = trim((string) ($_POST['category'] ?? 'General')) ?: 'General';
        if ($id > 0 && $question !== '' && $answer !== '') {
            $pdo->prepare('UPDATE faq_items SET question=?, answer=?, category=? WHERE id=?')
                ->execute([$question, $answer, $category, $id]);
            flash_set('success', 'FAQ saved.');
        }
    } elseif ($action === 'delete') {
        $id = (int) ($_POST['faq_id'] ?? 0);
        $pdo->prepare('DELETE FROM faq_items WHERE id = ?')->execute([$id]);
        flash_set('success', 'FAQ removed.');
    }

    redirect('/admin/pages/faq');
}

$faqs = $pdo->query('SELECT * FROM faq_items ORDER BY sort_order ASC, id ASC')->fetchAll();

$pageTitle = 'FAQs';
$activeAdminPath = '/admin/pages';
require __DIR__ . '/../../../Views/admin_shell_open.php';
?>
<div class="mb-6">
  <h1 class="font-display text-2xl text-brand-ink sm:text-3xl">FAQs</h1>
  <p class="mt-1 text-sm text-black/50">Manage frequently asked questions shown on the FAQ page</p>
</div>

<div class="flex flex-col gap-4">
  <?php foreach ($faqs as $f): ?>
    <div class="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-6">
      <form action="<?= e(base_url('/admin/pages/faq')) ?>" method="post" class="flex flex-col gap-3">
        <?= csrf_field() ?>
        <input type="hidden" name="action" value="update">
        <input type="hidden" name="faq_id" value="<?= (int) $f['id'] ?>">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px]">
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Question</span>
            <input name="question" value="<?= e($f['question']) ?>" class="input-field">
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Category</span>
            <input name="category" value="<?= e($f['category']) ?>" class="input-field">
          </label>
        </div>
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Answer</span>
          <textarea name="answer" rows="2" class="input-field"><?= e($f['answer']) ?></textarea>
        </label>
        <div class="flex items-center gap-4">
          <button type="submit" class="btn-primary btn-sm">Save</button>
        </div>
      </form>
      <form action="<?= e(base_url('/admin/pages/faq')) ?>" method="post" data-confirm="Delete this FAQ?">
        <?= csrf_field() ?>
        <input type="hidden" name="action" value="delete">
        <input type="hidden" name="faq_id" value="<?= (int) $f['id'] ?>">
        <button type="submit" class="flex items-center gap-1 text-xs text-red-500 hover:underline">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Delete
        </button>
      </form>
    </div>
  <?php endforeach; ?>

  <div class="rounded-2xl border border-black/5 bg-white p-6">
    <h2 class="mb-3 font-display text-base text-brand-ink">Add New FAQ</h2>
    <form action="<?= e(base_url('/admin/pages/faq')) ?>" method="post" class="flex flex-col gap-3">
      <?= csrf_field() ?>
      <input type="hidden" name="action" value="create">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px]">
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Question</span>
          <input name="question" class="input-field">
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Category</span>
          <input name="category" value="General" class="input-field">
        </label>
      </div>
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Answer</span>
        <textarea name="answer" rows="2" class="input-field"></textarea>
      </label>
      <button type="submit" class="btn-primary btn-sm self-start">Add FAQ</button>
    </form>
  </div>
</div>
<?php require __DIR__ . '/../../../Views/admin_shell_close.php'; ?>
