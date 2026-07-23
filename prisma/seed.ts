import { PrismaClient, OrderStatus, PaymentMethod, PaymentStatus, CouponType, Role, AddressType } from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";
import { placeholderUrl } from "../src/lib/placeholder";
import { generateOrderNumber } from "../src/lib/utils";

const prisma = new PrismaClient();

function slug(text: string) {
  return slugify(text, { lower: true, strict: true });
}

function pick<T>(arr: T[], n: number, offset = 0) {
  const out: T[] = [];
  for (let i = 0; i < n; i++) out.push(arr[(offset + i) % arr.length]);
  return out;
}

const LEATHER_TYPES = [
  "Full-Grain Leather",
  "Top-Grain Leather",
  "Nubuck Leather",
  "Pebbled Leather",
  "Nappa Leather",
  "Buffalo Leather",
  "Saffiano Leather",
  "Suede Leather",
];

const COLORS = [
  { name: "Cognac", hex: "#B9855A" },
  { name: "Espresso", hex: "#4F3626" },
  { name: "Chestnut", hex: "#8A6547" },
  { name: "Black Onyx", hex: "#1A1512" },
  { name: "Camel Tan", hex: "#D9B491" },
  { name: "Olive Moss", hex: "#6B6250" },
  { name: "Burgundy Wine", hex: "#6B2737" },
  { name: "Midnight Navy", hex: "#2C3E50" },
  { name: "Warm Camel", hex: "#C9A26B" },
  { name: "Charcoal Grey", hex: "#3B3B3B" },
];

interface CategorySeed {
  name: string;
  slug: string;
  description: string;
  icon: string;
  products: string[];
  priceRange: [number, number];
}

const CATEGORY_SEED: CategorySeed[] = [
  {
    name: "Office Bags",
    slug: "office-bags",
    description:
      "Structured, boardroom-ready leather bags built for the modern professional — sharp silhouettes with room for everything the workday demands.",
    icon: "Briefcase",
    products: [
      "Leather Office Bag",
      "Chairman Leather Briefcase",
      "Whitfield Slim Portfolio Bag",
      "Kensington Structured Briefcase",
      "Ashford Business Tote",
    ],
    priceRange: [7999, 18999],
  },
  {
    name: "Laptop Bags",
    slug: "laptop-bags",
    description:
      "Padded, protective and unmistakably premium — laptop bags engineered to carry your tech in leather that only gets better with age.",
    icon: "Laptop",
    products: [
      "Meridian 15-inch Laptop Bag",
      "Harrow Slim Laptop Sleeve Bag",
      "Camden Tech Laptop Backpack",
      "Bramwell Laptop Messenger",
      "Sterling Commuter Laptop Bag",
    ],
    priceRange: [6499, 15999],
  },
  {
    name: "Messenger Bags",
    slug: "messenger-bags",
    description:
      "Cross-body carry with an editorial edge — messenger bags cut from full-grain hides for daily commutes and weekend errands alike.",
    icon: "Mail",
    products: [
      "Foxhollow Messenger Bag",
      "Barrington Cross-Body Messenger",
      "Hartley Vintage Messenger Bag",
      "Overland Courier Messenger",
      "Preston Flap Messenger Bag",
    ],
    priceRange: [5499, 13999],
  },
  {
    name: "Backpacks",
    slug: "backpacks",
    description:
      "Leather backpacks that trade nylon for narrative — hand-finished panels, brass hardware and a shape built to last decades.",
    icon: "Backpack",
    products: [
      "Alpine Leather Backpack",
      "Voyager Convertible Backpack",
      "Whitlock Daypack Backpack",
      "Cambridge Scholar Backpack",
      "Nomad Weekender Backpack",
    ],
    priceRange: [6999, 16999],
  },
  {
    name: "Travel Bags",
    slug: "travel-bags",
    description:
      "Built for departures — spacious travel companions with reinforced seams, trolley sleeves and the patina of a well-lived life.",
    icon: "Plane",
    products: [
      "Odyssey Weekender Travel Bag",
      "Continental Cabin Travel Bag",
      "Meridian Garment Travel Bag",
      "Voyage Rolling Travel Duffel",
      "Wayfarer Travel Holdall",
    ],
    priceRange: [9999, 24999],
  },
  {
    name: "Duffel Bags",
    slug: "duffel-bags",
    description:
      "From gym floor to weekend getaway — duffel bags that balance rugged capacity with a refined, unmistakably leather finish.",
    icon: "Dumbbell",
    products: [
      "Marlow Classic Duffel Bag",
      "Ironside Gym Duffel Bag",
      "Harbor Weekend Duffel",
      "Brixton Sports Duffel Bag",
      "Rutherford Barrel Duffel",
    ],
    priceRange: [6999, 15999],
  },
  {
    name: "Women's Bags",
    slug: "womens-bags",
    description:
      "Considered silhouettes and soft, supple hides — a collection designed for women who dress with intention.",
    icon: "Sparkles",
    products: [
      "Aria Structured Handbag",
      "Camille Evening Clutch Bag",
      "Elodie Shoulder Bag",
      "Isabella Top-Handle Bag",
      "Seraphina Quilted Bag",
    ],
    priceRange: [5999, 17999],
  },
  {
    name: "Handbags",
    slug: "handbags",
    description:
      "Everyday handbags with an heirloom feel — roomy, richly textured, and finished with hardware that ages beautifully.",
    icon: "ShoppingBag",
    products: [
      "Juliette Tote Handbag",
      "Vivienne Crossbody Handbag",
      "Margaux Bucket Handbag",
      "Odette Satchel Handbag",
      "Colette Hobo Handbag",
    ],
    priceRange: [5499, 14999],
  },
  {
    name: "Wallets",
    slug: "wallets",
    description:
      "Pocket-sized craftsmanship — slim, precisely stitched wallets and cardholders made from the same hides as our bags.",
    icon: "Wallet",
    products: [
      "Sterling Bifold Wallet",
      "Ashworth Cardholder Wallet",
      "Bramford Zip-Around Wallet",
      "Whitmore Travel Wallet",
      "Kensington Slim Wallet",
    ],
    priceRange: [1499, 4999],
  },
  {
    name: "Accessories",
    slug: "accessories",
    description:
      "The finishing details — belts, key pouches and travel accessories designed to complete the Corium wardrobe.",
    icon: "Gem",
    products: [
      "Hendricks Leather Belt",
      "Camden Passport Holder",
      "Whitfield Key Pouch",
      "Ashford Luggage Tag Set",
      "Sterling Leather Watch Strap",
    ],
    priceRange: [1299, 3999],
  },
];

const DESC_OPENERS = [
  "Cut from richly grained hide and finished by hand,",
  "Born from a love of honest materials,",
  "Designed for people who notice the details,",
  "Sitting at the intersection of form and function,",
  "Made to be used, not just admired,",
];

const DESC_MIDDLES = [
  "every seam is reinforced for daily wear and every edge is hand-burnished to a smooth, lasting finish.",
  "the interior is fully lined and organised with dedicated pockets for the essentials you carry most.",
  "solid brass hardware and vegetable-tanned edges are chosen to age gracefully alongside you.",
  "a considered blend of structure and softness keeps its shape while remaining comfortable to carry.",
  "each panel is selected for grain consistency, then cut and stitched in small batches by our artisans.",
];

const DESC_CLOSERS = [
  "It's a piece designed to be inherited, not replaced.",
  "Over time, the leather will darken and soften, carrying the story of everywhere you've taken it.",
  "This is quiet luxury: no logos shouting for attention, just uncompromising craft.",
  "Backed by our craftsmanship warranty, it's built for years of daily use.",
  "A wardrobe staple that pairs as easily with denim as it does with tailoring.",
];

function buildDescription(name: string, leather: string, category: string, i: number) {
  const opener = DESC_OPENERS[i % DESC_OPENERS.length];
  const middle = DESC_MIDDLES[(i + 1) % DESC_MIDDLES.length];
  const closer = DESC_CLOSERS[(i + 2) % DESC_CLOSERS.length];
  return `${opener} the ${name} is crafted from premium ${leather.toLowerCase()}, sourced and tanned to our exacting standards. As part of our ${category} collection, ${middle} ${closer}`;
}

function buildShortDescription(name: string, leather: string) {
  return `The ${name} pairs ${leather.toLowerCase()} with considered hardware and a silhouette built for everyday luxury.`;
}

const REVIEW_AUTHORS = [
  "Aarav Mehta", "Priya Sharma", "Rohan Kapoor", "Ishita Desai", "Vikram Nair",
  "Ananya Iyer", "Karan Malhotra", "Sneha Reddy", "Arjun Singh", "Divya Menon",
  "Kabir Khanna", "Meera Pillai", "Siddharth Rao", "Neha Bhatt", "Aditya Verma",
  "Tanvi Joshi", "Rahul Gupta", "Pooja Chawla", "Nikhil Bansal", "Ritika Saxena",
];

const REVIEW_TITLES = [
  "Exceeded my expectations",
  "Worth every rupee",
  "Beautiful craftsmanship",
  "My new everyday carry",
  "Compliments every time I use it",
  "Exactly as pictured",
  "Perfect gift",
  "Ages beautifully",
];

const REVIEW_BODIES = [
  "The leather quality is outstanding — you can tell this isn't mass-produced. Stitching is clean and the hardware feels substantial.",
  "Ordered this for daily office use and it has held up perfectly for months. The compartments are thoughtfully placed.",
  "Smells incredible out of the box, and the colour is richer in person than in the photos. Packaging was premium too.",
  "Slightly pricier than I expected but the build quality justifies it completely. Already looking at my next purchase.",
  "Delivery was fast and the bag arrived in great condition. It's become my go-to for both work and weekend trips.",
  "The leather has already started developing a lovely patina after a month of use. Very happy with this purchase.",
  "Great size — fits a 15-inch laptop plus my everyday essentials with room to spare. Straps are comfortable too.",
  "Bought this as a gift and the recipient loved it. The unboxing experience alone felt premium.",
];

const CUSTOMER_NAMES = [
  "Aarav Mehta", "Priya Sharma", "Rohan Kapoor", "Ishita Desai",
  "Vikram Nair", "Ananya Iyer", "Karan Malhotra", "Sneha Reddy",
];

const INDIAN_CITIES = [
  { city: "Bengaluru", state: "Karnataka", postalCode: "560001" },
  { city: "Mumbai", state: "Maharashtra", postalCode: "400001" },
  { city: "Delhi", state: "Delhi", postalCode: "110001" },
  { city: "Pune", state: "Maharashtra", postalCode: "411001" },
  { city: "Hyderabad", state: "Telangana", postalCode: "500001" },
  { city: "Chennai", state: "Tamil Nadu", postalCode: "600001" },
  { city: "Kolkata", state: "West Bengal", postalCode: "700001" },
  { city: "Ahmedabad", state: "Gujarat", postalCode: "380001" },
];

async function main() {
  console.log("Clearing existing data...");
  await prisma.$transaction([
    prisma.contactSubmission.deleteMany(),
    prisma.newsletterSubscriber.deleteMany(),
    prisma.mediaAsset.deleteMany(),
    prisma.setting.deleteMany(),
    prisma.faqItem.deleteMany(),
    prisma.cmsPage.deleteMany(),
    prisma.homepageSection.deleteMany(),
    prisma.banner.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.wishlistItem.deleteMany(),
    prisma.review.deleteMany(),
    prisma.coupon.deleteMany(),
    prisma.productVariant.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.address.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log("Seeding categories...");
  const categories = [];
  for (let i = 0; i < CATEGORY_SEED.length; i++) {
    const c = CATEGORY_SEED[i];
    const cat = await prisma.category.create({
      data: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        imageUrl: placeholderUrl("category", c.slug, { w: 900, h: 1200 }),
        bannerUrl: placeholderUrl("banner", `${c.slug}-banner`, { w: 1600, h: 500 }),
        icon: c.icon,
        metaTitle: `${c.name} | Premium Genuine Leather | Corium`,
        metaDesc: c.description,
        sortOrder: i,
        isFeatured: true,
      },
    });
    categories.push({ ...cat, priceRange: c.priceRange, productNames: c.products });
  }

  console.log("Seeding products, images, variants & reviews...");
  let productIndex = 0;
  const allProducts: { id: string; slug: string; price: number }[] = [];

  for (const cat of categories) {
    for (let p = 0; p < cat.productNames.length; p++) {
      const name = cat.productNames[p];
      const productSlug = slug(name);
      const leather = LEATHER_TYPES[productIndex % LEATHER_TYPES.length];
      const [minP, maxP] = cat.priceRange;
      const price = Math.round((minP + ((maxP - minP) * ((productIndex * 37) % 100)) / 100) / 10) * 10;
      const hasDiscount = productIndex % 3 === 0;
      const compareAtPrice = hasDiscount ? Math.round((price * 1.25) / 10) * 10 : null;
      const stock = productIndex % 17 === 0 ? 0 : 8 + ((productIndex * 13) % 55);
      const colors = pick(COLORS, 3, productIndex);
      const sku = `CRM-${cat.slug.slice(0, 2).toUpperCase()}-${1000 + productIndex}`;

      const isFeatured = productIndex % 4 === 0;
      const isTrending = productIndex % 5 === 1;
      const isLatest = productIndex % 6 === 2;

      const product = await prisma.product.create({
        data: {
          name,
          slug: productSlug,
          sku,
          shortDescription: buildShortDescription(name, leather),
          description: buildDescription(name, leather, cat.name, productIndex),
          categoryId: cat.id,
          leatherType: leather,
          price,
          compareAtPrice,
          stock,
          colors: JSON.stringify(colors),
          dimensions: `${28 + (productIndex % 6)}cm (W) x ${22 + (productIndex % 4)}cm (H) x ${8 + (productIndex % 5)}cm (D)`,
          weight: `${(0.6 + (productIndex % 9) * 0.15).toFixed(1)} kg`,
          warranty: "2-Year Craftsmanship Warranty",
          careInstructions:
            "Wipe clean with a soft, dry cloth. Condition every 3-4 months with a leather-specific conditioner. Avoid prolonged exposure to direct sunlight and moisture.",
          isFeatured,
          isTrending,
          isLatest,
          metaTitle: `${name} | Buy Genuine ${leather} Online | Corium`,
          metaDesc: buildShortDescription(name, leather),
          images: {
            create: [0, 1, 2].map((i) => ({
              url: placeholderUrl("product", `${productSlug}-${i}`, { w: 1000, h: 1250, label: name }),
              altText: `${name} - view ${i + 1}`,
              sortOrder: i,
            })),
          },
          variants: {
            create: colors.map((c, ci) => ({
              color: c.name,
              colorHex: c.hex,
              sku: `${sku}-${ci + 1}`,
              stock: Math.max(0, Math.round(stock / colors.length) - ci),
              priceDiff: ci === 0 ? 0 : ci * 200,
            })),
          },
        },
      });

      allProducts.push({ id: product.id, slug: product.slug, price: product.price });

      const reviewCount = 2 + (productIndex % 4);
      let ratingSum = 0;
      for (let r = 0; r < reviewCount; r++) {
        const rating = [5, 5, 4, 4, 5, 3][(productIndex + r) % 6];
        ratingSum += rating;
        await prisma.review.create({
          data: {
            productId: product.id,
            authorName: REVIEW_AUTHORS[(productIndex * 3 + r) % REVIEW_AUTHORS.length],
            rating,
            title: REVIEW_TITLES[(productIndex + r) % REVIEW_TITLES.length],
            comment: REVIEW_BODIES[(productIndex + r * 2) % REVIEW_BODIES.length],
            status: "APPROVED",
          },
        });
      }
      await prisma.product.update({
        where: { id: product.id },
        data: {
          avgRating: Math.round((ratingSum / reviewCount) * 10) / 10,
          reviewCount,
        },
      });

      productIndex++;
    }
  }
  console.log(`Seeded ${productIndex} products.`);

  console.log("Seeding users...");
  const adminPassword = await bcrypt.hash("Admin@12345", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Corium Admin",
      email: "admin@corium-leather.com",
      phone: "+91 90000 00001",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });

  const customerPassword = await bcrypt.hash("Customer@123", 10);
  const customers = [];
  for (let i = 0; i < CUSTOMER_NAMES.length; i++) {
    const name = CUSTOMER_NAMES[i];
    const email = `${slug(name).replace(/-/g, ".")}@example.com`;
    const loc = INDIAN_CITIES[i % INDIAN_CITIES.length];
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: `+91 98${(10000000 + i * 137).toString().slice(0, 8)}`,
        passwordHash: customerPassword,
        role: Role.CUSTOMER,
        emailVerified: new Date(),
        addresses: {
          create: [
            {
              label: "Home",
              type: AddressType.HOME,
              fullName: name,
              phone: `+91 98${(10000000 + i * 137).toString().slice(0, 8)}`,
              line1: `${100 + i} Park Residency`,
              line2: `${["MG Road", "Brigade Road", "Linking Road", "Camac Street"][i % 4]}`,
              city: loc.city,
              state: loc.state,
              postalCode: loc.postalCode,
              isDefault: true,
            },
          ],
        },
      },
    });
    customers.push(user);
  }
  console.log(`Seeded ${customers.length} customers + 1 admin (admin@corium-leather.com / Admin@12345)`);

  console.log("Seeding wishlist samples...");
  for (let i = 0; i < customers.length; i++) {
    const picks = pick(allProducts, 3, i * 5);
    for (const prod of picks) {
      await prisma.wishlistItem.create({
        data: { userId: customers[i].id, productId: prod.id },
      }).catch(() => {});
    }
  }

  console.log("Seeding coupons...");
  const coupons = await Promise.all([
    prisma.coupon.create({
      data: {
        code: "WELCOME10",
        description: "10% off your first order",
        type: CouponType.PERCENT,
        value: 10,
        minOrderValue: 2000,
        usageLimit: 500,
        usedCount: 84,
      },
    }),
    prisma.coupon.create({
      data: {
        code: "FESTIVE500",
        description: "Flat ₹500 off on orders above ₹3,999",
        type: CouponType.FLAT,
        value: 500,
        minOrderValue: 3999,
        usageLimit: 300,
        usedCount: 122,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
      },
    }),
    prisma.coupon.create({
      data: {
        code: "LEATHER20",
        description: "20% off premium collection, orders above ₹7,999",
        type: CouponType.PERCENT,
        value: 20,
        minOrderValue: 7999,
        usageLimit: 150,
        usedCount: 39,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
      },
    }),
    prisma.coupon.create({
      data: {
        code: "CORIUM100",
        description: "Flat ₹100 off, no minimum order value",
        type: CouponType.FLAT,
        value: 100,
        minOrderValue: 0,
        usageLimit: null,
        usedCount: 261,
      },
    }),
  ]);

  console.log("Seeding orders...");
  const statuses: OrderStatus[] = [
    OrderStatus.DELIVERED,
    OrderStatus.DELIVERED,
    OrderStatus.SHIPPED,
    OrderStatus.PROCESSING,
    OrderStatus.CONFIRMED,
    OrderStatus.PENDING,
    OrderStatus.CANCELLED,
    OrderStatus.OUT_FOR_DELIVERY,
  ];
  const paymentMethods: PaymentMethod[] = [
    PaymentMethod.COD,
    PaymentMethod.UPI,
    PaymentMethod.CARD,
    PaymentMethod.NETBANKING,
    PaymentMethod.WALLET,
  ];

  for (let i = 0; i < 18; i++) {
    const customer = customers[i % customers.length];
    const address = await prisma.address.findFirst({ where: { userId: customer.id } });
    const items = pick(allProducts, 1 + (i % 3), i * 7);
    const subtotal = items.reduce((sum, it) => sum + it.price, 0);
    const status = statuses[i % statuses.length];
    const discount = i % 3 === 0 ? Math.round(subtotal * 0.1) : 0;
    const shippingFee = subtotal >= 999 ? 0 : 149;
    const tax = Math.round((subtotal - discount) * 0.05);
    const total = subtotal - discount + shippingFee + tax;
    const createdAt = new Date(Date.now() - i * 1000 * 60 * 60 * 24 * 3);

    const productDetails = await prisma.product.findMany({
      where: { id: { in: items.map((it) => it.id) } },
      include: { images: true },
    });

    await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: customer.id,
        addressId: address?.id,
        shippingSnapshot: address
          ? JSON.stringify({
              fullName: address.fullName,
              phone: address.phone,
              line1: address.line1,
              line2: address.line2,
              city: address.city,
              state: address.state,
              postalCode: address.postalCode,
              country: address.country,
            })
          : "{}",
        status,
        paymentMethod: paymentMethods[i % paymentMethods.length],
        paymentStatus: status === OrderStatus.CANCELLED ? PaymentStatus.REFUNDED : PaymentStatus.PAID,
        subtotal,
        discount,
        shippingFee,
        tax,
        total,
        couponId: discount > 0 ? coupons[0].id : null,
        trackingNumber: status === OrderStatus.SHIPPED || status === OrderStatus.DELIVERED || status === OrderStatus.OUT_FOR_DELIVERY
          ? `IND${100000 + i * 7}IN`
          : null,
        trackingHistory: JSON.stringify(buildTrackingHistory(status, createdAt)),
        createdAt,
        updatedAt: createdAt,
        items: {
          create: productDetails.map((prod) => ({
            productId: prod.id,
            productName: prod.name,
            productImage: prod.images[0]?.url ?? "",
            price: prod.price,
            quantity: 1,
          })),
        },
      },
    });
  }

  console.log("Seeding banners...");
  await prisma.banner.createMany({
    data: [
      {
        placement: "hero",
        title: "The Art of Carrying Well",
        subtitle: "Full-grain leather bags, hand-finished for a lifetime of use.",
        ctaLabel: "Shop Now",
        ctaUrl: "/shop",
        imageUrl: placeholderUrl("banner", "hero-1", { w: 1800, h: 1000 }),
        sortOrder: 0,
      },
      {
        placement: "hero",
        title: "New Season, Timeless Leather",
        subtitle: "Discover the latest arrivals from our Autumn collection.",
        ctaLabel: "Explore Collection",
        ctaUrl: "/shop?sort=latest",
        imageUrl: placeholderUrl("banner", "hero-2", { w: 1800, h: 1000 }),
        sortOrder: 1,
      },
      {
        placement: "promo-left",
        title: "Luxury Office Collection",
        subtitle: "Structured briefcases built for the boardroom.",
        ctaLabel: "Shop Office Bags",
        ctaUrl: "/shop/office-bags",
        imageUrl: placeholderUrl("banner", "promo-office", { w: 1200, h: 900 }),
        sortOrder: 0,
      },
      {
        placement: "promo-right",
        title: "Travel Collection",
        subtitle: "Weekend-ready duffels and cabin bags.",
        ctaLabel: "Shop Travel Bags",
        ctaUrl: "/shop/travel-bags",
        imageUrl: placeholderUrl("banner", "promo-travel", { w: 1200, h: 900 }),
        sortOrder: 1,
      },
    ],
  });

  console.log("Seeding homepage CMS sections...");
  await prisma.homepageSection.createMany({
    data: [
      {
        key: "announcement",
        content: JSON.stringify({
          messages: [
            "Free Shipping on Orders Over ₹999",
            "Easy 15-Day Returns & Exchanges",
            "100% Genuine Full-Grain Leather",
          ],
        }),
        sortOrder: 0,
      },
      {
        key: "hero",
        title: "The Art of Carrying Well",
        subtitle: "Full-grain leather bags, hand-finished for a lifetime of use.",
        content: JSON.stringify({}),
        sortOrder: 1,
      },
      {
        key: "categories",
        title: "Shop by Category",
        subtitle: "Ten collections, each built around how you actually carry your life.",
        content: JSON.stringify({}),
        sortOrder: 2,
      },
      {
        key: "latest-products",
        title: "Latest Arrivals",
        subtitle: "Fresh off the workbench — our newest designs.",
        content: JSON.stringify({ limit: 8 }),
        sortOrder: 3,
      },
      {
        key: "trending-products",
        title: "Trending Now",
        subtitle: "The pieces our customers can't stop talking about.",
        content: JSON.stringify({ limit: 8 }),
        sortOrder: 4,
      },
      {
        key: "promo-banners",
        title: "",
        subtitle: "",
        content: JSON.stringify({}),
        sortOrder: 5,
      },
      {
        key: "recently-viewed",
        title: "Recently Viewed",
        subtitle: "Pick up where you left off.",
        content: JSON.stringify({}),
        sortOrder: 6,
      },
      {
        key: "why-choose-us",
        title: "Why Choose Corium",
        subtitle: "Six reasons our customers keep coming back.",
        content: JSON.stringify({
          items: [
            { icon: "Gem", title: "100% Genuine Leather", text: "Every hide is sourced from certified tanneries and inspected for grain quality." },
            { icon: "Hammer", title: "Premium Craftsmanship", text: "Hand-cut, hand-stitched, and finished by artisans with decades of experience." },
            { icon: "ShieldCheck", title: "Secure Payments", text: "Bank-grade encryption on every transaction, every time." },
            { icon: "Truck", title: "Fast Delivery", text: "Dispatched within 24 hours, delivered across India in 3-6 business days." },
            { icon: "RefreshCw", title: "Easy Returns", text: "15-day hassle-free returns and exchanges, no questions asked." },
            { icon: "Headphones", title: "Customer Support", text: "A real human, ready to help via chat, email or phone." },
          ],
        }),
        sortOrder: 7,
      },
      {
        key: "reviews",
        title: "Loved by Our Customers",
        subtitle: "Real stories from people carrying Corium every day.",
        content: JSON.stringify({}),
        sortOrder: 8,
      },
      {
        key: "instagram",
        title: "Follow @corium.leather",
        subtitle: "Tag us in your carry for a chance to be featured.",
        content: JSON.stringify({
          images: Array.from({ length: 8 }).map((_, i) => placeholderUrl("gallery", `insta-${i}`, { w: 500, h: 500 })),
        }),
        sortOrder: 9,
      },
      {
        key: "newsletter",
        title: "Join the Corium Circle",
        subtitle: "Early access to new collections, private sales & craft stories.",
        content: JSON.stringify({}),
        sortOrder: 10,
      },
    ],
  });

  console.log("Seeding CMS pages...");
  await prisma.cmsPage.createMany({
    data: [
      {
        slug: "about-us",
        title: "About Corium",
        metaTitle: "About Us | Corium Leather Co.",
        metaDesc: "Learn the story behind Corium Leather Co. — our craft, our values, and the people behind every bag.",
        content: JSON.stringify({
          hero: {
            title: "Leather, Made to Last a Lifetime",
            subtitle: "Since 2014, Corium has been quietly building bags meant to be inherited, not replaced.",
          },
          sections: [
            {
              heading: "Our Story",
              body: "Corium began in a small workshop in Bengaluru with a simple frustration: too many 'leather' bags fell apart within a year. Our founders, a leather technologist and a product designer, set out to build a brand that never compromised on materials — full-grain and top-grain hides only, sourced from tanneries that meet strict environmental and ethical standards. What started as a 12-bag capsule collection has grown into a full range of bags, backpacks and accessories, but the standard hasn't moved an inch.",
            },
            {
              heading: "Our Craft",
              body: "Every Corium piece passes through the hands of fewer than eight artisans, from hide selection to final inspection. We cut in small batches, hand-burnish every edge, and test each hardware fitting for a minimum of 10,000 open-close cycles. It's slower than mass production — and that's exactly the point.",
            },
            {
              heading: "Our Promise",
              body: "We back every bag with a 2-year craftsmanship warranty and a 15-day no-questions-asked return window. If a stitch ever fails under normal use, we'll repair it — that's not a policy, it's how we think leather goods should work.",
            },
          ],
          stats: [
            { label: "Years of Craft", value: "10+" },
            { label: "Artisans", value: "34" },
            { label: "Happy Customers", value: "48,000+" },
            { label: "Cities Delivered To", value: "600+" },
          ],
        }),
      },
      {
        slug: "contact-us",
        title: "Contact Us",
        metaTitle: "Contact Us | Corium Leather Co.",
        metaDesc: "Get in touch with the Corium team for order support, wholesale enquiries, or general questions.",
        content: JSON.stringify({
          intro: "Have a question about an order, a product, or a bulk enquiry? Our team responds within one business day.",
          hours: "Monday – Saturday, 9:30 AM – 6:30 PM IST",
        }),
      },
      {
        slug: "privacy-policy",
        title: "Privacy Policy",
        metaTitle: "Privacy Policy | Corium Leather Co.",
        metaDesc: "How Corium Leather Co. collects, uses and protects your personal information.",
        content: JSON.stringify({
          updatedAt: "1 June 2026",
          sections: [
            { heading: "Information We Collect", body: "We collect information you provide directly, such as your name, email, phone number, shipping and billing addresses, and payment details, when you create an account, place an order, or contact customer support. We also automatically collect certain data — such as device type, browser, IP address and browsing behaviour on our site — through cookies and analytics tools." },
            { heading: "How We Use Your Information", body: "Your information is used to process and deliver orders, communicate order updates, provide customer support, personalise your shopping experience, prevent fraud, and — where you've opted in — send marketing communications about new collections and offers." },
            { heading: "How We Protect Your Information", body: "We use industry-standard encryption (TLS/SSL) for all data in transit, hash all stored passwords with bcrypt, and restrict access to personal data to employees who need it to perform their job. Payment card details are never stored on our servers; all transactions are processed through PCI-DSS compliant payment gateways." },
            { heading: "Cookies", body: "We use cookies to keep you signed in, remember items in your cart and wishlist, and understand how visitors use our site so we can improve it. You can disable cookies in your browser settings, though some site features may not work correctly." },
            { heading: "Sharing Your Information", body: "We share your information only with service providers who help us operate our business — payment processors, shipping carriers, and analytics providers — each bound by confidentiality obligations. We never sell your personal data to third parties." },
            { heading: "Your Rights", body: "You can access, update or delete your account information at any time from My Account, or by contacting privacy@corium-leather.com. You may also request a copy of the data we hold about you." },
            { heading: "Contact Us", body: "For any privacy-related questions, write to privacy@corium-leather.com or use the contact form on our Contact Us page." },
          ],
        }),
      },
      {
        slug: "terms-and-conditions",
        title: "Terms & Conditions",
        metaTitle: "Terms & Conditions | Corium Leather Co.",
        metaDesc: "The terms and conditions governing your use of the Corium Leather Co. website and purchases.",
        content: JSON.stringify({
          updatedAt: "1 June 2026",
          sections: [
            { heading: "Acceptance of Terms", body: "By accessing or using the Corium Leather Co. website, you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree, please do not use our website or services." },
            { heading: "Products & Pricing", body: "All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to modify prices, discontinue products, or correct pricing errors at any time without prior notice. Product images are for illustrative purposes; minor variations in colour and texture are natural characteristics of genuine leather." },
            { heading: "Orders & Payment", body: "By placing an order, you confirm that all information provided is accurate. We accept Cash on Delivery, UPI, credit/debit cards, net banking and select wallets. Orders are confirmed only after successful payment authorization (or COD confirmation) and inventory verification." },
            { heading: "Shipping", body: "Please refer to our Shipping & Return Policy for delivery timelines, charges, and serviceable areas. Corium is not liable for delays caused by courier partners, weather events, or circumstances beyond our control." },
            { heading: "Returns & Cancellations", body: "Orders may be cancelled before dispatch. Once delivered, our 15-day return policy applies as detailed in our Shipping & Return Policy. Customised or personalised items are non-returnable unless defective." },
            { heading: "Intellectual Property", body: "All content on this website — including logos, product photography, text and design — is the property of Corium Leather Co. and may not be reproduced without written permission." },
            { heading: "Limitation of Liability", body: "Corium Leather Co. shall not be liable for any indirect, incidental or consequential damages arising from the use of our products or website, to the maximum extent permitted by law." },
            { heading: "Governing Law", body: "These terms are governed by the laws of India, with courts in Bengaluru, Karnataka having exclusive jurisdiction." },
          ],
        }),
      },
      {
        slug: "shipping-return-policy",
        title: "Shipping & Return Policy",
        metaTitle: "Shipping & Return Policy | Corium Leather Co.",
        metaDesc: "Everything you need to know about delivery timelines, shipping charges, returns and exchanges at Corium.",
        content: JSON.stringify({
          updatedAt: "1 June 2026",
          sections: [
            { heading: "Shipping Charges", body: "We offer free standard shipping on all prepaid orders above ₹999. Orders below this value are charged a flat ₹149 shipping fee. Express delivery (1-2 business days, select metro cities) is available at checkout for an additional ₹249." },
            { heading: "Delivery Timelines", body: "Standard delivery takes 3-6 business days for metro cities and 5-8 business days for other locations, after dispatch. Orders are typically dispatched within 24-48 hours of confirmation. You'll receive a tracking link via email and SMS once your order ships." },
            { heading: "Cash on Delivery", body: "COD is available for orders up to ₹25,000 across most serviceable pin codes. A nominal COD handling fee of ₹49 applies." },
            { heading: "Returns & Exchanges", body: "We accept returns within 15 days of delivery for unused items in original packaging with tags intact. To initiate a return, visit My Account > Orders and select 'Request Return', or contact support@corium-leather.com with your order number." },
            { heading: "Refunds", body: "Once your return is received and inspected, refunds are processed within 5-7 business days to your original payment method. COD order refunds are issued via bank transfer or store credit." },
            { heading: "Non-Returnable Items", body: "Personalised or monogrammed items, and items marked 'Final Sale', cannot be returned or exchanged unless received damaged or defective." },
            { heading: "Damaged or Incorrect Items", body: "If you receive a damaged, defective or incorrect item, please contact us within 48 hours of delivery with photos of the product and packaging, and we'll arrange a free replacement or full refund." },
          ],
        }),
      },
    ],
  });

  console.log("Seeding FAQs...");
  await prisma.faqItem.createMany({
    data: [
      { category: "Orders", question: "How do I place an order?", answer: "Browse our Shop page, select a product, choose your colour and quantity, then add it to your bag. When you're ready, proceed to checkout, enter your shipping details and complete payment.", sortOrder: 0 },
      { category: "Orders", question: "Can I modify or cancel my order after placing it?", answer: "You can cancel an order from My Account > Orders as long as it hasn't been dispatched. Once shipped, cancellations aren't possible, but you can request a return after delivery.", sortOrder: 1 },
      { category: "Orders", question: "How can I track my order?", answer: "Once your order is dispatched, you'll receive a tracking number via email and SMS. You can also track your order anytime from the Track Order page using your order number and registered email or phone number.", sortOrder: 2 },
      { category: "Shipping", question: "Do you offer free shipping?", answer: "Yes — all prepaid orders above ₹999 qualify for free standard shipping across India. Orders below this value are charged a flat ₹149.", sortOrder: 3 },
      { category: "Shipping", question: "How long does delivery take?", answer: "Standard delivery takes 3-6 business days for metro cities and 5-8 business days for other locations after your order is dispatched.", sortOrder: 4 },
      { category: "Shipping", question: "Do you deliver internationally?", answer: "Currently we ship only within India. We're working on international shipping and will announce it on our homepage once available.", sortOrder: 5 },
      { category: "Returns", question: "What is your return policy?", answer: "We accept returns within 15 days of delivery for unused items in original packaging with tags intact. Initiate a return from My Account > Orders.", sortOrder: 6 },
      { category: "Returns", question: "How long do refunds take?", answer: "Refunds are processed within 5-7 business days of us receiving and inspecting the returned item, credited to your original payment method.", sortOrder: 7 },
      { category: "Product Care", question: "How do I care for my leather bag?", answer: "Wipe clean with a soft, dry cloth after each use. Condition the leather every 3-4 months with a leather-specific conditioner, and avoid prolonged exposure to direct sunlight, heat or moisture.", sortOrder: 8 },
      { category: "Product Care", question: "Is it normal for the leather colour to change over time?", answer: "Yes — genuine full-grain and top-grain leather naturally develops a richer patina with use and exposure to light. This is a hallmark of authentic leather, not a defect.", sortOrder: 9 },
      { category: "Payments", question: "What payment methods do you accept?", answer: "We accept Cash on Delivery (COD), UPI, all major credit and debit cards, net banking, and popular mobile wallets.", sortOrder: 10 },
      { category: "Payments", question: "Is it safe to pay online on your website?", answer: "Yes. All transactions are processed through PCI-DSS compliant, encrypted payment gateways. We never store your card details on our servers.", sortOrder: 11 },
      { category: "Payments", question: "Do you offer EMI options?", answer: "EMI is available on select credit and debit cards for orders above ₹3,000. Available EMI plans will be shown at checkout based on your card.", sortOrder: 12 },
      { category: "Product", question: "Is the leather genuine?", answer: "Yes, every Corium product is made from 100% genuine full-grain, top-grain or nubuck leather, sourced from certified tanneries. Material details are listed on every product page.", sortOrder: 13 },
    ],
  });

  console.log("Seeding settings...");
  await prisma.setting.createMany({
    data: [
      { key: "general", value: JSON.stringify({ siteName: "CORIUM", tagline: "Timeless Leather, Modern Craft", logoUrl: "", favicon: "", email: "hello@corium-leather.com", supportEmail: "support@corium-leather.com", phone: "+91 98765 43210", whatsapp: "+91 98765 43210", address: "42 Residency Road, Bengaluru, Karnataka 560025, India" }) },
      { key: "social", value: JSON.stringify({ instagram: "https://instagram.com/corium.leather", facebook: "https://facebook.com/coriumleather", twitter: "https://twitter.com/coriumleather", pinterest: "https://pinterest.com/coriumleather" }) },
      { key: "seo", value: JSON.stringify({ defaultMetaTitle: "Corium | Premium Genuine Leather Bags", defaultMetaDesc: "Shop premium full-grain leather bags, backpacks, wallets and accessories. Handcrafted, built to last, delivered across India.", gaId: "", gtmId: "", metaPixelId: "", searchConsoleVerification: "" }) },
      { key: "payment", value: JSON.stringify({ codEnabled: true, upiEnabled: true, cardEnabled: true, netbankingEnabled: true, walletEnabled: true, codFee: 49, codMaxOrderValue: 25000 }) },
      { key: "shipping", value: JSON.stringify({ freeShippingThreshold: 999, standardFee: 149, expressFee: 249, standardDeliveryDays: "3-6", expressDeliveryDays: "1-2" }) },
      { key: "tax", value: JSON.stringify({ gstPercent: 5, pricesIncludeTax: true }) },
      { key: "currency", value: JSON.stringify({ code: "INR", symbol: "₹" }) },
    ],
  });

  console.log("Seeding media library samples...");
  await prisma.mediaAsset.createMany({
    data: allProducts.slice(0, 12).map((p) => ({
      url: placeholderUrl("product", `${p.slug}-0`, { w: 600, h: 750 }),
      altText: `${p.slug.replace(/-/g, " ")} product photo`,
      folder: "products",
    })),
  });

  console.log("Seeding newsletter subscribers & contact submissions...");
  await prisma.newsletterSubscriber.createMany({
    data: [
      { email: "early.access1@example.com" },
      { email: "early.access2@example.com" },
      { email: "leather.lover@example.com" },
    ],
  });
  await prisma.contactSubmission.createMany({
    data: [
      { name: "Rhea Kapoor", email: "rhea.k@example.com", phone: "+91 98111 22233", subject: "Bulk order enquiry", message: "Hi, I'd like to enquire about bulk pricing for 25 units of the Sterling Commuter Laptop Bag for a corporate gifting programme." },
      { name: "Aman Trivedi", email: "aman.t@example.com", subject: "Order not received", message: "My order MC20260610452 was marked delivered but I haven't received it. Could you please check?" },
    ],
  });

  console.log("\n✅ Seed complete.");
  console.log("Admin login: admin@corium-leather.com / Admin@12345");
  console.log("Customer login: aarav.mehta@example.com / Customer@123");
}

function buildTrackingHistory(status: OrderStatus, createdAt: Date) {
  const steps: { status: string; date: Date; note: string }[] = [
    { status: "PENDING", date: createdAt, note: "Order placed" },
  ];
  const day = (n: number) => new Date(createdAt.getTime() + n * 1000 * 60 * 60 * 24);
  const order: OrderStatus[] = [
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
    OrderStatus.OUT_FOR_DELIVERY,
    OrderStatus.DELIVERED,
  ];
  const notes: Record<string, string> = {
    CONFIRMED: "Order confirmed and payment verified",
    PROCESSING: "Order is being packed at our warehouse",
    SHIPPED: "Order has been shipped",
    OUT_FOR_DELIVERY: "Out for delivery",
    DELIVERED: "Delivered successfully",
    CANCELLED: "Order cancelled",
  };
  if (status === OrderStatus.CANCELLED) {
    steps.push({ status: "CANCELLED", date: day(1), note: notes.CANCELLED });
    return steps;
  }
  const idx = order.indexOf(status);
  const reached = idx === -1 ? [] : order.slice(0, idx + 1);
  reached.forEach((s, i) => steps.push({ status: s, date: day(i + 1), note: notes[s] }));
  return steps;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
