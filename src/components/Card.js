import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import './Card.css'; 

const Card = ({ task, index, editTask, deleteTask }) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (// react beautiful dnd property
        <div
          ref={provided.innerRef} 
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`task ${snapshot.isDragging ? 'dragging' : ''}`}
        >
          <div className="task-actions">
            <button onClick={() => editTask(task.id)}>編輯</button>
            <button onClick={() => deleteTask(task.id)}>删除</button>
          </div>
          <div className="task-content">
            {task.content}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default Card;