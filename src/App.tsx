import React from 'react';
import './App.css';
import NestedList from './components/NestedList';
import { ListItems } from './types';

const initialItems: ListItems = [
  {
    id: 1,
    title: "Item 1",
    children: [
      {
        id: 2,
        title: "Item 1.1",
        children: []
      },
      {
        id: 3,
        title: "Item 1.2",
        children: [
          {
            id: 4,
            title: "Item 1.2.1",
            children: []
          }
        ]
      }
    ]
  },
  {
    id: 5,
    title: "Item 2",
    children: []
  },
  {
    id: 6,
    title: "Item 3",
    children: [
      {
        id: 7,
        title: "Item 3.1",
        children: []
      }
    ]
  }
];

function App() {
  return (
    <div className="App">
      <h1>Nested Drag-and-Drop List</h1>
      <p className="instructions">
        Drag and drop items to reorder them. You can move items within the same level or across different levels.
      </p>
      <NestedList initialItems={initialItems} />
      <footer>
        <p>Built with React, TypeScript, and react-beautiful-dnd</p>
      </footer>
    </div>
  );
}

export default App;