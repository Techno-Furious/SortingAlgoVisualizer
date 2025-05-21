import { useState, useEffect, useRef } from 'react';
import AlgorithmCode from './AlgorithmCode';
import { 
  generateRandomArray, 
  bubbleSort, 
  mergeSort, 
  quickSort, 
  heapSort,
  radixSort,
  ANIMATION_TYPES
} from '../utils/sortingAlgorithms';

// Color constants
const ARRAY_BAR_COLOR = '#0f3460';
const COMPARE_COLOR = '#ffd700';
const SWAP_COLOR = '#e94560';
const SORTED_COLOR = '#40916c';
const PIVOT_COLOR = '#9d4edd';
const MERGE_SPLIT_COLOR = '#3a86ff';
const MERGE_JOIN_COLOR = '#06d6a0';
const BUCKET_COLOR = '#f72585';
const BUCKET_HIGHLIGHT_COLOR = '#7209b7';

const SortingVisualizer = ({ algorithm, speed, arraySize }) => {
  const [array, setArray] = useState([]);
  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showInputField, setShowInputField] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentSpeed, setCurrentSpeed] = useState(speed);
  const [subArrays, setSubArrays] = useState([]);
  const [buckets, setBuckets] = useState(Array(10).fill([]));
  const [currentDigit, setCurrentDigit] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [heapNodes, setHeapNodes] = useState([]);
  const [heapHighlightNodes, setHeapHighlightNodes] = useState([]);
  const [showHeapView, setShowHeapView] = useState(false);
  
  const animationsRef = useRef([]);
  const animationTimeoutsRef = useRef([]);
  const currentAnimationIndexRef = useRef(0);
  const lastColorResetTimeoutRef = useRef(null);
  
  // Update current speed whenever prop changes
  useEffect(() => {
    setCurrentSpeed(speed);
  }, [speed]);
    // Generate a new random array
  const resetArray = () => {
    const newArray = generateRandomArray(arraySize, 5, 100);
    setArray(newArray);
    setIsFinished(false);
    setErrorMessage('');
    setSubArrays([]);
    setBuckets(Array(10).fill([]));
    setCurrentDigit(null);
    setStatusMessage('');
    setHeapNodes([]);
    setHeapHighlightNodes([]);
    setShowHeapView(false);
    
    // Reset all visual indicators
    setTimeout(() => {
      const arrayBars = document.getElementsByClassName('array-bar');
      for (let i = 0; i < arrayBars.length; i++) {
        if (arrayBars[i]) {
          arrayBars[i].style.backgroundColor = ARRAY_BAR_COLOR;
          arrayBars[i].style.marginLeft = '1px';
          arrayBars[i].style.marginRight = '1px';
        }
      }
    }, 0);
  };

  // Handle custom array input
  const handleCustomInputChange = (e) => {
    setCustomInput(e.target.value);
  };

  // Parse and validate custom array
  const setCustomArray = () => {
    try {
      // Parse input - try different formats
      let customArray = [];
      
      // Try parsing as JSON array
      try {
        customArray = JSON.parse(customInput);
      } catch {
        // Try parsing comma-separated values
        customArray = customInput.split(',').map(item => {
          const num = parseInt(item.trim());
          if (isNaN(num)) throw new Error('Invalid number');
          return num;
        });
      }
      
      // Validate array
      if (!Array.isArray(customArray)) {
        throw new Error('Input must be an array');
      }
      
      if (customArray.length < 2) {
        throw new Error('Array must have at least 2 elements');
      }
      
      if (customArray.length > 100) {
        throw new Error('Array too large (max 100 elements)');
      }
      
      if (!customArray.every(item => typeof item === 'number' && !isNaN(item))) {
        throw new Error('All elements must be numbers');
      }
      
      // Set the custom array
      setArray(customArray);
      setErrorMessage('');
      setShowInputField(false);
      setSubArrays([]);
      setBuckets(Array(10).fill([]));
      setCurrentDigit(null);
      setStatusMessage('');
      
      // Reset all visual indicators
      const arrayBars = document.getElementsByClassName('array-bar');
      for (let i = 0; i < arrayBars.length; i++) {
        if (arrayBars[i]) {
          arrayBars[i].style.backgroundColor = ARRAY_BAR_COLOR;
          arrayBars[i].style.marginLeft = '1px';
          arrayBars[i].style.marginRight = '1px';
        }
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };
  
  // Toggle custom array input field
  const toggleCustomInput = () => {
    setShowInputField(!showInputField);
    if (!showInputField) {
      setCustomInput(array.join(', '));
    }
  };
  
  // Reset the array when the array size changes
  useEffect(() => {
    resetArray();
  }, [arraySize]);
  
  // Listen for control events (play, pause, reset)
  useEffect(() => {
    const handleControl = (e) => {
      const { action } = e.detail;
      
      if (action === 'play') {
        if (isPaused) {
          setIsPaused(false);
          resumeAnimation();
        } else if (!isSorting) {
          startSorting();
        }
      } else if (action === 'pause') {
        if (isSorting && !isPaused) {
          setIsPaused(true);
          pauseAnimation();
        }
      } else if (action === 'reset') {
        stopAnimation();
        resetArray();
      }
    };
    
    window.addEventListener('sort-visualizer-control', handleControl);
    
    return () => {
      window.removeEventListener('sort-visualizer-control', handleControl);
    };
  }, [isSorting, isPaused, array]);
  
  // Clean up timeouts when component unmounts
  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, []);
  
  // Get the sorting algorithm animations based on the selected algorithm
  const getSortingAnimations = () => {
    switch (algorithm) {
      case 'bubble':
        return bubbleSort([...array]);
      case 'merge':
        return mergeSort([...array]);
      case 'quick':
        return quickSort([...array]);
      case 'heap':
        return heapSort([...array]);
      case 'radix':
        return radixSort([...array]);
      default:
        return [];
    }
  };
  
  // Reset all temporary colors (compare, swap)
  const resetTemporaryColors = () => {
    if (lastColorResetTimeoutRef.current) {
      clearTimeout(lastColorResetTimeoutRef.current);
    }
    
    const arrayBars = document.getElementsByClassName('array-bar');
    for (let i = 0; i < arrayBars.length; i++) {
      if (arrayBars[i] && 
          arrayBars[i].style.backgroundColor !== SORTED_COLOR) {
        arrayBars[i].style.backgroundColor = ARRAY_BAR_COLOR;
      }
    }
  };
  
  // Apply visual gaps for merge sort subarrays
  const updateSubArrayGaps = (subArrayRanges) => {
    const arrayBars = document.getElementsByClassName('array-bar');
    
    // First reset all margins
    for (let i = 0; i < arrayBars.length; i++) {
      if (arrayBars[i]) {
        arrayBars[i].style.marginLeft = '1px';
        arrayBars[i].style.marginRight = '1px';
      }
    }
    
    // Apply gap margins between subarrays
    subArrayRanges.forEach(range => {
      // Add gap after the end of each subarray (except the last one)
      if (range.end < arrayBars.length - 1 && arrayBars[range.end]) {
        arrayBars[range.end].style.marginRight = '10px';
      }
      // Add gap before the start of each subarray (except the first one)
      if (range.start > 0 && arrayBars[range.start]) {
        arrayBars[range.start].style.marginLeft = '10px';
      }
    });
  };
    // Start the sorting animation
  const startSorting = () => {
    if (isSorting || array.length <= 1) return;
    
    setIsSorting(true);
    setIsPaused(false);
    setIsFinished(false);
    setSubArrays([]);
    setBuckets(Array(10).fill([]));
    setCurrentDigit(null);
    setStatusMessage('');
    setHeapNodes([]);
    setHeapHighlightNodes([]);
    setShowHeapView(algorithm === 'heap');
    
    // Get the sorting animations
    const animations = getSortingAnimations();
    animationsRef.current = animations;
    currentAnimationIndexRef.current = 0;
    
    // Reset all element colors and margins before starting
    const arrayBars = document.getElementsByClassName('array-bar');
    for (let i = 0; i < arrayBars.length; i++) {
      if (arrayBars[i]) {
        arrayBars[i].style.backgroundColor = ARRAY_BAR_COLOR;
        arrayBars[i].style.marginLeft = '1px';
        arrayBars[i].style.marginRight = '1px';
      }
    }
    
    // Initialize heap view if heap sort
    if (algorithm === 'heap') {
      initializeHeapView(array);
    }
    
    runAnimations();
  };
  
  // Calculate delay based on speed
  const getAnimationDelay = (speed) => {
    // For speed=1 (slowest), we want a 1000ms delay
    // For speed=100 (fastest), we want a 5ms delay
    return 1000 - (speed - 1) * (995 / 99);
  };
  
  // Run the animations
  const runAnimations = () => {
    const animations = animationsRef.current;
    const arrayBars = document.getElementsByClassName('array-bar');
    
    // Clear any existing timeouts
    animationTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
    animationTimeoutsRef.current = [];
    
    const startIndex = currentAnimationIndexRef.current;
    const animationDelay = getAnimationDelay(currentSpeed);
    
    for (let i = startIndex; i < animations.length; i++) {
      const timeoutId = setTimeout(() => {
        if (isPaused) return; // Skip if paused
        
        const animation = animations[i];
        currentAnimationIndexRef.current = i + 1;
        
        // Reset any temporary colors from previous steps before applying new ones
        resetTemporaryColors();
          switch (animation.type) {
          case ANIMATION_TYPES.COMPARE:
            // Highlight the bars being compared
            animation.indices.forEach(index => {
              if (arrayBars[index]) {
                arrayBars[index].style.backgroundColor = COMPARE_COLOR;
              }
            });
            
            // Update message if provided
            if (animation.message) {
              setStatusMessage(animation.message);
            }
            
            // Update heap visualization if heap sort
            if (algorithm === 'heap') {
              updateHeapNodeStates(animation.indices, 'compare');
            }
            
            // Schedule color reset after a delay
            const resetCompareTimeoutId = setTimeout(() => {
              if (!isPaused && !isFinished) {
                animation.indices.forEach(index => {
                  if (arrayBars[index] && 
                      arrayBars[index].style.backgroundColor === COMPARE_COLOR) {
                    arrayBars[index].style.backgroundColor = ARRAY_BAR_COLOR;
                  }
                });
                
                // Reset heap node states
                if (algorithm === 'heap') {
                  setHeapHighlightNodes([]);
                }
              }
            }, animationDelay * 0.9);
            
            lastColorResetTimeoutRef.current = resetCompareTimeoutId;
            animationTimeoutsRef.current.push(resetCompareTimeoutId);
            break;
            
          case ANIMATION_TYPES.SWAP:
            // Highlight the bars being swapped
            if (arrayBars[animation.indices[0]] && arrayBars[animation.indices[1]]) {
              arrayBars[animation.indices[0]].style.backgroundColor = SWAP_COLOR;
              arrayBars[animation.indices[1]].style.backgroundColor = SWAP_COLOR;
              
              // Update the height of the bars - use smaller heights for radix sort
              const heightMultiplier = algorithm === 'radix' ? 2 : 3;
              arrayBars[animation.indices[0]].style.height = `${animation.values[0] * heightMultiplier}px`;
              arrayBars[animation.indices[1]].style.height = `${animation.values[1] * heightMultiplier}px`;
              
              // Update the number in the bar
              const valueDiv0 = arrayBars[animation.indices[0]].querySelector('.array-value');
              const valueDiv1 = arrayBars[animation.indices[1]].querySelector('.array-value');
              if (valueDiv0) valueDiv0.textContent = animation.values[0];
              if (valueDiv1) valueDiv1.textContent = animation.values[1];
              
              // Update the array state
              setArray(prevArray => {
                const newArray = [...prevArray];
                newArray[animation.indices[0]] = animation.values[0];
                newArray[animation.indices[1]] = animation.values[1];
                return newArray;
              });
              
              // Update heap visualization if heap sort
              if (algorithm === 'heap') {
                updateHeapNodeStates(animation.indices, 'swap');
                updateHeapNodeValues(
                  animation.indices[0], 
                  animation.indices[1], 
                  animation.values[0], 
                  animation.values[1]
                );
              }
              
              // Schedule color reset after a delay
              const resetSwapTimeoutId = setTimeout(() => {
                if (!isPaused && !isFinished) {
                  if (arrayBars[animation.indices[0]] && 
                      arrayBars[animation.indices[0]].style.backgroundColor === SWAP_COLOR) {
                    arrayBars[animation.indices[0]].style.backgroundColor = ARRAY_BAR_COLOR;
                  }
                  if (arrayBars[animation.indices[1]] && 
                      arrayBars[animation.indices[1]].style.backgroundColor === SWAP_COLOR) {
                    arrayBars[animation.indices[1]].style.backgroundColor = ARRAY_BAR_COLOR;
                  }
                  
                  // Reset heap node states
                  if (algorithm === 'heap') {
                    setHeapHighlightNodes([]);
                  }
                }
              }, animationDelay * 0.9);
              
              lastColorResetTimeoutRef.current = resetSwapTimeoutId;
              animationTimeoutsRef.current.push(resetSwapTimeoutId);
            }
            break;
            
          case ANIMATION_TYPES.OVERWRITE:
            // Highlight the bar being overwritten
            if (arrayBars[animation.index]) {
              arrayBars[animation.index].style.backgroundColor = SWAP_COLOR;
              
              // Update the height of the bar - use smaller heights for radix sort
              const heightMultiplier = algorithm === 'radix' ? 2 : 3;
              arrayBars[animation.index].style.height = `${animation.value * heightMultiplier}px`;
              
              // Update the number in the bar
              const valueDiv = arrayBars[animation.index].querySelector('.array-value');
              if (valueDiv) valueDiv.textContent = animation.value;
              
              // Update message if provided
              if (animation.message) {
                setStatusMessage(animation.message);
              }
              
              // Update the array state
              setArray(prevArray => {
                const newArray = [...prevArray];
                newArray[animation.index] = animation.value;
                return newArray;
              });
              
              // Schedule color reset after a delay
              const resetOverwriteTimeoutId = setTimeout(() => {
                if (!isPaused && !isFinished && 
                    arrayBars[animation.index] && 
                    arrayBars[animation.index].style.backgroundColor === SWAP_COLOR) {
                  arrayBars[animation.index].style.backgroundColor = ARRAY_BAR_COLOR;
                }
              }, animationDelay * 0.9);
              
              lastColorResetTimeoutRef.current = resetOverwriteTimeoutId;
              animationTimeoutsRef.current.push(resetOverwriteTimeoutId);
            }
            break;
              case ANIMATION_TYPES.SORTED:
            // Mark the elements as sorted - these colors stay permanently
            animation.indices.forEach(index => {
              if (arrayBars[index]) {
                arrayBars[index].style.backgroundColor = SORTED_COLOR;
              }
            });
            
            // Update heap visualization if heap sort
            if (algorithm === 'heap') {
              animation.indices.forEach(index => {
                setHeapNodes(prev => {
                  const newNodes = [...prev];
                  if (newNodes[index]) {
                    newNodes[index] = { ...newNodes[index], state: 'sorted' };
                  }
                  return newNodes;
                });
              });
            }
            break;
            
          case ANIMATION_TYPES.PIVOT:
            // Highlight the pivot element with a distinct color
            if (arrayBars[animation.index]) {
              arrayBars[animation.index].style.backgroundColor = PIVOT_COLOR;
              
              // Schedule color reset if it's not the final sorted state
              const resetPivotTimeoutId = setTimeout(() => {
                if (!isPaused && !isFinished && 
                    arrayBars[animation.index] && 
                    arrayBars[animation.index].style.backgroundColor === PIVOT_COLOR) {
                  arrayBars[animation.index].style.backgroundColor = ARRAY_BAR_COLOR;
                }
              }, animationDelay * 0.9);
              
              lastColorResetTimeoutRef.current = resetPivotTimeoutId;
              animationTimeoutsRef.current.push(resetPivotTimeoutId);
            }
            break;
            
          case ANIMATION_TYPES.MERGE_SPLIT:
            // Highlight the splitting of arrays in merge sort with split color
            if (animation.indices && animation.indices.length) {
              // Get the range of the subarray (start to end)
              const start = Math.min(...animation.indices);
              const end = Math.max(...animation.indices);
              
              // If this is a split operation (isSplit property is true)
              if (animation.isSplit) {
                // Use the split color
                animation.indices.forEach(index => {
                  if (arrayBars[index]) {
                    arrayBars[index].style.backgroundColor = MERGE_SPLIT_COLOR;
                  }
                });
                
                // Add this range to subarrays for creating visual gaps
                if (end - start > 1) { // Only add if subarray has more than one element
                  setSubArrays(prev => {
                    // Find existing range or create new one
                    const newRanges = [...prev];
                    const midpoint = Math.floor((start + end) / 2);
                    
                    // Add two new ranges (divided subarray)
                    newRanges.push({ start, end: midpoint });
                    newRanges.push({ start: midpoint + 1, end });
                    
                    // Update visual gaps
                    updateSubArrayGaps(newRanges);
                    return newRanges;
                  });
                }
              } else {
                // This is a join operation, use join color
                animation.indices.forEach(index => {
                  if (arrayBars[index]) {
                    arrayBars[index].style.backgroundColor = MERGE_JOIN_COLOR;
                  }
                });
                
                // Remove these subarrays from tracking (they're being joined)
                setSubArrays(prev => {
                  // Remove the two subarrays being joined
                  const newRanges = prev.filter(range => 
                    !(range.start >= start && range.end <= end)
                  );
                  
                  // Add the combined range if it's not the whole array
                  if (start > 0 || end < array.length - 1) {
                    newRanges.push({ start, end });
                  }
                  
                  // Update visual gaps
                  updateSubArrayGaps(newRanges);
                  return newRanges;
                });
              }
              
              // Schedule color reset
              const resetMergeTimeoutId = setTimeout(() => {
                if (!isPaused && !isFinished) {
                  animation.indices.forEach(index => {
                    if (arrayBars[index] && 
                        (arrayBars[index].style.backgroundColor === MERGE_SPLIT_COLOR ||
                         arrayBars[index].style.backgroundColor === MERGE_JOIN_COLOR)) {
                      arrayBars[index].style.backgroundColor = ARRAY_BAR_COLOR;
                    }
                  });
                }
              }, animationDelay * 0.9);
              
              lastColorResetTimeoutRef.current = resetMergeTimeoutId;
              animationTimeoutsRef.current.push(resetMergeTimeoutId);
            }
            break;
            
          // New animation types for Radix Sort
          case ANIMATION_TYPES.RADIX_START:
            // Clear any existing buckets
            setBuckets(Array(10).fill([]));
            setCurrentDigit(null);
            if (animation.message) {
              setStatusMessage(animation.message);
            }
            break;
            
          case ANIMATION_TYPES.RADIX_PHASE:
            // Update the current digit being sorted
            setCurrentDigit(animation.exp);
            if (animation.message) {
              setStatusMessage(animation.message);
            }
            // Clear buckets for the new phase
            setBuckets(Array(10).fill([]));
            break;
            
          case ANIMATION_TYPES.BUCKET_ASSIGN:
            // Highlight the element being moved to a bucket
            if (arrayBars[animation.fromIndex]) {
              arrayBars[animation.fromIndex].style.backgroundColor = BUCKET_COLOR;
              
              // Update status message
              if (animation.message) {
                setStatusMessage(animation.message);
              }
              
              // Update buckets state
              setBuckets(prevBuckets => {
                const newBuckets = [...prevBuckets.map(bucket => [...bucket])];
                newBuckets[animation.digit] = [...newBuckets[animation.digit], animation.value];
                return newBuckets;
              });
              
              // Schedule color reset
              const resetBucketAssignTimeoutId = setTimeout(() => {
                if (!isPaused && !isFinished && 
                    arrayBars[animation.fromIndex] && 
                    arrayBars[animation.fromIndex].style.backgroundColor === BUCKET_COLOR) {
                  arrayBars[animation.fromIndex].style.backgroundColor = ARRAY_BAR_COLOR;
                }
              }, animationDelay * 0.9);
              
              lastColorResetTimeoutRef.current = resetBucketAssignTimeoutId;
              animationTimeoutsRef.current.push(resetBucketAssignTimeoutId);
            }
            break;
            
          case ANIMATION_TYPES.BUCKETS_POPULATED:
            // Display all buckets
            setBuckets(animation.buckets);
            if (animation.message) {
              setStatusMessage(animation.message);
            }
            break;
            
          case ANIMATION_TYPES.BUCKET_HIGHLIGHT:
            // Highlight a specific bucket
            if (animation.message) {
              setStatusMessage(animation.message);
            }
            break;
            
          case ANIMATION_TYPES.BUCKET_COLLECT:
            // Move an element from a bucket back to the array
            if (arrayBars[animation.toIndex]) {
              arrayBars[animation.toIndex].style.backgroundColor = BUCKET_HIGHLIGHT_COLOR;
              
              // Update the value and height - use smaller heights for radix sort
              const newValue = animation.value;
              const heightMultiplier = algorithm === 'radix' ? 2 : 3;
              arrayBars[animation.toIndex].style.height = `${newValue * heightMultiplier}px`;
              
              const valueDiv = arrayBars[animation.toIndex].querySelector('.array-value');
              if (valueDiv) valueDiv.textContent = newValue;
              
              // Update array state
              setArray(prevArray => {
                const newArray = [...prevArray];
                newArray[animation.toIndex] = newValue;
                return newArray;
              });
              
              // Update buckets state (remove the collected item)
              setBuckets(prevBuckets => {
                const newBuckets = [...prevBuckets.map(bucket => [...bucket])];
                if (newBuckets[animation.digit].length > 0) {
                  newBuckets[animation.digit] = newBuckets[animation.digit].slice(1);
                }
                return newBuckets;
              });
              
              // Update status message
              if (animation.message) {
                setStatusMessage(animation.message);
              }
                // Schedule color reset
              const resetBucketCollectTimeoutId = setTimeout(() => {
                if (!isPaused && !isFinished && 
                    arrayBars[animation.toIndex] && 
                    arrayBars[animation.toIndex].style.backgroundColor === BUCKET_HIGHLIGHT_COLOR) {
                  arrayBars[animation.toIndex].style.backgroundColor = ARRAY_BAR_COLOR;
                }
              }, animationDelay * 0.9);
              
              lastColorResetTimeoutRef.current = resetBucketCollectTimeoutId;
              animationTimeoutsRef.current.push(resetBucketCollectTimeoutId);
            }
            break;
            
          case ANIMATION_TYPES.RADIX_STEP_COMPLETE:
            // A digit place sort is complete
            if (animation.message) {
              setStatusMessage(animation.message);
            }
            // Clear the buckets after this phase
            setBuckets(Array(10).fill([]));
            break;
        }
        
        // Check if the animation is finished
        if (i === animations.length - 1) {
          setIsSorting(false);
          setIsFinished(true);
          // Reset subarray tracking and gaps
          setSubArrays([]);
          
          // Make sure all elements are marked as sorted
          setTimeout(() => {
            markAllAsSorted();
            
            // Reset any gaps
            const arrayBars = document.getElementsByClassName('array-bar');
            for (let i = 0; i < arrayBars.length; i++) {
              if (arrayBars[i]) {
                arrayBars[i].style.marginLeft = '1px';
                arrayBars[i].style.marginRight = '1px';
              }
            }
          }, animationDelay);
          
          // Dispatch an event to notify the header that sorting is complete
          window.dispatchEvent(new CustomEvent('sort-visualizer-complete'));
        }
      }, i * animationDelay);
      
      animationTimeoutsRef.current.push(timeoutId);
    }
  };
  
  // Pause the animation
  const pauseAnimation = () => {
    animationTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
    animationTimeoutsRef.current = [];
    if (lastColorResetTimeoutRef.current) {
      clearTimeout(lastColorResetTimeoutRef.current);
    }
  };
  
  // Resume the animation
  const resumeAnimation = () => {
    if (isPaused) {
      setIsPaused(false);
      runAnimations();
    }
  };
    // Stop the animation completely
  const stopAnimation = () => {
    setIsSorting(false);
    setIsPaused(false);
    setIsFinished(false);
    setSubArrays([]);
    setBuckets(Array(10).fill([]));
    setCurrentDigit(null);
    setStatusMessage('');
    setHeapNodes([]);
    setHeapHighlightNodes([]);
    setShowHeapView(false);
    
    animationTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
    animationTimeoutsRef.current = [];
    if (lastColorResetTimeoutRef.current) {
      clearTimeout(lastColorResetTimeoutRef.current);
    }
    currentAnimationIndexRef.current = 0;
    
    // Reset any gaps
    const arrayBars = document.getElementsByClassName('array-bar');
    for (let i = 0; i < arrayBars.length; i++) {
      if (arrayBars[i]) {
        arrayBars[i].style.marginLeft = '1px';
        arrayBars[i].style.marginRight = '1px';
      }
    }
  };
  
  // Mark all elements as sorted (helper function)
  const markAllAsSorted = () => {
    const arrayBars = document.getElementsByClassName('array-bar');
    for (let i = 0; i < arrayBars.length; i++) {
      if (arrayBars[i]) {
        arrayBars[i].style.backgroundColor = SORTED_COLOR;
      }
    }
  };
    // Initialize the heap view with the current array
  const initializeHeapView = (arr) => {
    // Convert array to heap nodes structure
    const heapArray = [...arr];
    const nodes = heapArray.map((value, index) => ({
      value,
      index,
      state: 'default' // default, compare, swap, sorted
    }));
    
    setHeapNodes(nodes);
    setHeapHighlightNodes([]);
    setStatusMessage('Starting Heap Sort: Building max heap');
    setShowHeapView(true);
    
    // Add class to main container for heap view
    document.querySelector('.sorting-visualizer')?.classList.add('heap-active');
  };
    // Update heap node states based on animation step
  const updateHeapNodeStates = (indices, state) => {
    // Clear previous highlights first
    setHeapHighlightNodes([]);
    
    // Add new highlights with a small delay to ensure state update
    setTimeout(() => {
      setHeapHighlightNodes(indices.map(index => ({
        index,
        state
      })));
    }, 0);
  };
  
  // Update heap node values after a swap
  const updateHeapNodeValues = (i, j, valI, valJ) => {
    setHeapNodes(prev => {
      const newNodes = [...prev];
      if (newNodes[i]) newNodes[i] = { ...newNodes[i], value: valI };
      if (newNodes[j]) newNodes[j] = { ...newNodes[j], value: valJ };
      return newNodes;
    });
  };
  // Render the heap tree structure
  const renderHeapTree = () => {
    if (!heapNodes.length) return null;
    
    // Calculate tree structure
    const totalNodes = heapNodes.length;
    const maxLevel = Math.floor(Math.log2(totalNodes)) + 1;
    const lastLevelNodes = Math.min(Math.pow(2, maxLevel - 1), totalNodes - (Math.pow(2, maxLevel - 1) - 1));
    
    // Calculate width based on number of nodes in the last level
    const nodeWidth = 40;
    const nodeSpacing = 20;
    const minNodeDistance = nodeWidth + nodeSpacing;
    
    // Determine tree dimensions
    const treeWidth = Math.pow(2, maxLevel - 1) * minNodeDistance;
    
    // Build levelNodes - an array of arrays, each containing the nodes at that level
    const levelNodes = [];
    let nodeIdx = 0;
    
    for (let level = 0; level < maxLevel; level++) {
      const nodesInThisLevel = Math.min(Math.pow(2, level), totalNodes - nodeIdx);
      const levelNodeList = [];
      
      for (let i = 0; i < nodesInThisLevel && nodeIdx < totalNodes; i++) {
        // Get node state
        let nodeState = 'default';
        const highlightNode = heapHighlightNodes.find(hn => hn.index === nodeIdx);
        if (highlightNode) {
          nodeState = highlightNode.state;
        }
        
        // Store both array index and heap index (for drawing edges)
        levelNodeList.push({
          value: heapNodes[nodeIdx].value,
          index: nodeIdx,
          state: nodeState
        });
        
        nodeIdx++;
      }
      
      levelNodes.push(levelNodeList);
    }
    
    // Calculate node positions
    const nodePositions = {};
    
    levelNodes.forEach((level, levelIndex) => {
      const nodesAtLevel = level.length;
      const totalLevelWidth = treeWidth;
      const levelSpacing = totalLevelWidth / (nodesAtLevel + 1);
      
      level.forEach((node, nodeIndex) => {
        const xPos = levelSpacing * (nodeIndex + 1);
        nodePositions[node.index] = { x: xPos, level: levelIndex };
      });
    });
    
    // Render the tree
    return (
      <div className="heap-tree" style={{ width: `${treeWidth}px`, minWidth: '100%' }}>
        {levelNodes.map((level, levelIndex) => (
          <div key={`level-${levelIndex}`} className="heap-row" style={{ height: `${nodeWidth + 40}px` }}>
            {level.map((node) => {
              const leftChildIndex = 2 * node.index + 1;
              const rightChildIndex = 2 * node.index + 2;
              const edges = [];
              
              // Draw edges to children
              if (leftChildIndex < totalNodes && nodePositions[leftChildIndex]) {
                const parentPos = nodePositions[node.index];
                const childPos = nodePositions[leftChildIndex];
                const childLevel = childPos.level;
                
                // Child is in next row, calculate edge
                if (childLevel === parentPos.level + 1) {
                  const dx = childPos.x - parentPos.x;
                  const dy = 60; // Distance to next row
                  const length = Math.sqrt(dx * dx + dy * dy);
                  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                  
                  edges.push(
                    <div
                      key={`edge-left-${node.index}`}
                      className="heap-edge"
                      style={{
                        width: `${length}px`,
                        transform: `rotate(${angle}deg)`,
                        transformOrigin: 'top left',
                        left: `${nodeWidth / 2}px`,
                        top: `${nodeWidth}px`
                      }}
                    />
                  );
                }
              }
              
              if (rightChildIndex < totalNodes && nodePositions[rightChildIndex]) {
                const parentPos = nodePositions[node.index];
                const childPos = nodePositions[rightChildIndex];
                const childLevel = childPos.level;
                
                // Child is in next row, calculate edge
                if (childLevel === parentPos.level + 1) {
                  const dx = childPos.x - parentPos.x;
                  const dy = 60; // Distance to next row
                  const length = Math.sqrt(dx * dx + dy * dy);
                  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                  
                  edges.push(
                    <div
                      key={`edge-right-${node.index}`}
                      className="heap-edge"
                      style={{
                        width: `${length}px`,
                        transform: `rotate(${angle}deg)`,
                        transformOrigin: 'top left',
                        left: `${nodeWidth / 2}px`,
                        top: `${nodeWidth}px`
                      }}
                    />
                  );
                }
              }
              
              return (
                <div
                  key={`node-${node.index}`}
                  className="heap-node-container"
                  style={{
                    position: 'absolute',
                    left: `${nodePositions[node.index].x - nodeWidth / 2}px`,
                    width: `${nodeWidth}px`,
                    height: `${nodeWidth}px`
                  }}
                >
                  <div className={`heap-node node-${node.state}`}>
                    {node.value}
                  </div>
                  {edges}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };
    return (
    <div className={`sorting-visualizer ${showHeapView ? 'heap-active' : ''}`}>
      {/* Custom Array Input */}
      <div className="custom-array-section">
        <button 
          onClick={toggleCustomInput} 
          className="custom-array-btn"
          disabled={isSorting}
        >
          {showInputField ? 'Cancel' : 'Custom Array'}
        </button>
        
        {showInputField && (
          <div className="custom-array-input">
            <input
              type="text"
              value={customInput}
              onChange={handleCustomInputChange}
              placeholder="Enter comma-separated numbers (e.g., 5, 3, 8, 1, 9)"
              className="custom-input-field"
            />
            <button 
              onClick={setCustomArray}
              className="apply-custom-btn"
            >
              Apply
            </button>
          </div>
        )}
        
        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </div>
      
      {/* Added top margin to create space between navbar and visualization area */}
      <div className="visualization-area" style={{ marginTop: algorithm === 'heap' && showHeapView ? '30px' : '0' }}>
        {/* Radix Sort Buckets Visualization - only shown for radix sort */}
        {algorithm === 'radix' && currentDigit !== null && (
          <div className="radix-buckets-container">
            <div className="current-digit-indicator">
              Sorting by: {currentDigit === 1 ? 'ones' : currentDigit === 10 ? 'tens' : currentDigit === 100 ? 'hundreds' : 'thousands'} place
            </div>
            <div className="buckets-row">
              {buckets.map((bucket, index) => (
                <div key={index} className="digit-bucket">
                  <div className="bucket-label">{index}</div>
                  <div className="bucket-items">
                    {bucket.map((value, valueIndex) => (
                      <div 
                        key={`${index}-${valueIndex}`} 
                        className="bucket-item"
                        style={{ height: `${value * 1.2}px` }}
                      >
                        {value}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Heap Sort: show array above heap, both only once */}
        {algorithm === 'heap' && showHeapView ? (
          <>
            <div className="array-container" style={{ marginBottom: '24px' }}>
              {array.map((value, idx) => (
                <div 
                  className="array-bar"
                  key={idx}
                  style={{
                    height: `${value * 3}px`,
                    width: `${Math.max(15, Math.min(30, 600 / arraySize))}px`,
                    backgroundColor: ARRAY_BAR_COLOR,
                    marginLeft: '1px',
                    marginRight: '1px'
                  }}
                >
                  <div className="array-value">{value}</div>
                </div>
              ))}
            </div>
            <div className="heap-visualization">
              <div className="heap-visualization-header">
                Heap Visualization
              </div>
              <div className="heap-status">
                {statusMessage}
              </div>
              <div className="heap-visualization-content">
                {renderHeapTree()}
              </div>
              <div className="heap-indicator">
                The heap is visualized as a binary tree where each parent node is greater than its children (max heap).
              </div>
              <div className="visualization-legend">
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: ARRAY_BAR_COLOR }}></div>
                  <span>Heap Node</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: COMPARE_COLOR }}></div>
                  <span>Comparing Nodes</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: SWAP_COLOR }}></div>
                  <span>Swapping Nodes</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: SORTED_COLOR }}></div>
                  <span>Sorted Node</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          // All other algorithms: just show the array bars as before
          <div className="array-container">
            {array.map((value, idx) => (
              <div 
                className="array-bar"
                key={idx}
                style={{
                  height: `${value * (algorithm === 'radix' ? 2 : 3)}px`,
                  width: `${Math.max(15, Math.min(30, 600 / arraySize))}px`, 
                  backgroundColor: ARRAY_BAR_COLOR,
                  marginLeft: '1px',
                  marginRight: '1px'
                }}
              >
                <div className="array-value">{value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="algorithm-container">
        <AlgorithmCode algorithm={algorithm} />
      </div>
      {/* Only show the legend for non-heap sorts here (heap legend is inside heap viz above) */}
      {!(algorithm === 'heap' && showHeapView) && (
        <div className="visualization-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: ARRAY_BAR_COLOR }}></div>
            <span>Unsorted</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: COMPARE_COLOR }}></div>
            <span>Comparing</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: SWAP_COLOR }}></div>
            <span>Swapping</span>
          </div>
          {algorithm === 'merge' && (
            <>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: MERGE_SPLIT_COLOR }}></div>
                <span>Splitting</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: MERGE_JOIN_COLOR }}></div>
                <span>Joining</span>
              </div>
            </>
          )}
          {algorithm === 'quick' && (
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: PIVOT_COLOR }}></div>
              <span>Pivot</span>
            </div>
          )}
          {algorithm === 'radix' && (
            <>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: BUCKET_COLOR }}></div>
                <span>Bucket</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: BUCKET_HIGHLIGHT_COLOR }}></div>
                <span>Collecting</span>
              </div>
            </>
          )}
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: SORTED_COLOR }}></div>
            <span>Sorted</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SortingVisualizer;