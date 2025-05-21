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
  BUCKET: "bucket", // For visualizing buckets in radix sort
  BUCKET_ASSIGN: "bucket_assign", // When assigning an element to a bucket
  BUCKET_COLLECT: "bucket_collect", // When collecting an element from a bucket
  BUCKET_HIGHLIGHT: "bucket_highlight", // When highlighting a bucket
  BUCKETS_POPULATED: "buckets_populated", // When all buckets are populated
  RADIX_PHASE: "radix_phase", // Starting a new digit place in radix sort
  RADIX_START: "radix_start", // Starting the radix sort algorithm
  RADIX_STEP_COMPLETE: "radix_step_complete", // When a digit place sort is complete
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
  animations.push({
    type: ANIMATION_TYPES.COMPARE,
    indices: [],
    message: "Phase 1: Building the max heap"
  });

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arrayCopy, n, i, animations);
  }

  animations.push({
    type: ANIMATION_TYPES.COMPARE,
    indices: [],
    message: "Phase 2: Extracting elements from heap in order"
  });

  // Extract elements from heap one by one
  for (let i = n - 1; i > 0; i--) {
    // Move current root to end
    animations.push({
      type: ANIMATION_TYPES.SWAP,
      indices: [0, i],
      values: [arrayCopy[i], arrayCopy[0]],
      message: `Moving root node (largest element: ${arrayCopy[0]}) to position ${i}`
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
      message: `Comparing node ${i} (value: ${array[i]}) with left child node ${left} (value: ${array[left]})`
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
      message: `Comparing ${largest === i ? `node ${i}` : `left child node ${left}`} (value: ${array[largest]}) with right child node ${right} (value: ${array[right]})`
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
      message: `Swapping node ${i} (value: ${array[i]}) with ${largest === left ? 'left' : 'right'} child node ${largest} (value: ${array[largest]})`
    });

    [array[i], array[largest]] = [array[largest], array[i]];

    // Recursively heapify the affected sub-tree
    heapify(array, n, largest, animations);
  }
}

// Radix Sort
export const radixSort = (array) => {
  const animations = [];
  const arrayCopy = [...array];
  const n = arrayCopy.length;
  
  // Find the maximum number to determine the number of digits
  let max = Math.max(...arrayCopy);
  
  // Start a new phase for this digit place
  animations.push({
    type: ANIMATION_TYPES.RADIX_START,
    message: "Starting Radix Sort",
  });
  
  // Do counting sort for every digit
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    // Start a new phase for this digit place
    animations.push({
      type: ANIMATION_TYPES.RADIX_PHASE,
      exp: exp,
      message: `Sorting by ${exp === 1 ? "ones" : exp === 10 ? "tens" : exp === 100 ? "hundreds" : "thousands"} place`,
    });
    
    countingSortByDigit(arrayCopy, n, exp, animations);
  }
  
  // Ensure all elements are marked as sorted at the end
  return markAllAsSorted(animations, n);
};

function countingSortByDigit(array, n, exp, animations) {
  const output = new Array(n).fill(0);
  const count = new Array(10).fill(0);
  const buckets = Array.from({ length: 10 }, () => []);
  
  // First pass: Place each element in its corresponding bucket
  for (let i = 0; i < n; i++) {
    const digit = Math.floor(array[i] / exp) % 10;
    
    // Animate: Highlight the element being examined
    animations.push({
      type: ANIMATION_TYPES.COMPARE,
      indices: [i],
      message: `Examining element ${array[i]} with digit ${digit} at position ${exp}`,
    });
    
    // Animate: Move the element to its bucket
    animations.push({
      type: ANIMATION_TYPES.BUCKET_ASSIGN,
      value: array[i],
      fromIndex: i,
      digit: digit,
      exp: exp,
      message: `Moving ${array[i]} to bucket ${digit}`,
    });
    
    // Add to bucket
    buckets[digit].push(array[i]);
    count[digit]++;
  }
  
  // Show all buckets populated
  animations.push({
    type: ANIMATION_TYPES.BUCKETS_POPULATED,
    buckets: [...buckets],
    exp: exp,
    message: "All elements placed in buckets",
  });
  
  // Second pass: Collect elements from buckets in order
  let arrayIndex = 0;
  
  for (let digit = 0; digit < 10; digit++) {
    // Animate: Highlight the current bucket being processed
    if (buckets[digit].length > 0) {
      animations.push({
        type: ANIMATION_TYPES.BUCKET_HIGHLIGHT,
        digit: digit,
        message: `Collecting elements from bucket ${digit}`,
      });
      
      // Collect elements from this bucket
      for (const value of buckets[digit]) {
        // Animate: Moving element from bucket back to array
        animations.push({
          type: ANIMATION_TYPES.BUCKET_COLLECT,
          value: value,
          toIndex: arrayIndex,
          digit: digit,
          message: `Placing ${value} back at position ${arrayIndex}`,
        });
        
        // Update output array
        output[arrayIndex] = value;
        arrayIndex++;
      }
    }
  }
  
  // Copy the output array to the original array
  for (let i = 0; i < n; i++) {
    if (array[i] !== output[i]) {
      // Overwrite values in the original array
      animations.push({
        type: ANIMATION_TYPES.OVERWRITE,
        index: i,
        value: output[i],
        message: `Final placement: ${output[i]} at position ${i}`,
      });
      
      array[i] = output[i];
    }
  }
  
  // Show the array after this digit place is processed
  animations.push({
    type: ANIMATION_TYPES.RADIX_STEP_COMPLETE,
    array: [...array],
    exp: exp,
    message: `Completed sorting by ${exp === 1 ? "ones" : exp === 10 ? "tens" : exp === 100 ? "hundreds" : "thousands"} place`,
  });
}
