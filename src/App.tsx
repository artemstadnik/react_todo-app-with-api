/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import {
  addTodos,
  deleteTodo,
  getTodos,
  updateTodo,
  USER_ID,
} from './api/todos';
import { Todo } from './types/Todo';
import { FilterStatus } from './types/FilterStatus';
import { ErrorMessage } from './types/ErrorMessage';
import { Footer } from './components/Footer';
import { TodoForm } from './components/TodoForm';
import { ErrorNotification } from './components/ErrorNotification';
import { TodoList } from './components/TodoList';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>(FilterStatus.All);
  const [title, setTitle] = useState<string>('');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [deleteTodoIds, setDeleteTodoIds] = useState<number[]>([]);
  const [loadingTodoIds, setLoadingTodoIds] = useState<number[]>([]);

  useEffect(() => {
    setLoading(true);

    getTodos()
      .then(setTodos)
      .catch(() => {
        setErrorMessage(ErrorMessage.LoadTodos);
      })
      .finally(() => setLoading(false));
  }, []);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current && !loading) {
      inputRef.current.focus();
    }
  }, [loading]);

  const filteredTodos = todos.filter(todo => {
    if (filter === FilterStatus.Active) {
      return !todo.completed;
    }

    if (filter === FilterStatus.Completed) {
      return todo.completed;
    }

    return true;
  });

  const handleAddTodo = (event: React.FormEvent) => {
    event.preventDefault();

    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setErrorMessage(ErrorMessage.EmptyTitle);

      return;
    }

    setLoading(true);

    const tempTodoItem: Todo = {
      id: 0,
      userId: USER_ID,
      title: cleanTitle,
      completed: false,
    };

    setTempTodo(tempTodoItem);

    addTodos(cleanTitle)
      .then(newTodo => {
        setTodos(prev => [...prev, newTodo]);
        setTitle('');
      })
      .catch(() => {
        setErrorMessage(ErrorMessage.AddTodo);
      })
      .finally(() => {
        setLoading(false);
        setTempTodo(null);
      });
  };

  if (!USER_ID) {
    return <UserWarning />;
  }

  const handleDeleteTodo = (id: number) => {
    setDeleteTodoIds(prev => [...prev, id]);

    deleteTodo(id)
      .then(() => {
        setTodos(presentTodos => presentTodos.filter(todo => todo.id !== id));
        inputRef.current?.focus();
      })
      .catch(() => {
        setErrorMessage(ErrorMessage.DeleteTodo);
      })
      .finally(() => {
        setDeleteTodoIds(currentsIds =>
          currentsIds.filter(todoId => todoId !== id),
        );
      });
  };

  const handleClearCompleted = () => {
    todos.forEach(todo => {
      if (todo.completed) {
        handleDeleteTodo(todo.id);
      }
    });
  };

  const handleUpdateTodo = (todo: Todo) => {
    setLoadingTodoIds(ids => [...ids, todo.id]);

    return updateTodo(todo)
      .then(updatedTodo => {
        setTodos(curr => curr.map(t => (t.id === todo.id ? updatedTodo : t)));
      })
      .catch(error => {
        setErrorMessage(ErrorMessage.UpdateTodo);
        throw error;
      })
      .finally(() => {
        setLoadingTodoIds(ids => ids.filter(id => id !== todo.id));
      });
  };

  const handleToggleTodo = (id: number) => {
    const todo = todos.find(t => t.id === id);

    if (!todo) {
      return;
    }

    setLoadingTodoIds(ids => [...ids, id]);

    handleUpdateTodo({ ...todo, completed: !todo.completed });
  };

  const isAllCompleted = todos.every(todo => todo.completed);

  const handleToggleAll = () => {
    const idsToUpdate = todos
      .filter(todo => todo.completed !== !isAllCompleted)
      .map(todo => todo.id);

    setLoadingTodoIds(ids => [...ids, ...idsToUpdate]);

    Promise.allSettled(
      todos
        .filter(todo => idsToUpdate.includes(todo.id))
        .map(todo => updateTodo({ ...todo, completed: !isAllCompleted })),
    )
      .then(results => {
        if (results.some(r => r.status === 'rejected')) {
          setErrorMessage(ErrorMessage.UpdateSomeTodos);
        }

        setTodos(curr =>
          curr.map(todo =>
            idsToUpdate.includes(todo.id)
              ? { ...todo, completed: !isAllCompleted }
              : todo,
          ),
        );
      })
      .finally(() => {
        setLoadingTodoIds(ids => ids.filter(id => !idsToUpdate.includes(id)));
      });
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <TodoForm
          todos={todos}
          title={title}
          setTitle={setTitle}
          handleAddTodo={handleAddTodo}
          loading={loading}
          inputRef={inputRef}
          onToggleAll={handleToggleAll}
        />

        {todos.length > 0 && (
          <TodoList
            todos={filteredTodos}
            tempTodo={tempTodo}
            onDelete={handleDeleteTodo}
            deleteTodoIds={deleteTodoIds}
            onUpdate={handleUpdateTodo}
            onToggle={handleToggleTodo}
            loadingTodoIds={loadingTodoIds}
          />
        )}

        {todos.length > 0 && (
          <Footer
            todos={todos}
            filter={filter}
            setFilter={setFilter}
            onClearCompleted={handleClearCompleted}
          />
        )}
      </div>

      <ErrorNotification
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </div>
  );
};
