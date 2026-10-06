// src/app/data/product.js

export const categories = [
  {
    id: "cotton",
    label: "Cotton Fabrics",
    subcategories: [
      { id: "cotton", label: "Cotton" },
      { id: "linen", label: "Linen" },
      { id: "rayon", label: "Rayon" },
      { id: "mulmul", label: "Mulmul" },
      { id: "silk", label: "Silk" },
      { id: "cambric", label: "Cambric" },
      { id: "voile", label: "Voile" },
    ],
  },

  {
    id: "silk",
    label: "Silk Fabrics",
    subcategories: [
      { id: "silk", label: "Silk" },
      { id: "rayon", label: "Rayon" },
    ],
  },

  {
    id: "printed",
    label: "Printed Fabrics",
    subcategories: [
      { id: "block-print", label: "Block Print" },
      { id: "printed", label: "Printed" },
      { id: "ajrakh", label: "Ajrakh" },
    ],
  },

  {
    id: "embroidered",
    label: "Embroidered Fabrics",
    subcategories: [
      { id: "embroidered", label: "Embroidered" },
      { id: "chikankari", label: "Chikankari" },
    ],
  },
];

export const filterTypes = [
  {
    id: "all",
    label: "All",
  },
  {
    id: "block-print",
    label: "Block Print",
  },
  {
    id: "plain",
    label: "Plain",
  },
  {
    id: "embroidered",
    label: "Embroidered",
  },
  {
    id: "printed",
    label: "Printed",
  },
  {
    id: "dyes",
    label: "Dyes",
  },
];

export const products = [
  {
    id: 1,
    slug: "premium-cotton-cambric",
    name: "Premium Cotton Cambric",
    sku: "BF-CC-001",
    category: "cotton",
    type: "plain",
    price: 180,
    priceUnit: "Per Meter",
    badge: "New Arrival",
    gsm: "90 - 120 GSM",
    width: '44" / 58"',
    composition: "100% Cotton",
    moq: 500,

    colors: [
      "#EDE6DA",
      "#295C65",
      "#B08B5A",
      "#C9752E",
      "#1A1A1A",
    ],

    images: [
      "/images/home/products/1.png",
      "/images/home/products/1.png",
    ],

    description:
      "A soft, breathable and versatile cotton cambric fabric, perfect for apparel and everyday wear.",

    longDescription:
      "Our Premium Cotton Cambric is a lightweight, breathable and durable fabric, widely used for shirts, dresses, kurtas and premium apparel collections.",

    care:
      "Machine wash cold with like colors. Do not bleach. Tumble dry low. Iron on medium heat if needed.",

    shipping:
      "Ships within 3-5 business days. Worldwide shipping available.",
  },

  {
    id: 2,
    slug: "ajrakh-block-print",
    name: "Ajrakh Block Print",
    sku: "BF-AB-002",
    category: "printed",
    type: "block-print",
    price: 320,
    priceUnit: "Per Meter",
    badge: "Bestseller",
    gsm: "130 - 160 GSM",
    width: '44"',
    composition: "100% Cotton",
    moq: 300,

    colors: [
      "#2B3A67",
      "#5A3A29",
      "#B08B5A",
      "#EDE6DA",
      "#295C65",
    ],

    images: [
      "/images/home/products/2.png",
      "/images/home/products/2.png",
    ],

    description:
      "Traditional hand block printed cotton fabric featuring intricate Ajrakh patterns and rich craftsmanship.",

    longDescription:
      "This Ajrakh Block Print fabric is handcrafted using traditional dyeing and printing techniques passed through generations.",

    care:
      "Hand wash separately in cold water. Dry in shade to preserve print vibrancy.",

    shipping:
      "Ships within 5-7 business days. Worldwide shipping available.",
  },

  {
    id: 3,
    slug: "cotton-flex",
    name: "Cotton Flex",
    sku: "BF-CF-003",
    category: "cotton",
    type: "plain",
    price: 165,
    priceUnit: "Per Meter",
    badge: "",
    gsm: "90 - 110 GSM",
    width: '44"',
    composition: "95% Cotton, 5% Lycra",
    moq: 500,

    colors: [
      "#EDE6DA",
      "#295C65",
      "#B08B5A",
      "#C9752E",
      "#1A1A1A",
    ],

    images: [
      "/images/home/products/3.png",
      "/images/home/products/3.png",
    ],

    description:
      "A stretchable cotton flex fabric offering comfort with a hint of elasticity.",

    longDescription:
      "Cotton Flex combines the natural breathability of cotton with a small amount of stretch for comfortable fitted apparel.",

    care:
      "Machine wash cold. Do not wring. Line dry away from direct heat.",

    shipping:
      "Ships within 3-5 business days. Worldwide shipping available.",
  },

  {
    id: 4,
    slug: "rayon-slub",
    name: "Rayon Slub",
    sku: "BF-RS-004",
    category: "silk",
    type: "plain",
    price: 210,
    priceUnit: "Per Meter",
    badge: "",
    gsm: "120 GSM",
    width: '58"',
    composition: "100% Rayon",
    moq: 400,

    colors: [
      "#EDE6DA",
      "#295C65",
      "#B08B5A",
      "#C9752E",
    ],

    images: [
      "/images/home/products/4.png",
      "/images/home/products/4.png",
    ],

    description:
      "A textured slub rayon fabric with a natural irregular weave that adds character to every yard.",

    longDescription:
      "Rayon Slub offers a fluid drape with a subtly textured surface created by its slub yarn construction.",

    care:
      "Dry clean recommended. If hand washing, use cold water and mild detergent.",

    shipping:
      "Ships within 3-5 business days. Worldwide shipping available.",
  },

  {
    id: 5,
    slug: "voile-cotton",
    name: "Voile Cotton",
    sku: "BF-VC-005",
    category: "printed",
    type: "printed",
    price: 175,
    priceUnit: "Per Meter",
    badge: "",
    gsm: "80 GSM",
    width: '44"',
    composition: "100% Cotton",
    moq: 500,

    colors: [
      "#EDE6DA",
      "#295C65",
      "#B08B5A",
      "#C9752E",
      "#1A1A1A",
    ],

    images: [
      "/images/home/products/5.png",
      "/images/home/products/5.png",
    ],

    description:
      "An ultra-lightweight printed cotton voile, sheer and airy, perfect for summer wear.",

    longDescription:
      "Cotton Voile is prized for its fine, sheer weave and breathable construction, making it ideal for warm-weather collections.",

    care:
      "Hand wash gently in cold water. Avoid wringing. Dry in shade.",

    shipping:
      "Ships within 3-5 business days. Worldwide shipping available.",
  },

  {
    id: 6,
    slug: "chikankari-embroidered-cotton",
    name: "Chikankari Embroidered Cotton",
    sku: "BF-CE-006",
    category: "embroidered",
    type: "embroidered",
    price: 450,
    priceUnit: "Per Meter",
    badge: "New Arrival",
    gsm: "150 - 200 GSM",
    width: '58"',
    composition: "100% Cotton",
    moq: 200,

    colors: [
      "#EDE6DA",
      "#295C65",
      "#B08B5A",
      "#1A1A1A",
    ],

    images: [
      "/images/home/products/1.png",
      "/images/home/products/1.png",
    ],

    description:
      "Fine hand-embroidered Chikankari work on a soft cotton base.",

    longDescription:
      "This Chikankari Embroidered Cotton features delicate hand-stitched needlework on breathable cotton.",

    care:
      "Dry clean recommended to protect embroidery.",

    shipping:
      "Ships within 6-8 business days. Worldwide shipping available.",
  },
];