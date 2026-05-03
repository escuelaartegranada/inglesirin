export const FOODS = [
  { id: 'tomatoes', word: 'tomatoes', emoji: '🍅', initial: 't', color: 'red' },
  { id: 'fish', word: 'fish', emoji: '🐟', initial: 'f', color: 'blue' },
  { id: 'ice cream', word: 'ice cream', emoji: '🍨', initial: 'i', color: 'pink' },
  { id: 'pizza', word: 'pizza', emoji: '🍕', initial: 'p', color: 'orange' },
  { id: 'chicken', word: 'chicken', emoji: '🍗', initial: 'c', color: 'orange' },
  { id: 'bread', word: 'bread', emoji: '🍞', initial: 'b', color: 'yellow' },
  { id: 'cheese', word: 'cheese', emoji: '🧀', initial: 'c', color: 'yellow' },
  { id: 'oranges', word: 'oranges', emoji: '🍊', initial: 'o', color: 'orange' },
  { id: 'olives', word: 'olives', emoji: '🫒', initial: 'o', color: 'green' },
  { id: 'biscuits', word: 'biscuits', emoji: '🍪', initial: 'b', color: 'yellow' },
  { id: 'beans', word: 'beans', emoji: '🫘', initial: 'b', color: 'green' },
  { id: 'carrots', word: 'carrots', emoji: '🥕', initial: 'c', color: 'orange' },
  { id: 'bananas', word: 'bananas', emoji: '🍌', initial: 'b', color: 'yellow' },
  { id: 'coconut', word: 'coconut', emoji: '🥥', initial: 'c', color: 'brown' },
  { id: 'strawberries', word: 'strawberries', emoji: '🍓', initial: 's', color: 'red' },
  { id: 'melon', word: 'melon', emoji: '🍈', initial: 'm', color: 'green' },
];

export const getRandomFoods = (count: number) => {
  const shuffled = [...FOODS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getRandomFood = () => {
  return FOODS[Math.floor(Math.random() * FOODS.length)];
};
