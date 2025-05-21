import { useState } from 'react';

const AlgorithmCode = ({ algorithm }) => {
  const [showCode, setShowCode] = useState(false);
    const getAlgorithmCode = () => {
    switch (algorithm) {
      case 'bubble':
        return `function bubbleSort(arr) {
  const n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap elements
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  
  return arr;
}`;
      case 'merge':
        return `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  
  return [...result, ...left.slice(i), ...right.slice(j)];
}`;
      case 'quick':
        return `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pivotIndex = partition(arr, low, high);
    
    quickSort(arr, low, pivotIndex - 1);
    quickSort(arr, pivotIndex + 1, high);
  }
  
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`;
      case 'heap':
        return `function heapSort(arr) {
  const n = arr.length;
  
  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }
  
  // Extract elements one by one
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
  }
  
  return arr;
}

function heapify(arr, n, i) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;
  
  if (left < n && arr[left] > arr[largest]) {
    largest = left;
  }
  
  if (right < n && arr[right] > arr[largest]) {
    largest = right;
  }
  
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}`;
      case 'radix':
        return `function radixSort(arr) {
  // Find the maximum number to know number of digits
  const max = Math.max(...arr);
  
  // Do counting sort for every digit
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    countingSortByDigit(arr, exp);
  }
  
  return arr;
}

function countingSortByDigit(arr, exp) {
  const n = arr.length;
  const output = new Array(n).fill(0);
  const count = new Array(10).fill(0);
  
  // Store count of occurrences in count[]
  for (let i = 0; i < n; i++) {
    const digit = Math.floor(arr[i] / exp) % 10;
    count[digit]++;
  }
  
  // Change count[i] so that count[i] now contains
  // actual position of this digit in output[]
  for (let i = 1; i < 10; i++) {
    count[i] += count[i - 1];
  }
  
  // Build the output array
  for (let i = n - 1; i >= 0; i--) {
    const digit = Math.floor(arr[i] / exp) % 10;
    output[count[digit] - 1] = arr[i];
    count[digit]--;
  }
  
  // Copy the output array to arr[]
  for (let i = 0; i < n; i++) {
    arr[i] = output[i];
  }
}`;
      default:
        return '';
    }
  };
    const getAlgorithmDescription = () => {
    switch (algorithm) {
      case 'bubble':
        return 'Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted. Time complexity: O(n²).';
      case 'merge':
        return 'Merge Sort is a divide-and-conquer algorithm that divides the input array into two halves, sorts them separately, and then merges the sorted halves. Time complexity: O(n log n).';
      case 'quick':
        return 'Quick Sort selects a pivot element and partitions the array around it. Elements smaller than the pivot go to the left, larger to the right. The process repeats for each partition. Time complexity: O(n log n) average case, O(n²) worst case.';
      case 'heap':
        return 'Heap Sort builds a max-heap from the array and repeatedly extracts the maximum element, placing it at the end of the sorted portion. Time complexity: O(n log n).';
      case 'radix':
        return 'Radix Sort is a non-comparative sorting algorithm that sorts integers by processing individual digits. It uses counting sort as a subroutine to sort elements based on their individual digits. Time complexity: O(nk) where k is the number of digits in the largest number.';
      default:
        return '';
    }
  };
  
  const toggleCode = () => {
    setShowCode(!showCode);
  };
  
  return (
    <div className="algorithm-info">
      <div className="algorithm-description">
        <h2>{algorithm.charAt(0).toUpperCase() + algorithm.slice(1)} Sort</h2>
        <p>{getAlgorithmDescription()}</p>
        <button onClick={toggleCode} className="code-toggle-btn">
          {showCode ? 'Hide Code' : 'Show Code'}
        </button>
      </div>
      
      {showCode && (
        <div className="code-container">
          <pre><code>{getAlgorithmCode()}</code></pre>
        </div>
      )}
    </div>
  );
};

export default AlgorithmCode; 