<?php
declare(strict_types=1);

$router = new Router();

// ---- Storefront ----
$router->add('ANY', '/', 'home.php');
$router->add('ANY', '/shop', 'shop.php');
$router->add('ANY', '/shop/{category}', 'category.php');
$router->add('ANY', '/product/{slug}', 'product.php');
$router->add('ANY', '/about-us', 'about.php');
$router->add('ANY', '/contact-us', 'contact.php');
$router->add('ANY', '/privacy-policy', 'legal.php');
$router->add('ANY', '/terms-and-conditions', 'legal.php');
$router->add('ANY', '/shipping-return-policy', 'legal.php');
$router->add('ANY', '/faq', 'faq.php');
$router->add('ANY', '/wishlist', 'wishlist.php');
$router->add('ANY', '/cart', 'cart.php');
$router->add('ANY', '/cart/add', 'cart_add.php');
$router->add('ANY', '/cart/update', 'cart_update.php');
$router->add('ANY', '/cart/remove', 'cart_remove.php');
$router->add('ANY', '/checkout', 'checkout.php', true);
$router->add('ANY', '/checkout/confirmation/{orderId}', 'confirmation.php', true);
$router->add('ANY', '/address/add', 'address_add.php', true);
$router->add('ANY', '/address/delete', 'address_delete.php', true);
$router->add('ANY', '/address/default', 'address_default.php', true);
$router->add('ANY', '/login', 'login.php');
$router->add('ANY', '/register', 'register.php');
$router->add('ANY', '/forgot-password', 'forgot_password.php');
$router->add('ANY', '/logout', 'logout.php');
$router->add('ANY', '/account', 'account/overview.php', true);
$router->add('ANY', '/account/orders', 'account/orders.php', true);
$router->add('ANY', '/account/orders/{id}', 'account/order_detail.php', true);
$router->add('ANY', '/account/orders/{id}/cancel', 'account/order_cancel.php', true);
$router->add('ANY', '/account/addresses', 'account/addresses.php', true);
$router->add('ANY', '/account/password', 'account/password.php', true);
$router->add('ANY', '/track-order', 'track_order.php');
$router->add('ANY', '/wishlist/toggle', 'wishlist_toggle.php');
$router->add('ANY', '/review/submit', 'review_submit.php', true);
$router->add('ANY', '/newsletter/subscribe', 'newsletter_subscribe.php');
$router->add('GET', '/search-suggestions', 'search_suggestions.php');
$router->add('GET', '/sitemap.xml', 'sitemap.php');
$router->add('GET', '/robots.txt', 'robots.php');
$router->add('GET', '/img/{type}/{seed}', 'placeholder.php');

// ---- Admin ----
$router->add('ANY', '/admin', 'admin/dashboard.php', true, true);
$router->add('ANY', '/admin/products', 'admin/products/index.php', true, true);
$router->add('ANY', '/admin/products/new', 'admin/products/form.php', true, true);
$router->add('ANY', '/admin/products/{id}/edit', 'admin/products/form.php', true, true);
$router->add('ANY', '/admin/products/{id}/delete', 'admin/products/delete.php', true, true);
$router->add('ANY', '/admin/categories', 'admin/categories/index.php', true, true);
$router->add('ANY', '/admin/categories/new', 'admin/categories/form.php', true, true);
$router->add('ANY', '/admin/categories/{id}/edit', 'admin/categories/form.php', true, true);
$router->add('ANY', '/admin/categories/{id}/delete', 'admin/categories/delete.php', true, true);
$router->add('ANY', '/admin/orders', 'admin/orders/index.php', true, true);
$router->add('ANY', '/admin/orders/{id}', 'admin/orders/detail.php', true, true);
$router->add('ANY', '/admin/customers', 'admin/customers/index.php', true, true);
$router->add('ANY', '/admin/customers/{id}', 'admin/customers/detail.php', true, true);
$router->add('ANY', '/admin/reviews', 'admin/reviews/index.php', true, true);
$router->add('ANY', '/admin/homepage', 'admin/homepage.php', true, true);
$router->add('ANY', '/admin/pages', 'admin/pages/index.php', true, true);
$router->add('ANY', '/admin/pages/faq', 'admin/pages/faq.php', true, true);
$router->add('ANY', '/admin/pages/{slug}', 'admin/pages/form.php', true, true);
$router->add('ANY', '/admin/media', 'admin/media.php', true, true);
$router->add('ANY', '/admin/settings', 'admin/settings.php', true, true);

return $router;
