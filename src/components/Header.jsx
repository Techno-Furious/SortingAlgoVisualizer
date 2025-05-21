import { useState, useEffect } from 'react';

const Header = ({ 
  algorithms, 
  currentAlgorithm, 
  setCurrentAlgorithm, 
  speed, 
  setSpeed, 
  arraySize, 
  setArraySize
}) => {
  const [isRunning, setIsRunning] = useState(false);
  
  // Listen for sort completion to update button state
  useEffect(() => {
    const handleSortComplete = () => {
      setIsRunning(false);
    };
    
    window.addEventListener('sort-visualizer-complete', handleSortComplete);
    
    return () => {
      window.removeEventListener('sort-visualizer-complete', handleSortComplete);
    };
  }, []);
  
  const handleAlgorithmChange = (algorithmId) => {
    if (!isRunning) {
      setCurrentAlgorithm(algorithmId);
    }
  };
  
  const handleSpeedChange = (e) => {
    setSpeed(parseInt(e.target.value));
  };
  
  const handleSizeChange = (e) => {
    if (!isRunning) {
      setArraySize(parseInt(e.target.value));
    }
  };
  
  // Function to handle play/pause
  const toggleRunning = () => {
    const newRunningState = !isRunning;
    setIsRunning(newRunningState);
    
    // The actual play/pause logic will be handled by the SortingVisualizer component
    // via a custom event
    window.dispatchEvent(new CustomEvent('sort-visualizer-control', {
      detail: { action: newRunningState ? 'play' : 'pause' }
    }));
  };
  
  // Function to reset the array
  const resetArray = () => {
    if (!isRunning) {
      window.dispatchEvent(new CustomEvent('sort-visualizer-control', {
        detail: { action: 'reset' }
      }));
    }
  };

  // Convert speed value to a human-readable description
  const getSpeedDescription = (speedValue) => {
    if (speedValue <= 20) return 'Very Slow';
    if (speedValue <= 40) return 'Slow';
    if (speedValue <= 60) return 'Medium';
    if (speedValue <= 80) return 'Fast';
    return 'Very Fast';
  };

  return (
    <header>
      <h1>Sorting Algorithm Visualizer</h1>
      
      <div className="controls-container">
        <div className="algo-selector">
          {algorithms.map((algo) => (
            <button 
              key={algo.id}
              className={`algo-btn ${currentAlgorithm === algo.id ? 'active' : ''}`}
              onClick={() => handleAlgorithmChange(algo.id)}
              disabled={isRunning}
            >
              {algo.name}
            </button>
          ))}
        </div>
        
        <div className="slider-container">
          <label htmlFor="speed-slider">Speed: {getSpeedDescription(speed)}</label>
          <input 
            type="range" 
            id="speed-slider"
            min="1" 
            max="100"
            value={speed}
            onChange={handleSpeedChange}
          />
        </div>
        
        <div className="slider-container">
          <label htmlFor="size-slider">Array Size: {arraySize}</label>
          <input 
            type="range" 
            id="size-slider"
            min="10" 
            max="100"
            value={arraySize}
            onChange={handleSizeChange}
            disabled={isRunning}
          />
        </div>
        
        <div className="action-buttons">
          <button 
            className={`action-btn ${isRunning ? 'pause' : 'play'}`}
            onClick={toggleRunning}
          >
            {isRunning ? 'Pause' : 'Play'}
          </button>
          
          <button 
            className="action-btn reset"
            onClick={resetArray}
            disabled={isRunning}
          >
            Reset
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 