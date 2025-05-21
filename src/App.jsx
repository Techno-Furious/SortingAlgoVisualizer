import { useState } from 'react'
import './App.css'
import SortingVisualizer from './components/SortingVisualizer'
import Header from './components/Header'

function App() {
  const [currentAlgorithm, setCurrentAlgorithm] = useState('bubble')
  const [speed, setSpeed] = useState(30)
  const [arraySize, setArraySize] = useState(30)
    const algorithms = [
    { id: 'bubble', name: 'Bubble Sort' },
    { id: 'merge', name: 'Merge Sort' },
    { id: 'quick', name: 'Quick Sort' },
    { id: 'heap', name: 'Heap Sort' },
    { id: 'radix', name: 'Radix Sort' }
  ]
  
  return (
    <div className="app">
      <Header 
        algorithms={algorithms}
        currentAlgorithm={currentAlgorithm}
        setCurrentAlgorithm={setCurrentAlgorithm}
        speed={speed}
        setSpeed={setSpeed}
        arraySize={arraySize}
        setArraySize={setArraySize}
      />
      <main>
        <SortingVisualizer 
          algorithm={currentAlgorithm}
          speed={speed}
          arraySize={arraySize}
        />
      </main>
      <footer>
        <p>Sorting Algorithm Visualizer | Created with React and Vite</p>
      </footer>
    </div>
  )
}

export default App
