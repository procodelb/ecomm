require("dotenv").config({ path: ".env.local" });
const PROJECT_ID = "wrl9moj5";
const DATASET = "production";
const TOKEN = process.env.SANITY_API_TOKEN;
const API = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${DATASET}`;
const ASSET_API = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/assets/images/${DATASET}`;

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
  };
}

async function mutate(mutations) {
  const res = await fetch(API, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ mutations }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${res.status}: ${JSON.stringify(json.results || json.message || json).substring(0, 200)}`);
  return json;
}

async function createDoc(_type, data) {
  const result = await mutate([{ create: { _type, ...data } }]);
  const id = result.results?.[0]?.id;
  console.log(`  Created ${_type}: ${id}`);
  return id;
}

async function createOrReplace(_id, _type, data) {
  const result = await mutate([{ createOrReplace: { _id, _type, ...data } }]);
  const id = result.results?.[0]?.id;
  console.log(`  Created/Replaced ${_type}: ${id}`);
  return id;
}

const _key = () => Math.random().toString(36).substring(2, 8);

function ls(en, ar) {
  return { en, ar };
}
function lt(en, ar) {
  return { en, ar };
}

async function main() {
  if (!TOKEN) {
    console.error("SANITY_API_TOKEN not set");
    process.exit(1);
  }
  console.log("=== Sanity Seed Script ===\n");

  // 1. Site Settings
  console.log("--- Site Settings ---");
  await createOrReplace("siteSettings", "siteSettings", {
    title: "ECOMM — Luxury Water Toys",
    tagline: ls("Premium Watercraft & Marine Gear", "أفخر المركبات المائية والمعدات البحرية"),
    description: "ECOMM is the premier destination for luxury water toys, jet skis, surfboards, and marine accessories across UAE and Australia.",
    contactEmail: "hello@ecomm-store.com",
    contactPhone: "+971 4 123 4567",
    locales: ["en-AE", "en-AU", "ar-AE"],
    defaultLocale: "en-AE",
    social: {
      instagram: "https://instagram.com/ecomm",
      facebook: "https://facebook.com/ecomm",
      tiktok: "https://tiktok.com/@ecomm",
      youtube: "https://youtube.com/@ecomm",
    },
    defaultSeo: {
      metaTitle: "ECOMM — Luxury Water Toys & Premium Watercraft",
      metaDescription: "Shop the finest luxury water toys, jet skis, surfboards, and marine accessories. Premium brands, worldwide shipping, expert support.",
      keywords: ["luxury water toys", "jet skis", "surfboards", "marine accessories", "premium watercraft"],
    },
  });

  // 2. Categories
  console.log("\n--- Categories ---");
  const catJetSki = await createDoc("category", {
    title: ls("Jet Skis", "جت سكي"),
    slug: { current: "jet-skis", _type: "slug" },
    description: lt("High-performance jet skis for adrenaline seekers", "جت سكي عالي الأداء لعشاق الإثارة"),
  });
  const catESurfboard = await createDoc("category", {
    title: ls("E-Surfboards", "ألواح التزلج الكهربائية"),
    slug: { current: "e-surfboards", _type: "slug" },
    description: lt("Electric surfboards and hydrofoils for silent gliding", "ألواح تزلج كهربائية وهيدروفويل للانزلاق الصامت"),
  });
  const catJetBoard = await createDoc("category", {
    title: ls("Jet Boards", "الجت بورد"),
    slug: { current: "jet-boards", _type: "slug" },
    description: lt("Premium jet boards with cutting-edge technology", "ألواح جت فاخرة بأحدث التقنيات"),
  });
  const catAccessories = await createDoc("category", {
    title: ls("Accessories", "الإكسسوارات"),
    slug: { current: "accessories", _type: "slug" },
    description: lt("Marine accessories, safety gear, and parts", "إكسسوارات بحرية، معدات سلامة وقطع غيار"),
  });
  const catInflatables = await createDoc("category", {
    title: ls("Inflatable Water Toys", "الألعاب المائية القابلة للنفخ"),
    slug: { current: "inflatables", _type: "slug" },
    description: lt("Portable inflatable water toys and jet skis", "ألعاب مائية قابلة للنفخ محمولة"),
  });

  // 3. Supplier
  console.log("\n--- Supplier ---");
  await createDoc("supplier", {
    name: "CJ Dropshipping",
    code: "CJ_DROPSHIPPING",
    country: "China",
    shippingMethods: ["standard", "express"],
    currencies: ["AED", "AUD", "USD"],
    moq: 1,
    leadTimeMin: 7,
    leadTimeMax: 15,
    rating: 4.5,
    status: "active",
  });

  // 4. Products
  console.log("\n--- Products ---");
  const p1 = await createDoc("product", {
    title: ls("Hydrofoil E-Surfboard Elite", "لوح التزلج الكهربائي Elite"),
    slug: { current: "hydrofoil-e-surfboard-elite", _type: "slug" },
    shortDescription: lt("30 mph | Whisper-quiet | 45 min ride time", "48 كم/س | هادئ جداً | 45 دقيقة تشغيل"),
    description: {
      en: [
        { _type: "block", style: "normal", children: [{ _type: "span", text: "Experience the future of water sports with the Hydrofoil E-Surfboard Elite. Featuring a whisper-quiet electric motor, carbon-Kevlar hybrid construction, and hydrofoil technology that lifts you above the water for a smooth, silent ride." }] },
        { _type: "block", style: "normal", children: [{ _type: "span", text: "Perfect for ocean, lake, or river — no waves required. The 45-minute battery gives you plenty of time to explore, and the quick-charge system gets you back on the water in under 2 hours." }] },
      ],
    },
    category: { _type: "reference", _ref: catESurfboard },
    tags: ["hydrofoil", "electric", "elite", "e-surfboard", "carbon-kevlar"],
    featured: true,
    price: { aed: 42000, aud: 17000 },
    comparePrice: { aed: 48999, aud: 19999 },
    costPrice: { aed: 28000, aud: 11200 },
    taxable: true,
    sku: "CJF-HF-002",
    weightKg: 22,
    dimensionsCm: { length: 200, width: 70, height: 20 },
    countryOfOrigin: "China",
    hsCode: "9506.29",
    leadTime: "7-15 days",
    moq: 1,
    availability: { status: "in_stock", allowBackorder: false },
    schemaProductType: "Watercraft",
    ageRating: "12+",
  });

  const p2 = await createDoc("product", {
    title: ls("Luxury Carbon Fiber Jet Board", "جت بورد كربون فايبر فاخر"),
    slug: { current: "luxury-carbon-fiber-jet-board", _type: "slug" },
    shortDescription: lt("45 mph | 60 min runtime | Smart app control", "72 كم/س | 60 دقيقة تشغيل | تحكم بالتطبيق"),
    description: {
      en: [
        { _type: "block", style: "normal", children: [{ _type: "span", text: "The ultimate in personal watercraft. This carbon fiber jet board delivers 45 mph top speed with 60 minutes of runtime. Smartphone app integration lets you monitor battery, adjust speed modes, and track your rides." }] },
        { _type: "block", style: "normal", children: [{ _type: "span", text: "Premium components throughout — from the marine-grade aluminum alloy impeller to the quick-release battery system." }] },
      ],
    },
    category: { _type: "reference", _ref: catJetBoard },
    tags: ["carbon-fiber", "electric", "premium", "jet-board", "smart-app"],
    featured: true,
    price: { aed: 28500, aud: 11500 },
    comparePrice: { aed: 32999, aud: 13500 },
    costPrice: { aed: 18000, aud: 7200 },
    taxable: true,
    sku: "CJF-JB-001",
    weightKg: 28.5,
    dimensionsCm: { length: 180, width: 60, height: 15 },
    countryOfOrigin: "China",
    hsCode: "9506.29",
    leadTime: "7-15 days",
    moq: 1,
    availability: { status: "in_stock", allowBackorder: false },
    schemaProductType: "Watercraft",
    ageRating: "16+",
  });

  const p3 = await createDoc("product", {
    title: ls("Premium Inflatable Jet Ski", "جت سكي قابل للنفخ فاخر"),
    slug: { current: "premium-inflatable-jet-ski", _type: "slug" },
    shortDescription: lt("25 HP | Portable | 15 min setup", "25 حصان | محمول | 15 دقيقة تجهيز"),
    description: {
      en: [
        { _type: "block", style: "normal", children: [{ _type: "span", text: "The world's most portable jet ski. Fits in your car trunk, inflates in 15 minutes, and delivers 25 HP of pure fun. Marine-grade PVC construction with drop-stitch technology for rigid performance." }] },
        { _type: "block", style: "normal", children: [{ _type: "span", text: "Includes electric pump, repair kit, carrying bag, and remote kill switch. Take it to the beach, lake, or river — anywhere adventure calls." }] },
      ],
    },
    category: { _type: "reference", _ref: catInflatables },
    tags: ["inflatable", "portable", "jet-ski", "premium"],
    price: { aed: 18500, aud: 7500 },
    comparePrice: { aed: 22000, aud: 8900 },
    costPrice: { aed: 11000, aud: 4400 },
    taxable: true,
    sku: "CJF-IJS-003",
    weightKg: 45,
    dimensionsCm: { length: 120, width: 80, height: 50 },
    countryOfOrigin: "China",
    hsCode: "9506.29",
    leadTime: "7-15 days",
    moq: 1,
    availability: { status: "in_stock", allowBackorder: true },
    schemaProductType: "Watercraft",
    ageRating: "16+",
  });

  // 5. Homepage (en-AE)
  console.log("\n--- Homepages ---");
  await createOrReplace("homepage-en-AE", "homepage", {
    title: "Homepage — English UAE",
    locale: "en-AE",
    sections: [
      {
        _key: _key(), _type: "homepageHero",
        title: "Ride the Future of Water",
        subtitle: "Discover premium electric watercraft, jet boards, and luxury marine toys engineered for the ultimate on-water experience.",
        ctaText: "Shop Now",
        ctaLink: "/en-AE/products",
        secondaryCtaText: "Explore",
        secondaryCtaLink: "#featured",
        textAlign: "left",
      },
      {
        _key: _key(), _type: "homepageFeatured",
        title: "Featured Products",
        subtitle: "Our most popular water toys, handpicked for you",
        products: [
          { _type: "reference", _ref: p1 },
          { _type: "reference", _ref: p2 },
          { _type: "reference", _ref: p3 },
        ],
        layout: "grid-3",
        backgroundColor: "dark",
      },
      {
        _key: _key(), _type: "featuredCollections",
        title: "Shop by Category",
        subtitle: "Find exactly what you need",
        collections: [
          { _key: _key(), title: "E-Surfboards", description: "Silent, electric, exhilarating", image: null, link: "/en-AE/products?category=e-surfboards" },
          { _key: _key(), title: "Jet Boards", description: "Speed meets precision", image: null, link: "/en-AE/products?category=jet-boards" },
          { _key: _key(), title: "Jet Skis", description: "Power and performance", image: null, link: "/en-AE/products?category=jet-skis" },
        ],
      },
      {
        _key: _key(), _type: "benefitsSection",
        title: "Why Choose ECOMM",
        subtitle: "The premium water toy experience",
        benefits: [
          { _key: _key(), icon: "truck", title: "Free Worldwide Shipping", description: "Free express shipping on all orders over AED 5,000", stat: "50+", statLabel: "Countries", suffix: "" },
          { _key: _key(), icon: "shield", title: "Premium Quality Guarantee", description: "Every product tested and certified for safety and performance", stat: "100%", statLabel: "Quality", suffix: "Guaranteed" },
          { _key: _key(), icon: "headphones", title: "24/7 Expert Support", description: "Real water sports enthusiasts ready to help anytime", stat: "24/7", statLabel: "Support", suffix: "" },
          { _key: _key(), icon: "rotate", title: "30-Day Returns", description: "Not satisfied? Return within 30 days for a full refund", stat: "30", statLabel: "Day", suffix: "Returns" },
        ],
      },
      {
        _key: _key(), _type: "homepageTestimonials",
        title: "What Our Customers Say",
        testimonials: [
          { _key: _key(), quote: "The best purchase I've made this year. The hydrofoil surfboard is incredible — silent, fast, and the build quality is outstanding.", authorName: "Ahmed Al Maktoum", authorTitle: "Dubai, UAE", rating: 5 },
          { _key: _key(), quote: "Ordered the carbon jet board for my son's birthday. Arrived in 5 days to Sydney, perfectly packed. He absolutely loves it!", authorName: "Sarah Chen", authorTitle: "Sydney, Australia", rating: 5 },
          { _key: _key(), quote: "Customer service is world-class. They helped me choose the right board for my experience level. Couldn't be happier.", authorName: "James Mitchell", authorTitle: "Abu Dhabi, UAE", rating: 5 },
        ],
      },
      {
        _key: _key(), _type: "videoShowcase",
        title: "See It in Action",
        subtitle: "Watch our products perform",
        videos: [
          { _key: _key(), url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnail: null, title: "Hydrofoil E-Surfboard Demo", duration: 120 },
        ],
      },
      {
        _key: _key(), _type: "faqSection",
        title: "Frequently Asked Questions",
        subtitle: "Everything you need to know",
        faqs: [
          { _key: _key(), question: "How long does shipping take?", answer: "Orders to UAE typically arrive in 3-5 business days. Australia orders take 5-8 business days. Express shipping available at checkout." },
          { _key: _key(), question: "What is your return policy?", answer: "We offer 30-day returns on all unused products. Items must be in original packaging. Contact our support team to initiate a return." },
          { _key: _key(), question: "Are your products safe?", answer: "All our products meet international safety standards and certifications. Each item includes detailed safety instructions and usage guidelines." },
          { _key: _key(), question: "Do you offer warranties?", answer: "All electric water toys come with a 2-year manufacturer warranty covering defects. Extended warranty plans are available at checkout." },
        ],
      },
      {
        _key: _key(), _type: "newsletterSection",
        title: "Stay in the Loop",
        description: lt("Get exclusive offers, new product alerts, and expert water sports tips delivered to your inbox.", "احصل على عروض حصرية وتنبيهات المنتجات الجديدة ونصائح خبراء الرياضات المائية في بريدك الوارد."),
        placeholder: "Enter your email",
        buttonText: "Subscribe",
      },
    ],
    seo: {
      metaTitle: "ECOMM — Luxury Water Toys Dubai & Australia",
      metaDescription: "Shop premium water toys, jet skis, e-surfboards, and marine accessories. Free shipping to UAE and Australia. Authorized dealer of top watercraft brands.",
    },
  });

  // Homepage ar-AE
  await createOrReplace("homepage-ar-AE", "homepage", {
    title: "الصفحة الرئيسية — العربية",
    locale: "ar-AE",
    sections: [
      {
        _key: _key(), _type: "homepageHero",
        title: "اركب مستقبل الماء",
        subtitle: "اكتشف المركبات المائية الكهربائية الفاخرة، ألواح الجت، والألعاب البحرية المصممة لأفضل تجربة على الماء.",
        ctaText: "تسوق الآن",
        ctaLink: "/ar-AE/products",
        secondaryCtaText: "استكشف",
        secondaryCtaLink: "#featured",
        textAlign: "right",
      },
      {
        _key: _key(), _type: "homepageFeatured",
        title: "منتجات مميزة",
        subtitle: "أشهر ألعابنا المائية، اخترناها لك",
        products: [
          { _type: "reference", _ref: p1 },
          { _type: "reference", _ref: p2 },
          { _type: "reference", _ref: p3 },
        ],
        layout: "grid-3",
        backgroundColor: "dark",
      },
      {
        _key: _key(), _type: "faqSection",
        title: "الأسئلة الشائعة",
        subtitle: "كل ما تحتاج معرفته",
        faqs: [
          { _key: _key(), question: "كم مدة الشحن؟", answer: "طلبات الإمارات تصل في 3-5 أيام عمل. أستراليا 5-8 أيام عمل. الشحن السريع متاح عند الدفع." },
          { _key: _key(), question: "ما هي سياسة الإرجاع؟", answer: "نوفر إرجاع خلال 30 يوماً للمنتجات غير المستخدمة. يجب أن تكون المنتجات في عبوتها الأصلية." },
        ],
      },
      {
        _key: _key(), _type: "newsletterSection",
        title: "ابق على اطلاع",
        description: lt("احصل على عروض حصرية وتنبيهات المنتجات الجديدة", "Get exclusive offers and new product alerts."),
        placeholder: "أدخل بريدك الإلكتروني",
        buttonText: "اشترك",
      },
    ],
  });

  // 6. FAQ Document
  console.log("\n--- FAQ ---");
  await createOrReplace("faq-en-AE", "faq", {
    title: "Frequently Asked Questions",
    locale: "all",
    groups: [
      {
        _key: _key(),
        title: ls("Shipping & Delivery", "الشحن والتوصيل"),
        faqs: [
          { _key: _key(), question: ls("How long does shipping take?", "كم مدة الشحن؟"), answer: { en: "Orders to UAE arrive in 3-5 business days. Australia orders take 5-8 business days. Express shipping available at checkout.", ar: "طلبات الإمارات تصل في 3-5 أيام عمل. أستراليا 5-8 أيام عمل." }, category: "shipping" },
          { _key: _key(), question: ls("Do you ship internationally?", "هل تشحن دولياً؟"), answer: { en: "Yes, we ship to UAE, Australia, and select GCC countries. Free shipping on orders over AED 5,000 / AUD 2,000.", ar: "نعم، نشحن إلى الإمارات وأستراليا ودول مجلس التعاون المختارة." }, category: "shipping" },
          { _key: _key(), question: ls("Can I track my order?", "هل يمكنني تتبع طلبي؟"), answer: { en: "Yes, tracking information is emailed once your order ships. You can also track in your account dashboard.", ar: "نعم، يتم إرسال معلومات التتبع عبر البريد الإلكتروني." }, category: "shipping" },
          { _key: _key(), question: ls("What shipping carriers do you use?", "ما شركات الشحن التي تستخدمونها؟"), answer: { en: "We partner with DHL Express, FedEx, and Aramex for reliable worldwide delivery.", ar: "نتعاون مع DHL Express وFedEx وAramex." }, category: "shipping" },
        ],
      },
      {
        _key: _key(),
        title: ls("Returns & Refunds", "الإرجاع والاسترداد"),
        faqs: [
          { _key: _key(), question: ls("What is your return policy?", "ما هي سياسة الإرجاع؟"), answer: { en: "30-day returns on unused products in original packaging. Contact support to initiate.", ar: "إرجاع خلال 30 يوماً للمنتجات غير المستخدمة في عبوتها الأصلية." }, category: "returns" },
          { _key: _key(), question: ls("How long do refunds take?", "كم مدة استرداد المبلغ؟"), answer: { en: "Refunds processed within 5-7 business days after we receive the returned item.", ar: "يتم معالجة الاسترداد في غضون 5-7 أيام عمل." }, category: "returns" },
          { _key: _key(), question: ls("Do you offer exchanges?", "هل تقدمون الاستبدال؟"), answer: { en: "Yes, we offer size/model exchanges within 30 days. Contact support for details.", ar: "نعم، نقدم استبدال الحجم/الطراز في غضون 30 يوماً." }, category: "returns" },
        ],
      },
      {
        _key: _key(),
        title: ls("Payment", "الدفع"),
        faqs: [
          { _key: _key(), question: ls("What payment methods do you accept?", "ما طرق الدفع التي تقبلونها؟"), answer: { en: "We accept Visa, Mastercard, American Express, Apple Pay, Google Pay, Tabby (UAE), Tamara (UAE), and AfterPay (Australia).", ar: "نقبل فيزا، ماستركارد، أمريكان إكسبرس، Apple Pay، Google Pay، Tabby، تمارا، وAfterPay." }, category: "payment" },
          { _key: _key(), question: ls("Can I pay in installments?", "هل يمكنني الدفع بالتقسيط؟"), answer: { en: "Yes! UAE customers can use Tabby or Tamara for 4 interest-free payments. Australian customers can use AfterPay.", ar: "نعم!可以使用Tabby或Tamara在阿联酋进行4次免息付款。" }, category: "payment" },
        ],
      },
      {
        _key: _key(),
        title: ls("Product & Safety", "المنتج والسلامة"),
        faqs: [
          { _key: _key(), question: ls("Are your products safe?", "هل منتجاتكم آمنة؟"), answer: { en: "All products meet international safety standards including CE, ISO, and ASTM certifications where applicable.", ar: "جميع المنتجات تلبي معايير السلامة الدولية." }, category: "safety" },
          { _key: _key(), question: ls("Do you offer warranties?", "هل تقدمون ضماناً؟"), answer: { en: "2-year manufacturer warranty on all electric water toys. Extended plans available at checkout.", ar: "ضمان المصنع لمدة سنتين على جميع الألعاب المائية الكهربائية." }, category: "product" },
          { _key: _key(), question: ls("What age are your products suitable for?", "ما الفئة العمرية المناسبة؟"), answer: { en: "Age ratings vary by product from 12+ to 18+. Always check product specifications and supervise children.", ar: "تختلف التصنيفات العمرية حسب المنتج من 12+ إلى 18+." }, category: "safety" },
        ],
      },
    ],
  });

  // 7. SEO Pages
  console.log("\n--- SEO Pages ---");
  await createOrReplace("page-about", "seoPage", {
    title: ls("About Us", "من نحن"),
    slug: { current: "about", _type: "slug" },
    locale: "all",
    sections: [
      {
        _key: _key(), _type: "block", style: "h2", children: [{ _key: _key(), _type: "span", text: "Our Story" }],
      },
      {
        _key: _key(), _type: "block", style: "normal", children: [{ _key: _key(), _type: "span", text: "ECOMM was born from a passion for water sports and a vision to bring the world's finest water toys to enthusiasts across the Middle East and Australia. Founded by a team of marine engineers and water sports professionals, we curate only the best products from leading manufacturers worldwide." }],
      },
      {
        _key: _key(), _type: "block", style: "h2", children: [{ _key: _key(), _type: "span", text: "Our Mission" }],
      },
      {
        _key: _key(), _type: "block", style: "normal", children: [{ _key: _key(), _type: "span", text: "To provide premium water sports enthusiasts with access to the most innovative, highest-quality water toys while delivering exceptional customer service and expert guidance every step of the way." }],
      },
    ],
    seo: {
      metaTitle: "About ECOMM — Luxury Water Toys",
      metaDescription: "Learn about ECOMM's mission to bring premium water toys to UAE and Australia. Expert team, premium products, world-class service.",
    },
  });

  await createOrReplace("page-shipping", "seoPage", {
    title: ls("Shipping Information", "معلومات الشحن"),
    slug: { current: "shipping", _type: "slug" },
    locale: "all",
    sections: [
      {
        _key: _key(), _type: "block", style: "h2", children: [{ _key: _key(), _type: "span", text: "Shipping Policy" }],
      },
      {
        _key: _key(), _type: "block", style: "normal", children: [{ _key: _key(), _type: "span", text: "We offer free express shipping on all orders over AED 5,000 (UAE) / AUD 2,000 (Australia). Standard shipping rates apply for smaller orders." }],
      },
      {
        _key: _key(), _type: "block", style: "h3", children: [{ _key: _key(), _type: "span", text: "Delivery Timeframes" }],
      },
      {
        _key: _key(), _type: "block", style: "normal", children: [{ _key: _key(), _type: "span", text: "UAE: 3-5 business days (express); 5-8 business days (standard). Australia: 5-8 business days (express); 8-12 business days (standard). International: 7-14 business days." }],
      },
      {
        _key: _key(), _type: "block", style: "h3", children: [{ _key: _key(), _type: "span", text: "Tracking" }],
      },
      {
        _key: _key(), _type: "block", style: "normal", children: [{ _key: _key(), _type: "span", text: "All orders include tracking information sent via email and available in your account dashboard." }],
      },
    ],
    seo: {
      metaTitle: "Shipping — ECOMM Luxury Water Toys",
      metaDescription: "Free express shipping on orders over AED 5,000. Fast delivery to UAE and Australia. Track your order online.",
    },
  });

  await createOrReplace("page-returns", "seoPage", {
    title: ls("Returns & Refunds", "الإرجاع والاسترداد"),
    slug: { current: "returns", _type: "slug" },
    locale: "all",
    sections: [
      { _key: _key(), _type: "block", style: "h2", children: [{ _key: _key(), _type: "span", text: "Return Policy" }] },
      { _key: _key(), _type: "block", style: "normal", children: [{ _key: _key(), _type: "span", text: "We want you to love your purchase. If you're not completely satisfied, return it within 30 days for a full refund." }] },
      { _key: _key(), _type: "block", style: "h3", children: [{ _key: _key(), _type: "span", text: "Conditions" }] },
      { _key: _key(), _type: "block", style: "normal", children: [{ _key: _key(), _type: "span", text: "Items must be unused, in original packaging, with all accessories. Contact our support team to initiate a return." }] },
      { _key: _key(), _type: "block", style: "h3", children: [{ _key: _key(), _type: "span", text: "Refund Timeline" }] },
      { _key: _key(), _type: "block", style: "normal", children: [{ _key: _key(), _type: "span", text: "Refunds are processed within 5-7 business days after receiving the returned item. The refund is credited to the original payment method." }] },
    ],
    seo: { metaTitle: "Returns & Refunds — ECOMM", metaDescription: "30-day return policy on all unused products. Easy returns process, fast refunds." },
  });

  await createOrReplace("page-warranty", "seoPage", {
    title: ls("Warranty Information", "معلومات الضمان"),
    slug: { current: "warranty", _type: "slug" },
    locale: "all",
    sections: [
      { _key: _key(), _type: "block", style: "h2", children: [{ _key: _key(), _type: "span", text: "Warranty Coverage" }] },
      { _key: _key(), _type: "block", style: "normal", children: [{ _key: _key(), _type: "span", text: "All electric water toys come with a 2-year manufacturer warranty covering defects in materials and workmanship. Batteries are covered for 1 year." }] },
      { _key: _key(), _type: "block", style: "h3", children: [{ _key: _key(), _type: "span", text: "What's Covered" }] },
      { _key: _key(), _type: "block", style: "normal", children: [{ _key: _key(), _type: "span", text: "Motor and electrical components, hull integrity (no manufacturing defects), battery (1 year), charger, and controller." }] },
      { _key: _key(), _type: "block", style: "h3", children: [{ _key: _key(), _type: "span", text: "Extended Warranty" }] },
      { _key: _key(), _type: "block", style: "normal", children: [{ _key: _key(), _type: "span", text: "Extend your coverage to 3 or 5 years at checkout. Includes priority service and free shipping on warranty claims." }] },
    ],
    seo: { metaTitle: "Warranty — ECOMM Luxury Water Toys", metaDescription: "2-year manufacturer warranty on all electric water toys. Extended coverage available up to 5 years." },
  });

  await createOrReplace("page-contact", "seoPage", {
    title: ls("Contact Us", "اتصل بنا"),
    slug: { current: "contact", _type: "slug" },
    locale: "all",
    sections: [
      { _key: _key(), _type: "block", style: "h2", children: [{ _key: _key(), _type: "span", text: "Get in Touch" }] },
      { _key: _key(), _type: "block", style: "normal", children: [{ _key: _key(), _type: "span", text: "Our team is here to help. Reach out via email, phone, or create a support ticket through your account dashboard." }] },
      { _key: _key(), _type: "block", style: "normal", children: [{ _key: _key(), _type: "span", text: "Email: hello@ecomm-store.com" }] },
      { _key: _key(), _type: "block", style: "normal", children: [{ _key: _key(), _type: "span", text: "Phone: +971 4 123 4567" }] },
      { _key: _key(), _type: "block", style: "normal", children: [{ _key: _key(), _type: "span", text: "Hours: Sunday-Thursday 9:00 AM — 6:00 PM (GST)" }] },
    ],
    seo: { metaTitle: "Contact ECOMM — Luxury Water Toys", metaDescription: "Get in touch with the ECOMM team. Email, phone, and support ticket options available." },
  });

  // 8. Blog Posts
  console.log("\n--- Blog Posts ---");
  await createDoc("blogPost", {
    title: ls("The Ultimate Guide to Electric Surfboards", "الدليل الشامل لألواح التزلج الكهربائية"),
    slug: { current: "ultimate-guide-electric-surfboards", _type: "slug" },
    author: "ECOMM Team",
    excerpt: lt("Everything you need to know before buying your first electric surfboard — from battery life to hydrofoil technology.", "كل ما تحتاج معرفته قبل شراء أول لوح تزلج كهربائي"),
    body: {
      en: [
        { _key: _key(), _type: "block", style: "h2", children: [{ _key: _key(), _type: "span", text: "Introduction" }] },
        { _key: _key(), _type: "block", style: "normal", children: [{ _key: _key(), _type: "span", text: "Electric surfboards have revolutionized water sports, offering silent, eco-friendly riding without the need for waves. Whether you're a beginner or an experienced rider, this guide covers everything you need to know." }] },
        { _key: _key(), _type: "block", style: "h2", children: [{ _key: _key(), _type: "span", text: "Battery Life" }] },
        { _key: _key(), _type: "block", style: "normal", children: [{ _key: _key(), _type: "span", text: "Modern e-surfboards offer 30-60 minutes of ride time depending on speed, rider weight, and conditions. Always factor in a 10-15% safety buffer for your return trip." }] },
        { _key: _key(), _type: "block", style: "h2", children: [{ _key: _key(), _type: "span", text: "Hydrofoil vs Traditional" }] },
        { _key: _key(), _type: "block", style: "normal", children: [{ _key: _key(), _type: "span", text: "Hydrofoil boards lift above the water for a smoother ride and less drag, while traditional e-surfboards stay on the surface for a more familiar surfing feel." }] },
      ],
    },
    categories: ["buying-guide"],
    tags: ["electric surfboard", "e-surfboard", "hydrofoil", "buying guide"],
    featured: true,
    publishedAt: new Date().toISOString(),
  });

  await createDoc("blogPost", {
    title: ls("Jet Ski Safety: Essential Tips for Beginners", "سلامة الجت سكي: نصائح أساسية للمبتدئين"),
    slug: { current: "jet-ski-safety-beginners", _type: "slug" },
    author: "ECOMM Team",
    excerpt: lt("Stay safe on the water with these essential jet ski safety tips for first-time riders.", "ابق آمناً على الماء مع نصائح السلامة الأساسية للجت سكي"),
    body: {
      en: [
        { _key: _key(), _type: "block", style: "h2", children: [{ _key: _key(), _type: "span", text: "Safety First" }] },
        { _key: _key(), _type: "block", style: "normal", children: [{ _key: _key(), _type: "span", text: "Jet skis are incredibly fun, but they require respect and proper safety precautions. Here are essential tips every beginner should follow." }] },
        { _key: _key(), _type: "block", style: "h2", children: [{ _key: _key(), _type: "span", text: "1. Always Wear a Life Jacket" }] },
        { _key: _key(), _type: "block", style: "normal", children: [{ _key: _key(), _type: "span", text: "A properly fitted life jacket is non-negotiable. Ensure it's approved by relevant maritime safety authorities." }] },
        { _key: _key(), _type: "block", style: "h2", children: [{ _key: _key(), _type: "span", text: "2. Take a Safety Course" }] },
        { _key: _key(), _type: "block", style: "normal", children: [{ _key: _key(), _type: "span", text: "Many jurisdictions require a boating safety certificate. Even where not required, a course will teach you handling, navigation, and emergency procedures." }] },
      ],
    },
    categories: ["safety"],
    tags: ["jet ski safety", "water sports safety", "beginner tips"],
    featured: false,
    publishedAt: new Date().toISOString(),
  });

  // 9. Reviews
  console.log("\n--- Reviews ---");
  await createDoc("review", {
    product: { _type: "reference", _ref: p1 },
    customerName: "Ahmed Al Maktoum",
    customerEmail: "ahmed@example.com",
    rating: 5,
    title: ls("Absolutely incredible!", "رائعة جداً!"),
    body: lt("The hydrofoil surfboard exceeded all expectations. Silent, fast, and beautifully built. Best purchase this year.", "لوح التزلج الهيدروفويل تجاوز كل التوقعات. هادئ وسريع ومبني بشكل جميل."),
    pros: ["Silent operation", "Great battery life", "Premium build quality"],
    cons: ["Takes practice to master"],
    verifiedPurchase: true,
    status: "approved",
    helpfulCount: 12,
  });

  await createDoc("review", {
    product: { _type: "reference", _ref: p2 },
    customerName: "Sarah Chen",
    customerEmail: "sarah@example.com",
    rating: 5,
    title: ls("Best jet board on the market", "أفضل جت بورد في السوق"),
    body: lt("Bought this for my son's 16th birthday. He's been riding every weekend. The app integration is fantastic.", "اشتريتها لعيد ميلاد ابني السادس عشر. يركبها كل عطلة نهاية أسبوع."),
    pros: ["Incredible speed", "App works great", "Beautiful carbon fiber finish"],
    cons: [],
    verifiedPurchase: true,
    status: "approved",
    helpfulCount: 8,
  });

  await createDoc("review", {
    product: { _type: "reference", _ref: p3 },
    customerName: "James Mitchell",
    customerEmail: "james@example.com",
    rating: 4,
    title: ls("Great portable option", "خيار محمول رائع"),
    body: lt("Takes about 15 minutes to inflate as advertised. Surprisingly sturdy once inflated. Perfect for weekends at the beach.", "تستغرق حوالي 15 دقيقة للنفخ. متينة بشكل مفاجئ بعد النفخ."),
    pros: ["Very portable", "Easy setup", "Good power"],
    cons: ["Not as fast as hard-shell jet skis", "Takes up boot space"],
    verifiedPurchase: true,
    status: "approved",
    helpfulCount: 5,
  });

  await createDoc("review", {
    product: { _type: "reference", _ref: p1 },
    customerName: "Liam O'Brien",
    customerEmail: "liam@example.com",
    rating: 5,
    title: ls("Game changer for water sports", "تغيير جذري للرياضات المائية"),
    body: lt("I've been surfing for 20 years and this is something else entirely. The silence makes it a completely different experience.", "أمارس التزلج منذ 20 سنة وهذا شيء مختلف تماماً."),
    pros: ["Revolutionary technology", "Eco-friendly", "Great customer support"],
    cons: ["Premium price point"],
    verifiedPurchase: true,
    status: "approved",
    helpfulCount: 15,
  });

  await createDoc("review", {
    product: { _type: "reference", _ref: p2 },
    customerName: "Fatima Al Mazroui",
    customerEmail: "fatima@example.com",
    rating: 5,
    title: ls("Worth every dirham", "تستحق كل درهم"),
    body: lt("Bought for my husband's birthday. He uses it every weekend at the Palm. Turns heads everywhere he goes.", "اشتريتها لعيد ميلاد زوجي. يستخدمها كل عطلة نهاية أسبوع في نخلة جميرا."),
    pros: ["Stunning design", "Fast shipping", "Excellent build"],
    cons: [],
    verifiedPurchase: true,
    status: "approved",
    helpfulCount: 10,
  });

  console.log("\n=== Seed complete! ===");
  const summary = await fetch(
    `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=count(*)`,
    { headers: { Authorization: `Bearer ${TOKEN}` } }
  ).then(r => r.json());
  console.log(`Total documents: ${summary.result}`);
}

main().catch(e => {
  console.error("\nFATAL:", e.message);
  process.exit(1);
});
