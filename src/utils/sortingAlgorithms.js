// This file contains implementations of sorting algorithms that return
// animation steps that will be used by the visualizer component

// Helper function to generate random number between min and max (inclusive)
export const randomIntFromInterval = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Helper function to generate a random array
export const generateRandomArray = (length, min, max) => {
  return Array.from({ length }, () => randomIntFromInterval(min, max));
};

// Animation step types
export const ANIMATION_TYPES = {
  COMPARE: "compare", // When comparing two elements
  SWAP: "swap", // When swapping two elements
  OVERWRITE: "overwrite", // When overwriting a value
  SORTED: "sorted", // When an element is in its sorted position
  PIVOT: "pivot", // For marking pivot elements in quick sort
  MERGE_SPLIT: "merge_split", // For visualizing merge sort splits and joins
};

// Helper function to mark all elements as sorted
const markAllAsSorted = (animations, arrayLength) => {
  animations.push({
    type: ANIMATION_TYPES.SORTED,
    indices: Array.from({ length: arrayLength }, (_, i) => i),
  });
  return animations;
};

// Bubble Sort
export const bubbleSort = (array) => {
  const animations = [];
  const arrayCopy = [...array];
  const n = arrayCopy.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Compare j and j+1
      animations.push({
        type: ANIMATION_TYPES.COMPARE,
        indices: [j, j + 1],
      });

      if (arrayCopy[j] > arrayCopy[j + 1]) {
        // Swap elements
        animations.push({
          type: ANIMATION_TYPES.SWAP,
          indices: [j, j + 1],
          values: [arrayCopy[j + 1], arrayCopy[j]],
        });

        // Perform the actual swap in our copy
        [arrayCopy[j], arrayCopy[j + 1]] = [arrayCopy[j + 1], arrayCopy[j]];
      }
    }

    // Mark the last element as sorted
    animations.push({
      type: ANIMATION_TYPES.SORTED,
      indices: [n - i - 1],
    });
  }

  // Mark the first element as sorted (this is always the smallest)
  animations.push({
    type: ANIMATION_TYPES.SORTED,
    indices: [0],
  });

  // Ensure all elements are marked as sorted at the end
  return markAllAsSorted(animations, n);
};

// Merge Sort
export const mergeSort = (array) => {
  const animations = [];
  const auxiliaryArray = [...array];
  const mainArray = [...array];

  mergeSortHelper(
    mainArray,
    0,
    mainArray.length - 1,
    auxiliaryArray,
    animations
  );

  // Ensure all elements are marked as sorted at the end
  return markAllAsSorted(animations, array.length);
};

function mergeSortHelper(
  mainArray,
  startIdx,
  endIdx,
  auxiliaryArray,
  animations
) {
  if (startIdx === endIdx) return;

  const middleIdx = Math.floor((startIdx + endIdx) / 2);

  // Visualize the splitting of the array
  const splitIndices = [];
  for (let i = startIdx; i <= endIdx; i++) {
    splitIndices.push(i);
  }

  // Add split visualization with isSplit flag
  animations.push({
    type: ANIMATION_TYPES.MERGE_SPLIT,
    indices: splitIndices,
    isSplit: true, // Flag indicating this is a split operation
  });

  // Sort left half
  mergeSortHelper(auxiliaryArray, startIdx, middleIdx, mainArray, animations);
  // Sort right half
  mergeSortHelper(auxiliaryArray, middleIdx + 1, endIdx, mainArray, animations);

  // Merge the sorted halves
  doMerge(mainArray, startIdx, middleIdx, endIdx, auxiliaryArray, animations);

  // Visualize joining of the merged subarrays
  const joinIndices = [];
  for (let i = startIdx; i <= endIdx; i++) {
    joinIndices.push(i);
  }

  // Add join visualization with isSplit flag set to false
  animations.push({
    type: ANIMATION_TYPES.MERGE_SPLIT,
    indices: joinIndices,
    isSplit: false, // Flag indicating this is a join operation
  });
}

function doMerge(
  mainArray,
  startIdx,
  middleIdx,
  endIdx,
  auxiliaryArray,
  animations
) {
  let k = startIdx;
  let i = startIdx;
  let j = middleIdx + 1;

  while (i <= middleIdx && j <= endIdx) {
    // Compare values from both sides
    animations.push({
      type: ANIMATION_TYPES.COMPARE,
      indices: [i, j],
    });

    if (auxiliaryArray[i] <= auxiliaryArray[j]) {
      // Overwrite value at position k with value at position i
      animations.push({
        type: ANIMATION_TYPES.OVERWRITE,
        index: k,
        value: auxiliaryArray[i],
        overwriteIndex: i,
      });
      mainArray[k++] = auxiliaryArray[i++];
    } else {
      // Overwrite value at position k with value at position j
      animations.push({
        type: ANIMATION_TYPES.OVERWRITE,
        index: k,
        value: auxiliaryArray[j],
        overwriteIndex: j,
      });
      mainArray[k++] = auxiliaryArray[j++];
    }
  }

  // Copy remaining elements from left side
  while (i <= middleIdx) {
    animations.push({
      type: ANIMATION_TYPES.OVERWRITE,
      index: k,
      value: auxiliaryArray[i],
      overwriteIndex: i,
    });
    mainArray[k++] = auxiliaryArray[i++];
  }

  // Copy remaining elements from right side
  while (j <= endIdx) {
    animations.push({
      type: ANIMATION_TYPES.OVERWRITE,
      index: k,
      value: auxiliaryArray[j],
      overwriteIndex: j,
    });
    mainArray[k++] = auxiliaryArray[j++];
  }

  // Mark individual elements as sorted if this is the final merge
  // (We'll mark all at the end with our helper function instead)
}

// Quick Sort
export const quickSort = (array) => {
  const animations = [];
  const arrayCopy = [...array];

  quickSortHelper(arrayCopy, 0, arrayCopy.length - 1, animations);

  // Ensure all elements are marked as sorted at the end
  return markAllAsSorted(animations, array.length);
};

function quickSortHelper(array, low, high, animations) {
  if (low < high) {
    const partitionIndex = partition(array, low, high, animations);

    // Mark pivot as sorted
    animations.push({
      type: ANIMATION_TYPES.SORTED,
      indices: [partitionIndex],
    });

    // Sort elements before and after partition
    quickSortHelper(array, low, partitionIndex - 1, animations);
    quickSortHelper(array, partitionIndex + 1, high, animations);
  } else if (low === high) {
    // Single elements are sorted
    animations.push({
      type: ANIMATION_TYPES.SORTED,
      indices: [low],
    });
  }
}

function partition(array, low, high, animations) {
  // Use first element as pivot (instead of last)
  const pivot = array[low];

  // Mark pivot
  animations.push({
    type: ANIMATION_TYPES.PIVOT,
    index: low,
  });

  let i = high + 1;

  // Scan from right to left
  for (let j = high; j > low; j--) {
    // Compare current element with pivot
    animations.push({
      type: ANIMATION_TYPES.COMPARE,
      indices: [j, low],
    });

    if (array[j] >= pivot) {
      i--;

      // Swap elements
      animations.push({
        type: ANIMATION_TYPES.SWAP,
        indices: [i, j],
        values: [array[j], array[i]],
      });

      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Swap the pivot element to its final position
  i--;
  animations.push({
    type: ANIMATION_TYPES.SWAP,
    indices: [low, i],
    values: [array[i], array[low]],
  });

  [array[low], array[i]] = [array[i], array[low]];

  return i;
}

// Heap Sort
export const heapSort = (array) => {
  const animations = [];
  const arrayCopy = [...array];
  const n = arrayCopy.length;

  // Build heap (rearrange array)
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arrayCopy, n, i, animations);
  }

  // Extract elements from heap one by one
  for (let i = n - 1; i > 0; i--) {
    // Move current root to end
    animations.push({
      type: ANIMATION_TYPES.SWAP,
      indices: [0, i],
      values: [arrayCopy[i], arrayCopy[0]],
    });

    [arrayCopy[0], arrayCopy[i]] = [arrayCopy[i], arrayCopy[0]];

    // Mark the element as sorted
    animations.push({
      type: ANIMATION_TYPES.SORTED,
      indices: [i],
    });

    // Call heapify on the reduced heap
    heapify(arrayCopy, i, 0, animations);
  }

  // Mark the first element as sorted too
  animations.push({
    type: ANIMATION_TYPES.SORTED,
    indices: [0],
  });

  // Ensure all elements are marked as sorted at the end
  return markAllAsSorted(animations, array.length);
};

function heapify(array, n, i, animations) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  // Compare with left child
  if (left < n) {
    animations.push({
      type: ANIMATION_TYPES.COMPARE,
      indices: [largest, left],
    });

    if (array[left] > array[largest]) {
      largest = left;
    }
  }

  // Compare with right child
  if (right < n) {
    animations.push({
      type: ANIMATION_TYPES.COMPARE,
      indices: [largest, right],
    });

    if (array[right] > array[largest]) {
      largest = right;
    }
  }

  // If largest is not root
  if (largest !== i) {
    animations.push({
      type: ANIMATION_TYPES.SWAP,
      indices: [i, largest],
      values: [array[largest], array[i]],
    });

    [array[i], array[largest]] = [array[largest], array[i]];

    // Recursively heapify the affected sub-tree
    heapify(array, n, largest, animations);
  }
}
