<?php
declare(strict_types=1);

require dirname(__DIR__) . '/src/Config.php';
require dirname(__DIR__) . '/src/Database.php';
require dirname(__DIR__) . '/src/Helpers/functions.php';
require dirname(__DIR__) . '/src/Helpers/placeholder.php';

Config::load();
$pdo = Database::pdo();

function ph_url(string $type, string $seed, int $w = 800, int $h = 1000, ?string $label = null): string
{
    // Standalone (no APP_URL dependency) relative placeholder URL for seeding.
    $params = ['w' => $w, 'h' => $h];
    if ($label) {
        $params['label'] = $label;
    }
    return '/img/' . $type . '/' . rawurlencode($seed) . '?' . http_build_query($params);
}

echo "Clearing existing data...\n";
$pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
foreach ([
    'contact_submissions', 'newsletter_subscribers', 'password_reset_otps', 'media_assets',
    'settings', 'faq_items', 'cms_pages', 'homepage_sections', 'banners', 'order_items', 'orders',
    'wishlist_items', 'reviews', 'product_variants', 'product_images', 'products', 'categories',
    'addresses', 'users',
] as $table) {
    $pdo->exec("TRUNCATE TABLE {$table}");
}
$pdo->exec('SET FOREIGN_KEY_CHECKS = 1');

$LEATHER_TYPES = [
    'Full-Grain Leather', 'Top-Grain Leather', 'Nubuck Leather', 'Pebbled Leather',
    'Nappa Leather', 'Buffalo Leather', 'Saffiano Leather', 'Suede Leather',
];

$COLORS = [
    ['name' => 'Cognac', 'hex' => '#B9855A'],
    ['name' => 'Espresso', 'hex' => '#4F3626'],
    ['name' => 'Chestnut', 'hex' => '#8A6547'],
    ['name' => 'Black Onyx', 'hex' => '#1A1512'],
    ['name' => 'Camel Tan', 'hex' => '#D9B491'],
    ['name' => 'Olive Moss', 'hex' => '#6B6250'],
    ['name' => 'Burgundy Wine', 'hex' => '#6B2737'],
    ['name' => 'Midnight Navy', 'hex' => '#2C3E50'],
    ['name' => 'Warm Camel', 'hex' => '#C9A26B'],
    ['name' => 'Charcoal Grey', 'hex' => '#3B3B3B'],
];

$CATEGORY_SEED = [
    ['name' => 'Office Bags', 'slug' => 'office-bags', 'icon' => 'Briefcase',
        'description' => 'Structured, boardroom-ready leather bags built for the modern professional — sharp silhouettes with room for everything the workday demands.',
        'products' => ['Leather Office Bag', 'Chairman Leather Briefcase', 'Whitfield Slim Portfolio Bag', 'Kensington Structured Briefcase', 'Ashford Business Tote'],
        'priceRange' => [7999, 18999]],
    ['name' => 'Laptop Bags', 'slug' => 'laptop-bags', 'icon' => 'Laptop',
        'description' => 'Padded, protective and unmistakably premium — laptop bags engineered to carry your tech in leather that only gets better with age.',
        'products' => ['Meridian 15-inch Laptop Bag', 'Harrow Slim Laptop Sleeve Bag', 'Camden Tech Laptop Backpack', 'Bramwell Laptop Messenger', 'Sterling Commuter Laptop Bag'],
        'priceRange' => [6499, 15999]],
    ['name' => 'Messenger Bags', 'slug' => 'messenger-bags', 'icon' => 'Mail',
        'description' => 'Cross-body carry with an editorial edge — messenger bags cut from full-grain hides for daily commutes and weekend errands alike.',
        'products' => ['Foxhollow Messenger Bag', 'Barrington Cross-Body Messenger', 'Hartley Vintage Messenger Bag', 'Overland Courier Messenger', 'Preston Flap Messenger Bag'],
        'priceRange' => [5499, 13999]],
    ['name' => 'Backpacks', 'slug' => 'backpacks', 'icon' => 'Backpack',
        'description' => 'Leather backpacks that trade nylon for narrative — hand-finished panels, brass hardware and a shape built to last decades.',
        'products' => ['Alpine Leather Backpack', 'Voyager Convertible Backpack', 'Whitlock Daypack Backpack', 'Cambridge Scholar Backpack', 'Nomad Weekender Backpack'],
        'priceRange' => [6999, 16999]],
    ['name' => 'Travel Bags', 'slug' => 'travel-bags', 'icon' => 'Plane',
        'description' => 'Built for departures — spacious travel companions with reinforced seams, trolley sleeves and the patina of a well-lived life.',
        'products' => ['Odyssey Weekender Travel Bag', 'Continental Cabin Travel Bag', 'Meridian Garment Travel Bag', 'Voyage Rolling Travel Duffel', 'Wayfarer Travel Holdall'],
        'priceRange' => [9999, 24999]],
    ['name' => 'Duffel Bags', 'slug' => 'duffel-bags', 'icon' => 'Dumbbell',
        'description' => 'From gym floor to weekend getaway — duffel bags that balance rugged capacity with a refined, unmistakably leather finish.',
        'products' => ['Marlow Classic Duffel Bag', 'Ironside Gym Duffel Bag', 'Harbor Weekend Duffel', 'Brixton Sports Duffel Bag', 'Rutherford Barrel Duffel'],
        'priceRange' => [6999, 15999]],
    ['name' => "Women's Bags", 'slug' => 'womens-bags', 'icon' => 'Sparkles',
        'description' => 'Considered silhouettes and soft, supple hides — a collection designed for women who dress with intention.',
        'products' => ['Aria Structured Handbag', 'Camille Evening Clutch Bag', 'Elodie Shoulder Bag', 'Isabella Top-Handle Bag', 'Seraphina Quilted Bag'],
        'priceRange' => [5999, 17999]],
    ['name' => 'Handbags', 'slug' => 'handbags', 'icon' => 'ShoppingBag',
        'description' => 'Everyday handbags with an heirloom feel — roomy, richly textured, and finished with hardware that ages beautifully.',
        'products' => ['Juliette Tote Handbag', 'Vivienne Crossbody Handbag', 'Margaux Bucket Handbag', 'Odette Satchel Handbag', 'Colette Hobo Handbag'],
        'priceRange' => [5499, 14999]],
    ['name' => 'Wallets', 'slug' => 'wallets', 'icon' => 'Wallet',
        'description' => 'Pocket-sized craftsmanship — slim, precisely stitched wallets and cardholders made from the same hides as our bags.',
        'products' => ['Sterling Bifold Wallet', 'Ashworth Cardholder Wallet', 'Bramford Zip-Around Wallet', 'Whitmore Travel Wallet', 'Kensington Slim Wallet'],
        'priceRange' => [1499, 4999]],
    ['name' => 'Accessories', 'slug' => 'accessories', 'icon' => 'Gem',
        'description' => 'The finishing details — belts, key pouches and travel accessories designed to complete the Corium wardrobe.',
        'products' => ['Hendricks Leather Belt', 'Camden Passport Holder', 'Whitfield Key Pouch', 'Ashford Luggage Tag Set', 'Sterling Leather Watch Strap'],
        'priceRange' => [1299, 3999]],
];

$DESC_OPENERS = [
    'Cut from richly grained hide and finished by hand,', 'Born from a love of honest materials,',
    'Designed for people who notice the details,', 'Sitting at the intersection of form and function,',
    'Made to be used, not just admired,',
];
$DESC_MIDDLES = [
    'every seam is reinforced for daily wear and every edge is hand-burnished to a smooth, lasting finish.',
    'the interior is fully lined and organised with dedicated pockets for the essentials you carry most.',
    'solid brass hardware and vegetable-tanned edges are chosen to age gracefully alongside you.',
    'a considered blend of structure and softness keeps its shape while remaining comfortable to carry.',
    'each panel is selected for grain consistency, then cut and stitched in small batches by our artisans.',
];
$DESC_CLOSERS = [
    "It's a piece designed to be inherited, not replaced.",
    'Over time, the leather will darken and soften, carrying the story of everywhere you\'ve taken it.',
    "This is quiet luxury: no logos shouting for attention, just uncompromising craft.",
    'Backed by our craftsmanship warranty, it\'s built for years of daily use.',
    "A wardrobe staple that pairs as easily with denim as it does with tailoring.",
];

function build_description(string $name, string $leather, string $category, int $i): string
{
    global $DESC_OPENERS, $DESC_MIDDLES, $DESC_CLOSERS;
    $opener = $DESC_OPENERS[$i % count($DESC_OPENERS)];
    $middle = $DESC_MIDDLES[($i + 1) % count($DESC_MIDDLES)];
    $closer = $DESC_CLOSERS[($i + 2) % count($DESC_CLOSERS)];
    return "{$opener} the {$name} is crafted from premium " . strtolower($leather) . ", sourced and tanned to our exacting standards. As part of our {$category} collection, {$middle} {$closer}";
}

function build_short_description(string $name, string $leather): string
{
    return "The {$name} pairs " . strtolower($leather) . " with considered hardware and a silhouette built for everyday luxury.";
}

$REVIEW_AUTHORS = ['Aarav Mehta', 'Priya Sharma', 'Rohan Kapoor', 'Ishita Desai', 'Vikram Nair', 'Ananya Iyer', 'Karan Malhotra', 'Sneha Reddy', 'Arjun Singh', 'Divya Menon', 'Kabir Khanna', 'Meera Pillai', 'Siddharth Rao', 'Neha Bhatt', 'Aditya Verma', 'Tanvi Joshi', 'Rahul Gupta', 'Pooja Chawla', 'Nikhil Bansal', 'Ritika Saxena'];
$REVIEW_TITLES = ['Exceeded my expectations', 'Worth every rupee', 'Beautiful craftsmanship', 'My new everyday carry', 'Compliments every time I use it', 'Exactly as pictured', 'Perfect gift', 'Ages beautifully'];
$REVIEW_BODIES = [
    "The leather quality is outstanding — you can tell this isn't mass-produced. Stitching is clean and the hardware feels substantial.",
    'Ordered this for daily office use and it has held up perfectly for months. The compartments are thoughtfully placed.',
    'Smells incredible out of the box, and the colour is richer in person than in the photos. Packaging was premium too.',
    'Slightly pricier than I expected but the build quality justifies it completely. Already looking at my next purchase.',
    "Delivery was fast and the bag arrived in great condition. It's become my go-to for both work and weekend trips.",
    'The leather has already started developing a lovely patina after a month of use. Very happy with this purchase.',
    'Great size — fits a 15-inch laptop plus my everyday essentials with room to spare. Straps are comfortable too.',
    'Bought this as a gift and the recipient loved it. The unboxing experience alone felt premium.',
];

$CUSTOMER_NAMES = ['Aarav Mehta', 'Priya Sharma', 'Rohan Kapoor', 'Ishita Desai', 'Vikram Nair', 'Ananya Iyer', 'Karan Malhotra', 'Sneha Reddy'];
$INDIAN_CITIES = [
    ['city' => 'Bengaluru', 'state' => 'Karnataka', 'postal' => '560001'],
    ['city' => 'Mumbai', 'state' => 'Maharashtra', 'postal' => '400001'],
    ['city' => 'Delhi', 'state' => 'Delhi', 'postal' => '110001'],
    ['city' => 'Pune', 'state' => 'Maharashtra', 'postal' => '411001'],
    ['city' => 'Hyderabad', 'state' => 'Telangana', 'postal' => '500001'],
    ['city' => 'Chennai', 'state' => 'Tamil Nadu', 'postal' => '600001'],
    ['city' => 'Kolkata', 'state' => 'West Bengal', 'postal' => '700001'],
    ['city' => 'Ahmedabad', 'state' => 'Gujarat', 'postal' => '380001'],
];

echo "Seeding categories...\n";
$categoryIds = [];
$categoryMeta = [];
$stmt = $pdo->prepare('INSERT INTO categories (name, slug, description, image_url, banner_url, icon, meta_title, meta_desc, sort_order, is_featured) VALUES (?,?,?,?,?,?,?,?,?,1)');
foreach ($CATEGORY_SEED as $i => $c) {
    $stmt->execute([
        $c['name'], $c['slug'], $c['description'],
        ph_url('category', $c['slug'], 900, 1200),
        ph_url('banner', $c['slug'] . '-banner', 1600, 500),
        $c['icon'],
        "{$c['name']} | Premium Genuine Leather | Corium",
        $c['description'],
        $i,
    ]);
    $categoryIds[$c['slug']] = (int) $pdo->lastInsertId();
    $categoryMeta[$c['slug']] = $c;
}

echo "Seeding products, images, variants & reviews...\n";
$allProducts = [];
$productIndex = 0;
$reviewStmt = $pdo->prepare('INSERT INTO reviews (product_id, author_name, rating, title, comment, status) VALUES (?,?,?,?,?,"APPROVED")');
$productStmt = $pdo->prepare('INSERT INTO products (name, slug, sku, short_description, description, category_id, leather_type, price, compare_at_price, stock, colors, dimensions, weight, warranty, care_instructions, is_featured, is_trending, is_latest, meta_title, meta_desc, avg_rating, review_count) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
$imageStmt = $pdo->prepare('INSERT INTO product_images (product_id, url, alt_text, sort_order) VALUES (?,?,?,?)');
$variantStmt = $pdo->prepare('INSERT INTO product_variants (product_id, color, color_hex, sku, stock, price_diff) VALUES (?,?,?,?,?,?)');
$updateRatingStmt = $pdo->prepare('UPDATE products SET avg_rating = ?, review_count = ? WHERE id = ?');

foreach ($CATEGORY_SEED as $c) {
    $catId = $categoryIds[$c['slug']];
    [$minP, $maxP] = $c['priceRange'];
    foreach ($c['products'] as $name) {
        $slug = slugify($name);
        $leather = $LEATHER_TYPES[$productIndex % count($LEATHER_TYPES)];
        $price = (int) round(($minP + (($maxP - $minP) * (($productIndex * 37) % 100)) / 100) / 10) * 10;
        $hasDiscount = $productIndex % 3 === 0;
        $compareAtPrice = $hasDiscount ? (int) round(($price * 1.25) / 10) * 10 : null;
        $stock = ($productIndex > 0 && $productIndex % 17 === 0) ? 0 : 8 + (($productIndex * 13) % 55);
        $colors = [];
        for ($k = 0; $k < 3; $k++) {
            $colors[] = $COLORS[($productIndex + $k) % count($COLORS)];
        }
        $sku = 'CRM-' . strtoupper(substr($c['slug'], 0, 2)) . '-' . (1000 + $productIndex);

        $isFeatured = $productIndex % 4 === 0 ? 1 : 0;
        $isTrending = $productIndex % 5 === 1 ? 1 : 0;
        $isLatest = $productIndex % 6 === 2 ? 1 : 0;

        $productStmt->execute([
            $name, $slug, $sku,
            build_short_description($name, $leather),
            build_description($name, $leather, $c['name'], $productIndex),
            $catId, $leather, $price, $compareAtPrice, $stock,
            json_encode($colors),
            (28 + $productIndex % 6) . 'cm (W) x ' . (22 + $productIndex % 4) . 'cm (H) x ' . (8 + $productIndex % 5) . 'cm (D)',
            number_format(0.6 + ($productIndex % 9) * 0.15, 1) . ' kg',
            '2-Year Craftsmanship Warranty',
            'Wipe clean with a soft, dry cloth. Condition every 3-4 months with a leather-specific conditioner. Avoid prolonged exposure to direct sunlight and moisture.',
            $isFeatured, $isTrending, $isLatest,
            "{$name} | Buy Genuine {$leather} Online | Corium",
            build_short_description($name, $leather),
            0, 0,
        ]);
        $productId = (int) $pdo->lastInsertId();
        $allProducts[] = ['id' => $productId, 'slug' => $slug, 'price' => $price, 'name' => $name];

        for ($i = 0; $i < 3; $i++) {
            $imageStmt->execute([$productId, ph_url('product', "{$slug}-{$i}", 1000, 1250, $name), "{$name} - view " . ($i + 1), $i]);
        }
        foreach ($colors as $ci => $color) {
            $variantStock = max(0, (int) round($stock / count($colors)) - $ci);
            $variantStmt->execute([$productId, $color['name'], $color['hex'], "{$sku}-" . ($ci + 1), $variantStock, $ci === 0 ? 0 : $ci * 200]);
        }

        $reviewCount = 2 + ($productIndex % 4);
        $ratingSum = 0;
        $ratingPool = [5, 5, 4, 4, 5, 3];
        for ($r = 0; $r < $reviewCount; $r++) {
            $rating = $ratingPool[($productIndex + $r) % count($ratingPool)];
            $ratingSum += $rating;
            $reviewStmt->execute([
                $productId,
                $REVIEW_AUTHORS[($productIndex * 3 + $r) % count($REVIEW_AUTHORS)],
                $rating,
                $REVIEW_TITLES[($productIndex + $r) % count($REVIEW_TITLES)],
                $REVIEW_BODIES[($productIndex + $r * 2) % count($REVIEW_BODIES)],
            ]);
        }
        $updateRatingStmt->execute([round($ratingSum / $reviewCount, 1), $reviewCount, $productId]);

        $productIndex++;
    }
}
echo "Seeded {$productIndex} products.\n";

echo "Seeding users...\n";
$adminHash = password_hash('Admin@12345', PASSWORD_BCRYPT);
$pdo->prepare('INSERT INTO users (name, email, phone, password_hash, role, email_verified_at) VALUES (?,?,?,?,"ADMIN", NOW())')
    ->execute(['Corium Admin', 'admin@corium-leather.com', '+91 90000 00001', $adminHash]);

$customerHash = password_hash('Customer@123', PASSWORD_BCRYPT);
$userStmt = $pdo->prepare('INSERT INTO users (name, email, phone, password_hash, role, email_verified_at) VALUES (?,?,?,?,"CUSTOMER", NOW())');
$addressStmt = $pdo->prepare('INSERT INTO addresses (user_id, label, type, full_name, phone, line1, line2, city, state, postal_code, is_default) VALUES (?,"Home","HOME",?,?,?,?,?,?,?,1)');
$customerIds = [];
foreach ($CUSTOMER_NAMES as $i => $name) {
    $email = str_replace(' ', '.', strtolower($name)) . '@example.com';
    $phone = '+91 98' . str_pad((string) (10000000 + $i * 137), 8, '0', STR_PAD_LEFT);
    $userStmt->execute([$name, $email, $phone, $customerHash]);
    $uid = (int) $pdo->lastInsertId();
    $customerIds[] = $uid;
    $loc = $INDIAN_CITIES[$i % count($INDIAN_CITIES)];
    $addressStmt->execute([$uid, $name, $phone, (100 + $i) . ' Park Residency', ['MG Road', 'Brigade Road', 'Linking Road', 'Camac Street'][$i % 4], $loc['city'], $loc['state'], $loc['postal']]);
}
echo 'Seeded ' . count($customerIds) . " customers + 1 admin (admin@corium-leather.com / Admin@12345)\n";

echo "Seeding wishlist samples...\n";
$wishStmt = $pdo->prepare('INSERT IGNORE INTO wishlist_items (user_id, product_id) VALUES (?,?)');
foreach ($customerIds as $i => $uid) {
    for ($k = 0; $k < 3; $k++) {
        $p = $allProducts[($i * 5 + $k) % count($allProducts)];
        $wishStmt->execute([$uid, $p['id']]);
    }
}

echo "Seeding orders...\n";
$statuses = ['DELIVERED', 'DELIVERED', 'SHIPPED', 'PROCESSING', 'CONFIRMED', 'PENDING', 'CANCELLED', 'OUT_FOR_DELIVERY'];
$paymentMethods = ['COD', 'UPI', 'CARD', 'NETBANKING', 'WALLET'];
$statusNotes = [
    'PENDING' => 'Order placed', 'CONFIRMED' => 'Order confirmed and payment verified',
    'PROCESSING' => 'Order is being packed at our warehouse', 'SHIPPED' => 'Order has been shipped',
    'OUT_FOR_DELIVERY' => 'Out for delivery', 'DELIVERED' => 'Delivered successfully', 'CANCELLED' => 'Order cancelled',
];
$orderStmt = $pdo->prepare('INSERT INTO orders (order_number, user_id, address_id, shipping_snapshot, status, payment_method, payment_status, subtotal, shipping_fee, tax, total, tracking_number, tracking_history, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
$orderItemStmt = $pdo->prepare('INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity) VALUES (?,?,?,?,?,1)');

function build_tracking_history(string $status, string $createdAt): array
{
    $steps = [['status' => 'PENDING', 'date' => $createdAt, 'note' => 'Order placed']];
    $notes = [
        'CONFIRMED' => 'Order confirmed and payment verified', 'PROCESSING' => 'Order is being packed at our warehouse',
        'SHIPPED' => 'Order has been shipped', 'OUT_FOR_DELIVERY' => 'Out for delivery',
        'DELIVERED' => 'Delivered successfully', 'CANCELLED' => 'Order cancelled',
    ];
    $day = fn($n) => date('c', strtotime($createdAt) + $n * 86400);
    if ($status === 'CANCELLED') {
        $steps[] = ['status' => 'CANCELLED', 'date' => $day(1), 'note' => $notes['CANCELLED']];
        return $steps;
    }
    $order = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    $idx = array_search($status, $order, true);
    if ($idx !== false) {
        foreach (array_slice($order, 0, $idx + 1) as $i => $s) {
            $steps[] = ['status' => $s, 'date' => $day($i + 1), 'note' => $notes[$s]];
        }
    }
    return $steps;
}

for ($i = 0; $i < 18; $i++) {
    $uid = $customerIds[$i % count($customerIds)];
    $addrStmt = $pdo->prepare('SELECT * FROM addresses WHERE user_id = ? LIMIT 1');
    $addrStmt->execute([$uid]);
    $address = $addrStmt->fetch();

    $itemCount = 1 + ($i % 3);
    $items = [];
    for ($k = 0; $k < $itemCount; $k++) {
        $items[] = $allProducts[($i * 7 + $k) % count($allProducts)];
    }
    $subtotal = array_sum(array_column($items, 'price'));
    $status = $statuses[$i % count($statuses)];
    $shippingFee = $subtotal >= 999 ? 0 : 149;
    $tax = (int) round($subtotal * 0.05);
    $total = $subtotal + $shippingFee + $tax;
    $createdAt = date('Y-m-d H:i:s', strtotime("-{$i} days", strtotime('-' . ($i * 3) . ' days')));
    $createdAt = date('Y-m-d H:i:s', time() - $i * 3 * 86400);

    $orderStmt->execute([
        generate_order_number(), $uid, $address['id'] ?? null,
        json_encode([
            'fullName' => $address['full_name'] ?? '', 'phone' => $address['phone'] ?? '',
            'line1' => $address['line1'] ?? '', 'line2' => $address['line2'] ?? '',
            'city' => $address['city'] ?? '', 'state' => $address['state'] ?? '', 'postalCode' => $address['postal_code'] ?? '',
            'country' => 'India',
        ]),
        $status, $paymentMethods[$i % count($paymentMethods)],
        $status === 'CANCELLED' ? 'REFUNDED' : 'PAID',
        $subtotal, $shippingFee, $tax, $total,
        in_array($status, ['SHIPPED', 'DELIVERED', 'OUT_FOR_DELIVERY'], true) ? ('IND' . (100000 + $i * 7) . 'IN') : null,
        json_encode(build_tracking_history($status, $createdAt)),
        $createdAt, $createdAt,
    ]);
    $orderId = (int) $pdo->lastInsertId();

    foreach ($items as $p) {
        $imgStmt = $pdo->prepare('SELECT url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC LIMIT 1');
        $imgStmt->execute([$p['id']]);
        $img = $imgStmt->fetchColumn();
        $orderItemStmt->execute([$orderId, $p['id'], $p['name'], $img ?: '', $p['price']]);
    }
}

echo "Seeding banners...\n";
$bannerStmt = $pdo->prepare('INSERT INTO banners (placement, title, subtitle, cta_label, cta_url, image_url, sort_order) VALUES (?,?,?,?,?,?,?)');
$bannerStmt->execute(['hero', 'The Art of Carrying Well', 'Full-grain leather bags, hand-finished for a lifetime of use.', 'Shop Now', '/shop', ph_url('banner', 'hero-1', 1800, 1000), 0]);
$bannerStmt->execute(['hero', 'New Season, Timeless Leather', 'Discover the latest arrivals from our Autumn collection.', 'Explore Collection', '/shop?sort=latest', ph_url('banner', 'hero-2', 1800, 1000), 1]);
$bannerStmt->execute(['promo-left', 'Luxury Office Collection', 'Structured briefcases built for the boardroom.', 'Shop Office Bags', '/shop/office-bags', ph_url('banner', 'promo-office', 1200, 900), 0]);
$bannerStmt->execute(['promo-right', 'Travel Collection', 'Weekend-ready duffels and cabin bags.', 'Shop Travel Bags', '/shop/travel-bags', ph_url('banner', 'promo-travel', 1200, 900), 0]);

echo "Seeding homepage CMS sections...\n";
$sectionStmt = $pdo->prepare('INSERT INTO homepage_sections (`key`, title, subtitle, content, sort_order) VALUES (?,?,?,?,?)');
$sectionStmt->execute(['announcement', null, null, json_encode(['messages' => ['Free Shipping on Orders Over ₹999', 'Easy 15-Day Returns & Exchanges', '100% Genuine Full-Grain Leather']]), 0]);
$sectionStmt->execute(['hero', 'The Art of Carrying Well', 'Full-grain leather bags, hand-finished for a lifetime of use.', '{}', 1]);
$sectionStmt->execute(['categories', 'Shop by Category', 'Ten collections, each built around how you actually carry your life.', '{}', 2]);
$sectionStmt->execute(['latest-products', 'Latest Arrivals', 'Fresh off the workbench — our newest designs.', json_encode(['limit' => 8]), 3]);
$sectionStmt->execute(['trending-products', 'Trending Now', "The pieces our customers can't stop talking about.", json_encode(['limit' => 8]), 4]);
$sectionStmt->execute(['promo-banners', '', '', '{}', 5]);
$sectionStmt->execute(['recently-viewed', 'Recently Viewed', 'Pick up where you left off.', '{}', 6]);
$sectionStmt->execute(['why-choose-us', 'Why Choose Corium', 'Six reasons our customers keep coming back.', json_encode(['items' => [
    ['icon' => 'Gem', 'title' => '100% Genuine Leather', 'text' => 'Every hide is sourced from certified tanneries and inspected for grain quality.'],
    ['icon' => 'Hammer', 'title' => 'Premium Craftsmanship', 'text' => 'Hand-cut, hand-stitched, and finished by artisans with decades of experience.'],
    ['icon' => 'ShieldCheck', 'title' => 'Secure Payments', 'text' => 'Bank-grade encryption on every transaction, every time.'],
    ['icon' => 'Truck', 'title' => 'Fast Delivery', 'text' => 'Dispatched within 24 hours, delivered across India in 3-6 business days.'],
    ['icon' => 'RefreshCw', 'title' => 'Easy Returns', 'text' => '15-day hassle-free returns and exchanges, no questions asked.'],
    ['icon' => 'Headphones', 'title' => 'Customer Support', 'text' => 'A real human, ready to help via chat, email or phone.'],
]]), 7]);
$sectionStmt->execute(['reviews', 'Loved by Our Customers', 'Real stories from people carrying Corium every day.', '{}', 8]);
$instaImages = [];
for ($i = 0; $i < 8; $i++) {
    $instaImages[] = ph_url('gallery', "insta-{$i}", 500, 500);
}
$sectionStmt->execute(['instagram', 'Follow @corium.leather', 'Tag us in your carry for a chance to be featured.', json_encode(['images' => $instaImages]), 9]);
$sectionStmt->execute(['newsletter', 'Join the Corium Circle', 'Early access to new collections, private sales & craft stories.', '{}', 10]);

echo "Seeding CMS pages...\n";
$pageStmt = $pdo->prepare('INSERT INTO cms_pages (slug, title, content, meta_title, meta_desc) VALUES (?,?,?,?,?)');
$pageStmt->execute(['about-us', 'About Corium', json_encode([
    'hero' => ['title' => 'Leather, Made to Last a Lifetime', 'subtitle' => 'Since 2014, Corium has been quietly building bags meant to be inherited, not replaced.'],
    'sections' => [
        ['heading' => 'Our Story', 'body' => "Corium began in a small workshop in Bengaluru with a simple frustration: too many 'leather' bags fell apart within a year. Our founders, a leather technologist and a product designer, set out to build a brand that never compromised on materials — full-grain and top-grain hides only, sourced from tanneries that meet strict environmental and ethical standards. What started as a 12-bag capsule collection has grown into a full range of bags, backpacks and accessories, but the standard hasn't moved an inch."],
        ['heading' => 'Our Craft', 'body' => 'Every Corium piece passes through the hands of fewer than eight artisans, from hide selection to final inspection. We cut in small batches, hand-burnish every edge, and test each hardware fitting for a minimum of 10,000 open-close cycles. It\'s slower than mass production — and that\'s exactly the point.'],
        ['heading' => 'Our Promise', 'body' => "We back every bag with a 2-year craftsmanship warranty and a 15-day no-questions-asked return window. If a stitch ever fails under normal use, we'll repair it — that's not a policy, it's how we think leather goods should work."],
    ],
    'stats' => [['label' => 'Years of Craft', 'value' => '10+'], ['label' => 'Artisans', 'value' => '34'], ['label' => 'Happy Customers', 'value' => '48,000+'], ['label' => 'Cities Delivered To', 'value' => '600+']],
]), 'About Us | Corium Leather Co.', 'Learn the story behind Corium Leather Co. — our craft, our values, and the people behind every bag.']);

$pageStmt->execute(['contact-us', 'Contact Us', json_encode(['intro' => 'Have a question about an order, a product, or a bulk enquiry? Our team responds within one business day.', 'hours' => 'Monday – Saturday, 9:30 AM – 6:30 PM IST']), 'Contact Us | Corium Leather Co.', 'Get in touch with the Corium team for order support, wholesale enquiries, or general questions.']);

$pageStmt->execute(['privacy-policy', 'Privacy Policy', json_encode(['updatedAt' => '1 June 2026', 'sections' => [
    ['heading' => 'Information We Collect', 'body' => 'We collect information you provide directly, such as your name, email, phone number, shipping and billing addresses, and payment details, when you create an account, place an order, or contact customer support. We also automatically collect certain data — such as device type, browser, IP address and browsing behaviour on our site — through cookies and analytics tools.'],
    ['heading' => 'How We Use Your Information', 'body' => "Your information is used to process and deliver orders, communicate order updates, provide customer support, personalise your shopping experience, prevent fraud, and — where you've opted in — send marketing communications about new collections and offers."],
    ['heading' => 'How We Protect Your Information', 'body' => 'We use industry-standard encryption (TLS/SSL) for all data in transit, hash all stored passwords, and restrict access to personal data to employees who need it to perform their job. Payment card details are never stored on our servers; all transactions are processed through PCI-DSS compliant payment gateways.'],
    ['heading' => 'Cookies', 'body' => 'We use cookies to keep you signed in, remember items in your cart and wishlist, and understand how visitors use our site so we can improve it. You can disable cookies in your browser settings, though some site features may not work correctly.'],
    ['heading' => 'Sharing Your Information', 'body' => 'We share your information only with service providers who help us operate our business — payment processors, shipping carriers, and analytics providers — each bound by confidentiality obligations. We never sell your personal data to third parties.'],
    ['heading' => 'Your Rights', 'body' => 'You can access, update or delete your account information at any time from My Account, or by contacting privacy@corium-leather.com. You may also request a copy of the data we hold about you.'],
    ['heading' => 'Contact Us', 'body' => 'For any privacy-related questions, write to privacy@corium-leather.com or use the contact form on our Contact Us page.'],
]]), 'Privacy Policy | Corium Leather Co.', 'How Corium Leather Co. collects, uses and protects your personal information.']);

$pageStmt->execute(['terms-and-conditions', 'Terms & Conditions', json_encode(['updatedAt' => '1 June 2026', 'sections' => [
    ['heading' => 'Acceptance of Terms', 'body' => 'By accessing or using the Corium Leather Co. website, you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree, please do not use our website or services.'],
    ['heading' => 'Products & Pricing', 'body' => 'All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to modify prices, discontinue products, or correct pricing errors at any time without prior notice. Product images are for illustrative purposes; minor variations in colour and texture are natural characteristics of genuine leather.'],
    ['heading' => 'Orders & Payment', 'body' => 'By placing an order, you confirm that all information provided is accurate. We accept Cash on Delivery, UPI, credit/debit cards, net banking and select wallets. Orders are confirmed only after successful payment authorization (or COD confirmation) and inventory verification.'],
    ['heading' => 'Shipping', 'body' => 'Please refer to our Shipping & Return Policy for delivery timelines, charges, and serviceable areas. Corium is not liable for delays caused by courier partners, weather events, or circumstances beyond our control.'],
    ['heading' => 'Returns & Cancellations', 'body' => 'Orders may be cancelled before dispatch. Once delivered, our 15-day return policy applies as detailed in our Shipping & Return Policy. Customised or personalised items are non-returnable unless defective.'],
    ['heading' => 'Intellectual Property', 'body' => 'All content on this website — including logos, product photography, text and design — is the property of Corium Leather Co. and may not be reproduced without written permission.'],
    ['heading' => 'Limitation of Liability', 'body' => 'Corium Leather Co. shall not be liable for any indirect, incidental or consequential damages arising from the use of our products or website, to the maximum extent permitted by law.'],
    ['heading' => 'Governing Law', 'body' => 'These terms are governed by the laws of India, with courts in Bengaluru, Karnataka having exclusive jurisdiction.'],
]]), 'Terms & Conditions | Corium Leather Co.', 'The terms and conditions governing your use of the Corium Leather Co. website and purchases.']);

$pageStmt->execute(['shipping-return-policy', 'Shipping & Return Policy', json_encode(['updatedAt' => '1 June 2026', 'sections' => [
    ['heading' => 'Shipping Charges', 'body' => 'We offer free standard shipping on all prepaid orders above ₹999. Orders below this value are charged a flat ₹149 shipping fee. Express delivery (1-2 business days, select metro cities) is available at checkout for an additional ₹249.'],
    ['heading' => 'Delivery Timelines', 'body' => "Standard delivery takes 3-6 business days for metro cities and 5-8 business days for other locations, after dispatch. Orders are typically dispatched within 24-48 hours of confirmation. You'll receive a tracking link via email and SMS once your order ships."],
    ['heading' => 'Cash on Delivery', 'body' => 'COD is available for orders up to ₹25,000 across most serviceable pin codes. A nominal COD handling fee of ₹49 applies.'],
    ['heading' => 'Returns & Exchanges', 'body' => "We accept returns within 15 days of delivery for unused items in original packaging with tags intact. To initiate a return, visit My Account > Orders and select 'Request Return', or contact support@corium-leather.com with your order number."],
    ['heading' => 'Refunds', 'body' => 'Once your return is received and inspected, refunds are processed within 5-7 business days to your original payment method. COD order refunds are issued via bank transfer or store credit.'],
    ['heading' => 'Non-Returnable Items', 'body' => "Personalised or monogrammed items, and items marked 'Final Sale', cannot be returned or exchanged unless received damaged or defective."],
    ['heading' => 'Damaged or Incorrect Items', 'body' => "If you receive a damaged, defective or incorrect item, please contact us within 48 hours of delivery with photos of the product and packaging, and we'll arrange a free replacement or full refund."],
]]), 'Shipping & Return Policy | Corium Leather Co.', 'Everything you need to know about delivery timelines, shipping charges, returns and exchanges at Corium.']);

echo "Seeding FAQs...\n";
$faqStmt = $pdo->prepare('INSERT INTO faq_items (category, question, answer, sort_order) VALUES (?,?,?,?)');
$faqs = [
    ['Orders', 'How do I place an order?', 'Browse our Shop page, select a product, choose your colour and quantity, then add it to your bag. When you\'re ready, proceed to checkout, enter your shipping details and complete payment.'],
    ['Orders', 'Can I modify or cancel my order after placing it?', 'You can cancel an order from My Account > Orders as long as it hasn\'t been dispatched. Once shipped, cancellations aren\'t possible, but you can request a return after delivery.'],
    ['Orders', 'How can I track my order?', 'Once your order is dispatched, you\'ll receive a tracking number via email and SMS. You can also track your order anytime from the Track Order page using your order number and registered email.'],
    ['Shipping', 'Do you offer free shipping?', 'Yes — all prepaid orders above ₹999 qualify for free standard shipping across India. Orders below this value are charged a flat ₹149.'],
    ['Shipping', 'How long does delivery take?', 'Standard delivery takes 3-6 business days for metro cities and 5-8 business days for other locations after your order is dispatched.'],
    ['Shipping', 'Do you deliver internationally?', 'Currently we ship only within India. We\'re working on international shipping and will announce it on our homepage once available.'],
    ['Returns', 'What is your return policy?', 'We accept returns within 15 days of delivery for unused items in original packaging with tags intact. Initiate a return from My Account > Orders.'],
    ['Returns', 'How long do refunds take?', 'Refunds are processed within 5-7 business days of us receiving and inspecting the returned item, credited to your original payment method.'],
    ['Product Care', 'How do I care for my leather bag?', 'Wipe clean with a soft, dry cloth after each use. Condition the leather every 3-4 months with a leather-specific conditioner, and avoid prolonged exposure to direct sunlight, heat or moisture.'],
    ['Product Care', 'Is it normal for the leather colour to change over time?', 'Yes — genuine full-grain and top-grain leather naturally develops a richer patina with use and exposure to light. This is a hallmark of authentic leather, not a defect.'],
    ['Payments', 'What payment methods do you accept?', 'We accept Cash on Delivery (COD), UPI, all major credit and debit cards, net banking, and popular mobile wallets.'],
    ['Payments', 'Is it safe to pay online on your website?', 'Yes. All transactions are processed through PCI-DSS compliant, encrypted payment gateways. We never store your card details on our servers.'],
    ['Payments', 'Do you offer EMI options?', 'EMI is available on select credit and debit cards for orders above ₹3,000. Available EMI plans will be shown at checkout based on your card.'],
    ['Product', 'Is the leather genuine?', 'Yes, every Corium product is made from 100% genuine full-grain, top-grain or nubuck leather, sourced from certified tanneries. Material details are listed on every product page.'],
];
foreach ($faqs as $i => $f) {
    $faqStmt->execute([$f[0], $f[1], $f[2], $i]);
}

echo "Seeding settings...\n";
$settingStmt = $pdo->prepare('INSERT INTO settings (`key`, value) VALUES (?,?)');
$settingStmt->execute(['general', json_encode(['siteName' => 'CORIUM', 'tagline' => 'Timeless Leather, Modern Craft', 'logoUrl' => '', 'favicon' => '', 'email' => 'hello@corium-leather.com', 'supportEmail' => 'support@corium-leather.com', 'phone' => '+91 98765 43210', 'whatsapp' => '+91 98765 43210', 'address' => '42 Residency Road, Bengaluru, Karnataka 560025, India'])]);
$settingStmt->execute(['social', json_encode(['instagram' => 'https://instagram.com/corium.leather', 'facebook' => 'https://facebook.com/coriumleather', 'twitter' => 'https://twitter.com/coriumleather', 'pinterest' => 'https://pinterest.com/coriumleather'])]);
$settingStmt->execute(['seo', json_encode(['defaultMetaTitle' => 'Corium | Premium Genuine Leather Bags', 'defaultMetaDesc' => 'Shop premium full-grain leather bags, backpacks, wallets and accessories. Handcrafted, built to last, delivered across India.', 'gaId' => '', 'gtmId' => '', 'metaPixelId' => '', 'searchConsoleVerification' => ''])]);
$settingStmt->execute(['payment', json_encode(['codEnabled' => true, 'upiEnabled' => true, 'cardEnabled' => true, 'netbankingEnabled' => true, 'walletEnabled' => true, 'codFee' => 49, 'codMaxOrderValue' => 25000])]);
$settingStmt->execute(['shipping', json_encode(['freeShippingThreshold' => 999, 'standardFee' => 149, 'expressFee' => 249, 'standardDeliveryDays' => '3-6', 'expressDeliveryDays' => '1-2'])]);
$settingStmt->execute(['tax', json_encode(['gstPercent' => 5, 'pricesIncludeTax' => true])]);
$settingStmt->execute(['currency', json_encode(['code' => 'INR', 'symbol' => '₹'])]);
$settingStmt->execute(['theme', json_encode(['primary' => '#B9855A', 'secondary' => '#6F4E37', 'gold' => '#C9A24B'])]);

echo "Seeding media library samples & newsletter/contact demo rows...\n";
$mediaStmt = $pdo->prepare('INSERT INTO media_assets (url, alt_text, folder) VALUES (?,?,"products")');
foreach (array_slice($allProducts, 0, 12) as $p) {
    $mediaStmt->execute([ph_url('product', "{$p['slug']}-0", 600, 750), $p['slug'] . ' product photo']);
}
$pdo->prepare('INSERT INTO newsletter_subscribers (email) VALUES (?)')->execute(['early.access1@example.com']);
$pdo->prepare('INSERT INTO newsletter_subscribers (email) VALUES (?)')->execute(['leather.lover@example.com']);
$pdo->prepare('INSERT INTO contact_submissions (name, email, subject, message) VALUES (?,?,?,?)')->execute(['Rhea Kapoor', 'rhea.k@example.com', 'Bulk order enquiry', "Hi, I'd like to enquire about bulk pricing for 25 units of the Sterling Commuter Laptop Bag for a corporate gifting programme."]);

echo "\n✅ Seed complete.\n";
echo "Admin login: admin@corium-leather.com / Admin@12345\n";
echo "Customer login: aarav.mehta@example.com / Customer@123\n";
