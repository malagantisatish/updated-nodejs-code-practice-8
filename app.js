const express = require("express");
const app = express();

app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

let initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`Error at ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// api-1

const hasPriorityAndStatusProperty = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let getTheTodoQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperty(request.query):
      getTheTodosQuery = `SELECT * FROM todo 
    WHERE todo LIKE '%${search_q}%'
    AND status ='${status}'
    AND priority='${priority}'`;
      break;
    case hasPriority(request.query):
      getTheTodosQuery = `SELECT * FROM todo 
    WHERE todo LIKE '%${search_q}%'
    AND priority='${priority}'`;
      break;
    case hasStatus(request.query):
      getTheTodosQuery = `SELECT * FROM todo 
    WHERE todo LIKE '%${search_q}%'
    AND status ='${status}';`;
      break;

    default:
      getTheTodosQuery = `SELECT * FROM todo 
    WHERE todo LIKE '%${search_q}%';`;
      break;
  }
  const todoArray = await db.all(getTheTodosQuery);
  response.send(todoArray);
});

// api-2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTheTodoQuery = `SELECT * FROM todo WHERE id=${todoId};`;
  const todo = await db.get(getTheTodoQuery);
  response.send(todo);
});

//api-3

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTheTodoQuery = `
INSERT INTO todo (id,todo,priority,status) 
VALUES (${id},'${todo}','${priority}','${status}');`;
  await db.run(postTheTodoQuery);
  response.send("Todo Successfully Added");
});

//api-4

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }

  const previousTodoQuery = `
  SELECT * FROM todo WHERE id=${todoId};`;
  const previousTodo = await db.get(previousTodoQuery);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  const updateTodoQuery = `
  UPDATE todo SET todo='${todo}',status='${status}',priority='${priority}'
  WHERE id=${todoId};`;
  await db.run(updateTodoQuery);
  response.send("Todo Updated");
});

//api-5

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
    DELETE FROM todo WHERE id=${todoId};`;
  await db.run(deleteQuery);
  response.send("Todo Delete");
});

module.exports = app;
