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
            
            // Schedule color reset after a delay
            const resetCompareTimeoutId = setTimeout(() => {
              if (!isPaused && !isFinished) {
                animation.indices.forEach(index => {
                  if (arrayBars[index] && 
                      arrayBars[index].style.backgroundColor === COMPARE_COLOR) {
                    arrayBars[index].style.backgroundColor = ARRAY_BAR_COLOR;
                  }
                });
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
              
              // Update the height of the bars
              arrayBars[animation.indices[0]].style.height = `${animation.values[0] * 3}px`;
              arrayBars[animation.indices[1]].style.height = `${animation.values[1] * 3}px`;
              
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
              
              // Update the height of the bar
              arrayBars[animation.index].style.height = `${animation.value * 3}px`;
              
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
              
              // Update the value and height
              const newValue = animation.value;
              arrayBars[animation.toIndex].style.height = `${newValue * 3}px`;
              
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
  
  return (
    <div className="sorting-visualizer">
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
      
      {/* Status Message Display */}
      {statusMessage && (
        <div className="status-message">
          {statusMessage}
        </div>
      )}
      
      {/* Combined visualization area for Radix Sort */}
      <div className="visualization-area">
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
                        style={{ height: `${value * 1.5}px` }}
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
        
        {/* Array bars visualization */}
        <div className="array-container">
          {array.map((value, idx) => (
            <div 
              className="array-bar"
              key={idx}
              style={{
                height: `${value * 2}px`,
                width: `${Math.max(20, Math.min(40, 700 / arraySize))}px`,
                backgroundColor: ARRAY_BAR_COLOR,
                marginLeft: '1px',
                marginRight: '1px'
              }}
            >
              <div className="array-value">{value}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="algorithm-container">
        <AlgorithmCode algorithm={algorithm} />
      </div>
      
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
    </div>
  );
};

export default SortingVisualizer;
