import express from "express";
import knex from "knex";

const app = express();

app.use(express.json());

const db = knex({
  client: "sqlite3",
  connection: {
    filename: "./tasks.db",
  },
  useNullAsDefault: true,
});

db.schema.hasTable("tasks").then((exists) => {
  if (!exists) {
    return db.schema.createTable("tasks", (table) => {
      table.increments("id").primary();
      table.string("title");
      table.string("description");
    });
  }
});

app.post("/tasks", async (req, res) => {
  const { title, description } = req.body;

  try {
    const [taskId] = await db("tasks").insert({ title, description });
    res.status(201).json({ id: taskId, title, description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/tasks", async (req, res) => {
  try {
    const tasks = await db("tasks");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/tasks/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const task = await db("tasks").where({ id }).first();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    await db("tasks").update({ title, description }).where({ id });
    res.json({ id, title, description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db("tasks").delete().where({ id });
    res.json({ message: "Task successfully removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("API rodando na porta 3000");
});
