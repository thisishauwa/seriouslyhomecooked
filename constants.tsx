
import { MealKit, Producer, JournalEntry } from './types';

export const PRODUCERS: Producer[] = [
  {
    id: 'p1',
    name: 'Wiltshire Farms',
    location: 'Wiltshire, UK',
    specialty: 'Line-caught Fish & Organic Greens',
    story: 'Founded in 1924, the Wiltshire family has pioneered sustainable aquaculture. Every seabass is caught using traditional lines to ensure minimal impact on the local ecosystem and maximum freshness for your table.',
    imageUrl: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'p2',
    name: 'Blackwood Estate',
    location: 'Scottish Highlands',
    specialty: 'Heritage Grass-Fed Beef',
    story: 'Blackwood Estate is home to one of the last remaining pure-bred heritage herds in the Highlands. Their slow-growth philosophy and mineral-rich pastures produce beef with unparalleled depth of flavor.',
    imageUrl: 'https://images.unsplash.com/photo-1512485800193-b2db55f52983?auto=format&fit=crop&w=600&q=80'
  }
];

export const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'j1',
    title: 'The Art of the Slow Roast',
    excerpt: 'Why patience is the most important ingredient in your kitchen this autumn.',
    category: 'Technique',
    date: 'Oct 12, 2024',
    imageUrl: 'https://images.unsplash.com/photo-1544333303-5670256da877?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'j2',
    title: 'Autumn Harvest Guide',
    excerpt: 'Selecting the perfect root vegetables for your Sunday gatherings.',
    category: 'Seasonal',
    date: 'Oct 05, 2024',
    imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'j3',
    title: 'The Science of Searing',
    excerpt: 'Mastering the Maillard reaction for restaurant-quality crusts at home.',
    category: 'Science',
    date: 'Sep 28, 2024',
    imageUrl: 'https://images.unsplash.com/photo-1551133988-ad26c02243e2?auto=format&fit=crop&w=600&q=80'
  }
];

export const MOCK_HISTORY = [
  { id: 'h1', date: 'Sept 14, 2024', meals: ['Pan-Roasted Seabass', 'Wild Mushroom Risotto'], status: 'Delivered' },
  { id: 'h2', date: 'Sept 21, 2024', meals: ['Heritage Duck Confit', 'Cornish Crab Linguine'], status: 'Delivered' }
];

export const MENU_ITEMS: MealKit[] = [
  {
    id: '1',
    title: 'Pan-Roasted Seabass',
    description: 'A sophisticated coastal classic. This modern twist on pan-roasted seabass combines crispy skin with a vibrant lemon-butter caper sauce.',
    prepTime: '25 mins',
    servings: 2,
    calories: 420,
    price: 18.50,
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    category: 'Modern British',
    skillLevel: 'Medium',
    nutrition: { carbs: '5g', protein: '34g', fats: '22g' },
    ingredients: [
      { name: 'Seabass Fillets', amount: '2 fillets' },
      { name: 'Capers', amount: '2 Tbsp' },
      { name: 'Unsalted Butter', amount: '50g' }
    ],
    steps: [
      { title: 'Score the skin', description: 'Lightly score the skin to prevent curling.' },
      { title: 'Sear', description: 'Fry skin-side down until golden and crispy.' }
    ]
  },
  {
    id: '2',
    title: 'Wild Mushroom Risotto',
    description: 'Earthy, comforting Italian masterpiece. Arborio rice infused with deep umami of wild mushrooms and finished with truffle oil.',
    prepTime: '35 mins',
    servings: 2,
    calories: 580,
    price: 16.00,
    imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=800&q=80',
    category: 'Mediterranean',
    skillLevel: 'Medium',
    ingredients: [{ name: 'Arborio Rice', amount: '200g' }, { name: 'Porcini', amount: '50g' }]
  },
  {
    id: '3',
    title: 'Highland Venison Loin',
    description: 'Lean, ruby-red venison paired with a blackberry reduction and buttery parsnip purée. The ultimate forest-to-table ritual.',
    prepTime: '40 mins',
    servings: 2,
    calories: 490,
    price: 24.50,
    imageUrl: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80',
    category: 'Modern British',
    skillLevel: 'Advanced',
    ingredients: [{ name: 'Venison Loin', amount: '300g' }, { name: 'Blackberries', amount: '100g' }]
  },
  {
    id: '4',
    title: 'Miso Glazed Aubergine',
    description: 'Rich, sweet, and salty miso glaze perfectly complements creamy charred aubergine. Inspired by Kyoto street food.',
    prepTime: '20 mins',
    servings: 2,
    calories: 390,
    price: 14.50,
    imageUrl: 'https://images.unsplash.com/photo-1563245332-692749827433?auto=format&fit=crop&w=800&q=80',
    category: 'Asian Fusion',
    skillLevel: 'Easy',
    ingredients: [{ name: 'Aubergine', amount: '1 large' }]
  },
  {
    id: '5',
    title: 'Cornish Crab Linguine',
    description: 'Freshly picked white crab meat tossed with chili, parsley, and hand-pressed lemon oil. Light yet luxurious.',
    prepTime: '15 mins',
    servings: 2,
    calories: 510,
    price: 19.50,
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
    category: 'Mediterranean',
    skillLevel: 'Easy',
    ingredients: [{ name: 'Crab Meat', amount: '150g' }, { name: 'Linguine', amount: '200g' }]
  },
  {
    id: '6',
    title: 'Heritage Duck Confit',
    description: 'Slow-cooked duck leg with crispy skin, served alongside braised red cabbage and a rich port reduction.',
    prepTime: '30 mins',
    servings: 2,
    calories: 720,
    price: 21.00,
    imageUrl: 'https://images.unsplash.com/photo-1514516317522-f73b604cef7a?auto=format&fit=crop&w=800&q=80',
    category: 'Classic Comfort',
    skillLevel: 'Medium',
    ingredients: [{ name: 'Duck Leg', amount: '2 legs' }, { name: 'Port', amount: '50ml' }]
  }
];
