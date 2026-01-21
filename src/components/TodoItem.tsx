import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Todo } from '../types/Todo';

interface Props {
  todo: Todo;
  isDeleting: boolean;
  isUpdating?: boolean;
  onDelete?: () => Promise<void> | void;
  isTemp?: boolean;
  onToggle?: () => void;
  onUpdateTitle?: (newTitle: string) => Promise<void>;
}

export const TodoItem: React.FC<Props> = ({
  todo,
  isDeleting,
  isUpdating = false,
  onDelete,
  isTemp = false,
  onToggle,
  onUpdateTitle,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setTitle(todo.title);
  }, [todo.title]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleEditStart = () => {
    if (isTemp || isDeleting || isUpdating) {
      return;
    }

    setIsEditing(true);
    setTitle(todo.title);
  };

  const handleCancelEditing = () => {
    setTitle(todo.title);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!isEditing) {
      return;
    }

    const trimmedTitle = title.trim();

    if (trimmedTitle === todo.title) {
      handleCancelEditing();

      return;
    }

    if (!trimmedTitle) {
      const deletePromise = onDelete?.();

      if (deletePromise) {
        deletePromise.catch(() => {});
      }

      return;
    }

    const updatePromise = onUpdateTitle?.(trimmedTitle);

    if (!updatePromise) {
      setIsEditing(false);

      return;
    }

    updatePromise.then(() => setIsEditing(false)).catch(() => {});
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      handleCancelEditing();
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      handleSave();
    }
  };

  return (
    <div
      data-cy="Todo"
      className={classNames('todo', { completed: todo.completed })}
    >
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          disabled={isTemp || isDeleting || isUpdating}
          onChange={onToggle}
        />
      </label>

      {isEditing ? (
        <form
          onSubmit={event => {
            event.preventDefault();
            handleSave();
          }}
        >
          <input
            data-cy="TodoTitleField"
            className="todo__title-field"
            type="text"
            value={title}
            onChange={event => setTitle(event.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            ref={inputRef}
          />
        </form>
      ) : (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={handleEditStart}
          >
            {todo.title}
          </span>

          {!isTemp && (
            <button
              type="button"
              className="todo__remove"
              data-cy="TodoDelete"
              onClick={onDelete}
              disabled={isDeleting || isUpdating}
            >
              ×
            </button>
          )}
        </>
      )}

      <div
        data-cy="TodoLoader"
        className={classNames('modal overlay', {
          'is-active': isDeleting || isTemp || isUpdating,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
