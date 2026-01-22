import React from 'react';
import { Todo } from '../types/Todo';
import { TodoItem } from './TodoItem';

type Props = {
  todos: Todo[];
  tempTodo: Todo | null;
  onDelete: (id: number) => void;
  deleteTodoIds: number[];
  onUpdate: (todo: Todo) => Promise<void>;
  onToggle: (id: number) => void;
  loadingTodoIds: number[];
};

export const TodoList: React.FC<Props> = ({
  todos,
  tempTodo,
  onDelete,
  deleteTodoIds,
  onUpdate,
  onToggle,
  loadingTodoIds,
}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {todos.map(todo => (
        <TodoItem
          todo={todo}
          key={todo.id}
          onDeleteTodo={onDelete}
          loading={
            deleteTodoIds.includes(todo.id) || loadingTodoIds.includes(todo.id)
          }
          onUpdateTodo={onUpdate}
          onToggleTodo={onToggle}
        />
      ))}

      {tempTodo && <TodoItem todo={tempTodo} loading={true} />}
    </section>
  );
};
