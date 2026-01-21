import React from 'react';
import classNames from 'classnames';

interface Props {
  inputValue: string;
  isAdding: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  hasTodos: boolean;
  areAllCompleted: boolean;
  onToggleAll: () => void;
}

export const NewTodo: React.FC<Props> = ({
  inputValue,
  isAdding,
  onInputChange,
  onSubmit,
  inputRef,
  hasTodos,
  areAllCompleted,
  onToggleAll,
}) => {
  return (
    <header className="todoapp__header">
      {hasTodos && (
        <button
          type="button"
          className={classNames('todoapp__toggle-all', {
            active: areAllCompleted,
          })}
          data-cy="ToggleAllButton"
          onClick={onToggleAll}
        />
      )}

      <form onSubmit={onSubmit}>
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          value={inputValue}
          onChange={event => onInputChange(event.target.value)}
          ref={inputRef}
          disabled={isAdding}
        />
      </form>
    </header>
  );
};
