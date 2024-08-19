import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Column from './Column';
import { DragDropContext } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid'; // uuid 用于生成唯一的 id
import './Board.css';

const Board = () => {
  const [tasks, setTasks] = useState({});
  const [columns, setColumns] = useState({});
  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasksResponse = await axios.get('http://127.0.0.1:5000/api/Cards');
        const columnsResponse = await axios.get('http://127.0.0.1:5000/api/Columns');

        setTasks(tasksResponse.data);
        const columnsData = columnsResponse.data;
        const columnsArray = Object.values(columnsData).reverse(); // 會跟資料庫順序相反
        const reversedColumns = columnsArray.reduce((acc, column) => {
          acc[column.id] = column; 
          return acc;
        }, {});
        
        setColumns(reversedColumns);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
    const handleStorageChange = event => { 
      if (event.key === 'boardData') {
        const boardData = JSON.parse(event.newValue);
        setTasks(boardData.tasks);
        setColumns(boardData.columns);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const saveStateToLocalStorage = (newTasks, newColumns) => {
    const boardData = {
      tasks: newTasks,
      columns: newColumns,
    };
    localStorage.setItem('boardData', JSON.stringify(boardData)); // have relationship with handleStorageChange's event.key === 'boardData'
  };


   const onDragEnd = async result => {
    const { destination, source, draggableId } = result;//result is automatically provided by react-beautiful-dnd

    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }
  
    const start = columns[source.droppableId];
    const finish = columns[destination.droppableId];
  
    let newColumns;
    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
  
      const newColumn = { ...start, taskIds: newTaskIds };
      newColumns = { ...columns, [newColumn.id]: newColumn };
    } else {
      const startTaskIds = Array.from(start.taskIds);
      startTaskIds.splice(source.index, 1);
      const newStart = { ...start, taskIds: startTaskIds };
  
      const finishTaskIds = Array.from(finish.taskIds);
      finishTaskIds.splice(destination.index, 0, draggableId);
      const newFinish = { ...finish, taskIds: finishTaskIds };
  
      newColumns = { ...columns, [newStart.id]: newStart, [newFinish.id]: newFinish };
    }
  
    setColumns(newColumns);
    saveStateToLocalStorage(tasks, newColumns);
  
    try { //update 
      for (const columnId in newColumns) {
        try {
          await axios.put(`http://127.0.0.1:5000/api/Columns/${columnId}`, newColumns[columnId], {
            headers: {
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.error(`Failed to update column ${columnId} on server:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to update columns on server:', error);
    }
  };
  const addTask = async (columnId, taskContent) => {
    const newTaskId = uuidv4();
    const newTask = {
      id: newTaskId,
      content: taskContent,
    };

    const newTasks = {
      ...tasks,
      [newTaskId]: newTask,
    };
    setTasks(newTasks);

    const newTaskIds = [...columns[columnId].taskIds, newTaskId];
    const newColumn = {
      ...columns[columnId],
      taskIds: newTaskIds,
    };
    const newColumns = {
      ...columns,
      [columnId]: newColumn,
    };
    setColumns(newColumns);
    saveStateToLocalStorage(newTasks, newColumns);
    try {
      await axios.post('http://127.0.0.1:5000/api/Cards', newTask, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Failed to add task to server:', error);
    }
    try {
      await axios.put(`http://127.0.0.1:5000/api/Columns/${columnId}`, newColumn, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Failed to update column on server:', error);
    }
  };

const editTask = async(taskId) => {
    const newContent = prompt("編輯任務内容:", tasks[taskId].content);
    if (newContent !== null) {
      const newTasks = {
        ...tasks,
        [taskId]: {
          ...tasks[taskId],
          content: newContent,
        },
      };
      setTasks(newTasks);
      saveStateToLocalStorage(newTasks, columns);
      try {
        await axios.put(`http://127.0.0.1:5000/api/Cards/${taskId}`, newTasks[taskId], {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Failed to update column on server:', error);
      }
    }
  };

const deleteTask = async(taskId) => {
    const confirmDelete = window.confirm("確定刪除?");
    if (confirmDelete){
    const newTasks = { ...tasks };
    delete newTasks[taskId];
    setTasks(newTasks);
    
    const newColumns = Object.keys(columns).reduce((acc, columnId) => {
      const newTaskIds = columns[columnId].taskIds.filter(id => id !== taskId);
      acc[columnId] = {
        ...columns[columnId],
        taskIds: newTaskIds,
      };
      return acc;
    }, {});

    setColumns(newColumns);
    saveStateToLocalStorage(newTasks, newColumns);
    try {
      // 從數據庫中刪除任務
      await axios.delete(`http://127.0.0.1:5000/api/Cards/${taskId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // 更新數據庫中的列
      for (const columnId in newColumns) {
        try {
          await axios.put(`http://127.0.0.1:5000/api/Columns/${columnId}`, newColumns[columnId], {
            headers: {
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.error(`Failed to update column ${columnId} on server:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to delete task from server or update column:', error);
    }
    
  }
};

//after drag onDragEnd will be auto called by react-beautiful-dnd's  DragDropContext
  return (
    <DragDropContext onDragEnd={onDragEnd}>              
      <div className="board">
        {Object.values(columns).map(column => (
          <Column
            key={column.id}
            column={column}
            tasks={tasks}
            addTask={addTask}
            editTask={editTask}
            deleteTask={deleteTask}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default Board;