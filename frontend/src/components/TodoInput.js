import React, { useState } from 'react';
import './styles.css';

const TodoInput = ({ onAddTask }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onAddTask(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="todo-input">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="What do you need to accomplish?"
        className="input-field"
      />
      <button onClick={handleSubmit} className="add-btn">
        <span>+</span> Add Task
      </button>
    </div>
  );
};

export default TodoInput;