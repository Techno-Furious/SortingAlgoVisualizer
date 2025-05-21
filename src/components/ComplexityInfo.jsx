import React from 'react';

// Component to display time and space complexity information for sorting algorithms
const ComplexityInfo = ({ algorithm }) => {
  // Complexity information for each algorithm
  const complexityData = {
    bubble: {
      name: 'Bubble Sort',
      timeComplexity: {
        best: 'O(n)',
        average: 'O(n²)',
        worst: 'O(n²)'
      },
      spaceComplexity: 'O(1)',
      description: 'Bubble sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted. The algorithm gets its name because smaller elements "bubble" to the top of the list.'
    },
    merge: {
      name: 'Merge Sort',
      timeComplexity: {
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n log n)'
      },
      spaceComplexity: 'O(n)',
      description: 'Merge sort is a divide and conquer algorithm that divides the input array into two halves, recursively sorts them, and then merges the sorted halves. It has a consistent performance across all cases but requires additional space.'
    },
    quick: {
      name: 'Quick Sort',
      timeComplexity: {
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n²)'
      },
      spaceComplexity: 'O(log n)',
      description: 'Quick sort works by selecting a "pivot" element and partitioning the array around the pivot. Elements smaller than the pivot go to the left, larger ones to the right. The algorithm then recursively sorts the sub-arrays. While typically faster than merge sort, its worst-case performance is O(n²).'
    },
    heap: {
      name: 'Heap Sort',
      timeComplexity: {
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n log n)'
      },
      spaceComplexity: 'O(1)',
      description: 'Heap sort builds a max-heap from the input array and then repeatedly extracts the maximum element from the heap, rebuilding the heap after each extraction. It combines the better attributes of merge sort (time complexity) and insertion sort (space complexity).'
    },
    radix: {
      name: 'Radix Sort',
      timeComplexity: {
        best: 'O(nk)',
        average: 'O(nk)',
        worst: 'O(nk)'
      },
      spaceComplexity: 'O(n + k)',
      description: 'Radix sort is a non-comparative sorting algorithm that sorts integers by processing individual digits. It first sorts by the least significant digit and moves towards the most significant digit. While it can be very fast for integers with a fixed number of digits, its performance depends on the number of digits (k) in the input.'
    }
  };

  // If algorithm is not found, show default message
  if (!complexityData[algorithm]) {
    return <div className="complexity-info">Select an algorithm to view complexity information.</div>;
  }

  const { name, timeComplexity, spaceComplexity, description } = complexityData[algorithm];

  return (
    <div className="complexity-info">
      <h2>{name} - Complexity Analysis</h2>
      
      <div className="complexity-section">
        <h3>Time Complexity</h3>
        <table className="complexity-table">
          <thead>
            <tr>
              <th>Best Case</th>
              <th>Average Case</th>
              <th>Worst Case</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{timeComplexity.best}</td>
              <td>{timeComplexity.average}</td>
              <td>{timeComplexity.worst}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="complexity-section">
        <h3>Space Complexity</h3>
        <p>{spaceComplexity}</p>
      </div>
      
      <div className="complexity-section">
        <h3>Description</h3>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default ComplexityInfo;
