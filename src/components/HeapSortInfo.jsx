import React from 'react';
import './HeapSortStyles.css';

/**
 * Component to display educational information about Heap Sort
 * This is shown alongside the visualization to help users understand the algorithm
 */
const HeapSortInfo = () => {
  return (
    <div className="heap-info-modal">
      <h3>How Heap Sort Works</h3>
      
      <div className="heap-info-section">
        <h4>Algorithm Overview</h4>
        <p>
          Heap Sort is an efficient, comparison-based sorting algorithm that uses a binary heap data structure.
          It has a time complexity of O(n log n) in all cases.
        </p>
      </div>
      
      <div className="heap-info-section">
        <h4>The Two Phases of Heap Sort</h4>
        <ol>
          <li>
            <strong>Build Max Heap:</strong> Transform the input array into a max heap, 
            where the largest element is at the root.
          </li>
          <li>
            <strong>Extract Elements:</strong> Repeatedly remove the root (maximum element) and 
            place it at the end of the array. After each extraction, restore the heap property.
          </li>
        </ol>
      </div>
      
      <div className="heap-info-section">
        <h4>Understanding the Visualization</h4>
        <ul>
          <li><strong>Tree Structure:</strong> Each node shows its value and array index position</li>
          <li><strong>Yellow Nodes:</strong> Being compared to check heap property</li>
          <li><strong>Red Nodes:</strong> Being swapped to maintain heap property</li>
          <li><strong>Green Nodes:</strong> In their final sorted position</li>
        </ul>
      </div>
      
      <div className="heap-info-section">
        <h4>Binary Heap Properties</h4>
        <ul>
          <li><strong>Max Heap:</strong> The value of each node is greater than or equal to its children</li>
          <li><strong>Complete Tree:</strong> All levels are filled except possibly the last level</li>
          <li><strong>Array Representation:</strong> For node at index i:
            <ul>
              <li>Left child is at index 2i + 1</li>
              <li>Right child is at index 2i + 2</li>
              <li>Parent is at index floor((i-1)/2)</li>
            </ul>
          </li>
        </ul>
      </div>
      
      <div className="heap-info-footer">
        <p>Follow the visualization to see how each step transforms the heap!</p>
      </div>
    </div>
  );
};

export default HeapSortInfo;
