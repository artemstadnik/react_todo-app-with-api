import React, { useEffect, useRef, useState } from 'react';

import { UserWarning } from './UserWarning';
import {
  createTodo,
  deleteTodo,
  getTodos,
  updateTodo,
  USER_ID,
} from './api/todos';
import { Todo } from './types/Todo';
import { FILTERS, FilterType } from './types/filters';
import { NewTodo } from './components/NewTodo';
import { TodoList } from './components/TodoList';
import { TodoFooter } from './components/TodoFooter';
import { ErrorNotification } from './components/ErrorNotification';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterType>(FILTERS.all);
  const [inputValue, setInputValue] = useState('');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingTodoIds, setDeletingTodoIds] = useState<number[]>([]);
  const [updatingTodoIds, setUpdatingTodoIds] = useState<number[]>([]);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const addDeletingId = (todoId: number) => {
    setDeletingTodoIds(prevIds =>
      prevIds.includes(todoId) ? prevIds : [...prevIds, todoId],
    );
  };

  const removeDeletingId = (todoId: number) => {
    setDeletingTodoIds(prevIds => prevIds.filter(id => id !== todoId));
  };

  const addUpdatingId = (todoId: number) => {
    setUpdatingTodoIds(prevIds =>
      prevIds.includes(todoId) ? prevIds : [...prevIds, todoId],
    );
  };

  const removeUpdatingId = (todoId: number) => {
    setUpdatingTodoIds(prevIds => prevIds.filter(id => id !== todoId));
  };

  const handleDeleteTodo = (todoId: number): Promise<void> => {
    setErrorMessage('');
    addDeletingId(todoId);

    return deleteTodo(todoId)
      .then(() => {
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== todoId));
      })
      .catch(() => {
        setErrorMessage('Unable to delete a todo');
      })
      .finally(() => {
        removeDeletingId(todoId);
        inputRef.current?.focus();
      });
  };

  const handleClearCompleted = () => {
    const completedTodos = todos.filter(todo => todo.completed);

    const deletePromises = completedTodos.map(todo =>
      handleDeleteTodo(todo.id),
    );

    Promise.allSettled(deletePromises).then(() => inputRef.current?.focus());
  };

  const handleToggleTodo = (todoId: number) => {
    setErrorMessage('');
    const todo = todos.find(t => t.id === todoId);

    if (!todo) {
      return;
    }

    addUpdatingId(todoId);

    updateTodo({ ...todo, completed: !todo.completed })
      .then(returnedTodo => {
        setTodos(prevTodos =>
          prevTodos.map(t => (t.id === todoId ? returnedTodo : t)),
        );
      })
      .catch(() => {
        setErrorMessage('Unable to update a todo');
      })
      .finally(() => {
        removeUpdatingId(todoId);
      });
  };

  const handleToggleAll = () => {
    setErrorMessage('');
    if (!todos.length) {
      return;
    }

    const shouldComplete = !todos.every(todo => todo.completed);
    const todosToUpdate = todos.filter(
      todo => todo.completed !== shouldComplete,
    );

    todosToUpdate.forEach(todo => {
      addUpdatingId(todo.id);

      updateTodo({ ...todo, completed: shouldComplete })
        .then(returnedTodo => {
          setTodos(prevTodos =>
            prevTodos.map(t => (t.id === todo.id ? returnedTodo : t)),
          );
        })
        .catch(() => {
          setErrorMessage('Unable to update a todo');
        })
        .finally(() => {
          removeUpdatingId(todo.id);
        });
    });
  };

  const handleUpdateTodoTitle = async (
    todoId: number,
    newTitle: string,
  ): Promise<void> => {
    setErrorMessage('');
    const todo = todos.find(item => item.id === todoId);

    if (!todo) {
      return Promise.resolve();
    }

    const trimmedTitle = newTitle.trim();

    if (trimmedTitle === todo.title) {
      return Promise.resolve();
    }

    if (!trimmedTitle) {
      return handleDeleteTodo(todoId);
    }

    addUpdatingId(todoId);

    try {
      try {
        const returnedTodo = await updateTodo({ ...todo, title: trimmedTitle });

        setTodos(prevTodos =>
          prevTodos.map(t => (t.id === todoId ? returnedTodo : t)),
        );
      } catch {
        setErrorMessage('Unable to update a todo');
        throw new Error();
      }
    } finally {
      removeUpdatingId(todoId);
    }
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');

    const cleanedInput = inputValue.trim();

    if (!cleanedInput) {
      setErrorMessage('Title should not be empty');

      return;
    }

    setIsAdding(true);

    setTempTodo({
      id: 0,
      userId: USER_ID,
      title: cleanedInput,
      completed: false,
    });

    createTodo({ title: cleanedInput, completed: false })
      .then(newTodo => {
        setTodos(prevTodos => [...prevTodos, newTodo]);
        setInputValue('');
      })
      .catch(() => {
        setErrorMessage('Unable to add a todo');
      })
      .finally(() => {
        setIsAdding(false);
        setTempTodo(null);
        setTimeout(() => inputRef.current?.focus(), 0);
      });
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setErrorMessage('');

    getTodos()
      .then(setTodos)
      .catch(() => {
        setErrorMessage('Unable to load todos');
      });
  }, []);

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setErrorMessage('');
    }, 3000);

    return () => clearTimeout(timer);
  }, [errorMessage]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  const filteredTodos = todos.filter(todo => {
    if (filterStatus === FILTERS.active) {
      return !todo.completed;
    }

    if (filterStatus === FILTERS.completed) {
      return todo.completed;
    }

    return true;
  });

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <NewTodo
          inputValue={inputValue}
          isAdding={isAdding}
          onInputChange={setInputValue}
          onSubmit={handleFormSubmit}
          inputRef={inputRef}
          hasTodos={todos.length > 0}
          areAllCompleted={
            todos.length > 0 && todos.every(todo => todo.completed)
          }
          onToggleAll={handleToggleAll}
        />

        <TodoList
          todos={filteredTodos}
          tempTodo={tempTodo}
          deletingTodoIds={deletingTodoIds}
          updatingTodoIds={updatingTodoIds}
          onDeleteTodo={handleDeleteTodo}
          onToggleTodo={handleToggleTodo}
          onUpdateTodoTitle={handleUpdateTodoTitle}
        />

        <TodoFooter
          activeCount={todos.filter(todo => !todo.completed).length}
          hasCompleted={todos.some(todo => todo.completed)}
          currentFilter={filterStatus}
          onFilterChange={setFilterStatus}
          onClearCompleted={handleClearCompleted}
        />
      </div>

      <ErrorNotification
        message={errorMessage}
        onHide={() => setErrorMessage('')}
      />
    </div>
  );
};
