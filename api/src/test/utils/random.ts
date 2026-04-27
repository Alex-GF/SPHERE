/**
 * Generates a biased random integer within a specified range [min, max].
 * Smaller numbers within the range have a higher probability of being selected.
 * 
 * The bias is achieved by assigning weights to each number in the range,
 * where smaller numbers have higher weights. The weights are inversely
 * proportional to the position of the number in the range.
 * 
 * For example, if the range is [1, 5], the weights will be:
 * - 1: 1/1
 * - 2: 1/2
 * - 3: 1/3
 * - 4: 1/4
 * - 5: 1/5
 * 
 * The function uses these weights to determine the probability of selecting
 * each number.
 * 
 * @param min - The minimum value of the range (inclusive).
 * @param max - The maximum value of the range (inclusive).
 * @returns A biased random integer within the range [min, max].
 */
function biasedRandomInt(min: number, max: number): number {
  const range = max - min + 1;

  // Create a weight array where smaller numbers have higher weights.
  // For example, if range = 5, weights = [1/1, 1/2, 1/3, 1/4, 1/5]
  const weights = Array.from({ length: range }, (_, i) => 1 / (i + 1));

  // Sum all weights to get the total probability mass
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  // Generate a random number between 0 and totalWeight
  const rand = Math.random() * totalWeight;

  // Iterate through the weights to find where the random number falls
  // This simulates picking an index based on weighted probability
  let sum = 0;
  for (let i = 0; i < range; i++) {
    sum += weights[i];
    if (rand <= sum) {
      return min + i; // Return the biased random integer
    }
  }

  // Fallback in case of rounding errors (should rarely happen)
  return max;
}

/**
 * Selects `n` elements from the input array with a bias: 
 * the probability of selecting element i is proportional to 1 / (i + 1).
 *
 * @param array - The input array
 * @param count - Number of elements to select
 * @returns An array of selected elements
 */
function biasedSample<T>(array: T[], count: number): T[] {
  const result: T[] = [];
  const usedIndices = new Set<number>();

  const range = array.length;

  // Create weights: weight[i] = 1 / (i + 1)
  const weights = Array.from({ length: range }, (_, i) => 1 / (i + 1));
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  while (result.length < count && usedIndices.size < array.length) {
    const rand = Math.random() * totalWeight;

    let sum = 0;
    for (let i = 0; i < range; i++) {
      if (usedIndices.has(i)) continue; // Skip already selected elements

      sum += weights[i];
      if (rand <= sum) {
        result.push(array[i]);
        usedIndices.add(i);
        break;
      }
    }
  }

  return result;
}

export { biasedRandomInt, biasedSample };