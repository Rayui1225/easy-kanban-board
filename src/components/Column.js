import React, { useState } from 'react';
import Card from './Card';
import { Droppable } from 'react-beautiful-dnd';
import './Column.css'; 

const Column = ({ column, tasks, addTask, editTask, deleteTask }) => {
  const [newTaskContent, setNewTaskContent] = useState('');

  const handleAddTask = () => {
    if (newTaskContent.trim() !== '') {
      addTask(column.id, newTaskContent);
      setNewTaskContent('');
    }
  };

  return (
    <div className="column">
      <h3 className="column-header">{column.title}</h3>
      <div className="add-task">
        <input
          type="text"
          value={newTaskContent}
          onChange={(e) => setNewTaskContent(e.target.value)}
          placeholder="新增任務"
        />
        <button onClick={handleAddTask}>新增</button>
      </div>
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (// react beautiful dnd property
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`column-content ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
          >
            {column.taskIds.map((taskId, index) => tasks[taskId] && (
              <Card
                key={taskId}
                task={tasks[taskId]}
                index={index}
                editTask={editTask}
                deleteTask={deleteTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;