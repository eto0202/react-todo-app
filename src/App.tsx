import "./App.css";
import { AquariumTable } from "./components/AquariumTable";
import { TodoForm } from "./components/TodoForm";
import { useTodos } from "./Hooks/useTodo";

function App() {
  // Reactのフックは、呼び出されるたびに完全に独立した状態（state）とロジックのセットを生成。
  // useTodosフックをコンポーネントのトップレベルで一度だけ呼び出す。
  const { todoList, handleAddTodo, handleToggleComplete, handleDelete, handleUpdatePositions } =
    useTodos();
  return (
    <>
      <h1>React Todo App</h1>
      <TodoForm onAddTodo={handleAddTodo}></TodoForm>
      <AquariumTable
        todoList={todoList}
        onToggleComplete={handleToggleComplete}
        onDelete={handleDelete}
        onUpdatePositions={handleUpdatePositions}
      ></AquariumTable>
    </>
  );
}

export default App;
