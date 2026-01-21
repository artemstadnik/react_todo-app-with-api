import React from 'react';
import { Todo } from '../types/Todo';
import { TodoItem } from './TodoItem';

interface Props {
  todos: Todo[];
  tempTodo: Todo | null;
  deletingTodoIds: number[];
  onDeleteTodo: (todoId: number) => void;
  updatingTodoIds: number[];
  onToggleTodo: (todoId: number) => void;
  onUpdateTodoTitle: (todoId: number, newTitle: string) => Promise<void>;
}

export const TodoList: React.FC<Props> = ({
  todos,
  tempTodo,
  deletingTodoIds,
  onDeleteTodo,
  updatingTodoIds,
  onToggleTodo,
  onUpdateTodoTitle,
}) => {
  if (todos.length === 0 && !tempTodo) {
    return null;
  }

  return (
    <section className="todoapp__main" data-cy="TodoList">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          isDeleting={deletingTodoIds.includes(todo.id)}
          onDelete={() => onDeleteTodo(todo.id)}
          isUpdating={updatingTodoIds.includes(todo.id)}
          onToggle={() => onToggleTodo(todo.id)}
          onUpdateTitle={newTitle => onUpdateTodoTitle(todo.id, newTitle)}
        />
      ))}

      {tempTodo && (
        <TodoItem key={tempTodo.id} todo={tempTodo} isDeleting={false} isTemp />
      )}
    </section>
  );
};
