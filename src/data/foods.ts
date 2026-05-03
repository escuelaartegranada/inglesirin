export const FOODS = [
  { id: 'tomatoes', word: 'tomatoes', translation: 'tomates', emoji: '🍅', initial: 't', color: 'red' },
  { id: 'fish', word: 'fish', translation: 'pescado', emoji: '🐟', initial: 'f', color: 'blue' },
  { id: 'ice cream', word: 'ice cream', translation: 'helado', emoji: '🍨', initial: 'i', color: 'pink' },
  { id: 'pizza', word: 'pizza', translation: 'pizza', emoji: '🍕', initial: 'p', color: 'orange' },
  { id: 'chicken', word: 'chicken', translation: 'pollo', emoji: '🍗', initial: 'c', color: 'orange' },
  { id: 'bread', word: 'bread', translation: 'pan', emoji: '🍞', initial: 'b', color: 'yellow' },
  { id: 'cheese', word: 'cheese', translation: 'queso', emoji: '🧀', initial: 'c', color: 'yellow' },
  { id: 'oranges', word: 'oranges', translation: 'naranjas', emoji: '🍊', initial: 'o', color: 'orange' },
  { id: 'bananas', word: 'bananas', translation: 'plátanos', emoji: '🍌', initial: 'b', color: 'yellow' },
  { id: 'coconut', word: 'coconut', translation: 'coco', emoji: '🥥', initial: 'c', color: 'brown' },
  { id: 'strawberries', word: 'strawberries', translation: 'fresas', emoji: '🍓', initial: 's', color: 'red' },
  { id: 'melon', word: 'melon', translation: 'melón', emoji: '🍈', initial: 'm', color: 'green' },
];

export const getRandomFoods = (count: number) => {
  const shuffled = [...FOODS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getRandomFood = () => {
  return FOODS[Math.floor(Math.random() * FOODS.length)];
};
