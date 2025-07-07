import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { ListItem, ListItems } from '../types';

interface NestedListProps {
  initialItems: ListItems;
}

const NestedList: React.FC<NestedListProps> = ({ initialItems }) => {
  const [items, setItems] = useState<ListItems>(initialItems);
  const [draggedItemId, setDraggedItemId] = useState<number | null>(null);

  const onDragEnd = (result: DropResult) => {
    // Reset dragged item ID
    setDraggedItemId(null);
    
    const { source, destination, } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Parse the droppableId to get the path to the container
    const sourcePath = source.droppableId === 'root' 
      ? [] 
      : source.droppableId.split('-').filter(id => id !== 'children').map(Number);
    
    const destPath = destination.droppableId === 'root' 
      ? [] 
      : destination.droppableId.split('-').filter(id => id !== 'children').map(Number);

    // Create a deep copy of the items
    const newItems = JSON.parse(JSON.stringify(items));

    // Helper function to find a container by path
    const findContainer = (items: ListItems, path: number[]): ListItems => {
      if (path.length === 0) return items;
      
      let container = items;
      for (let i = 0; i < path.length - 1; i++) {
        if (container[path[i]]) {
          container = container[path[i]].children;
        } else {
          console.error('Invalid path segment:', path[i], 'in path:', path);
          return items;
        }
      }
      return container;
    };

    // Find the source and destination containers
    const sourceContainer = findContainer(newItems, sourcePath);
    const destContainer = findContainer(newItems, destPath);

    // Check for circular structure
    if (isCircular(sourceContainer[source.index], destPath, sourcePath)) {
      return;
    }

    // Remove the item from the source container
    const [removed] = sourceContainer.splice(source.index, 1);

    // Add the item to the destination container
    destContainer.splice(destination.index, 0, removed);

    setItems(newItems);
  };

  const onDragStart = (result: any) => {
    // Extract the item ID from the draggableId (format: "item-{id}")
    const itemId = parseInt(result.draggableId.split('-')[1]);
    setDraggedItemId(itemId);
  };

  // Check if moving an item would create a circular structure
  const isCircular = (item: ListItem, destPath: number[], sourcePath: number[]): boolean => {
    // If we're trying to move an item into one of its descendants
    if (sourcePath.length < destPath.length) {
      // Check if the destination is a descendant of the source
      for (let i = 0; i < sourcePath.length; i++) {
        if (sourcePath[i] !== destPath[i]) {
          return false;
        }
      }
      return true;
    }
    return false;
  };

  const renderItem = (item: ListItem, path: number[]) => {
    const itemId = `item-${item.id}`;
    const droppableId = path.length === 0 ? 'root' : `${path.join('-')}-children`;
    const isBeingDragged = draggedItemId === item.id;
    
    return (
      <Draggable key={itemId} draggableId={itemId} index={path.length > 0 ? path[path.length - 1] : 0}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`item ${snapshot.isDragging ? 'dragging' : ''} ${isBeingDragged ? 'dragging' : ''}`}
            style={{
              ...provided.draggableProps.style
            }}
          >
            <div className="item-content">{item.title}</div>
            <Droppable droppableId={`${droppableId}-${item.id}-children`} type={`list-${path.length + 1}`}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`children ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                >
                  {item.children.length > 0 ? (
                    item.children.map((child, index) => 
                      renderItem(child, [...path, index])
                    )
                  ) : snapshot.isDraggingOver ? (
                    <div className="drop-indicator">Drop here</div>
                  ) : null}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
      <Droppable droppableId="root" type="list-0">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`nested-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
          >
            {items.map((item, index) => 
              renderItem(item, [index])
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default NestedList;