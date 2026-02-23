const path = require("path");
const fastify = require("fastify")({ logger: true });

let tasks = [
  { id: 1, title: "Сделать домашку", completed: false },
  { id: 2, title: "Купить булочку", completed: true },
  { id: 2, title: "Купить hexre", completed: true },
];
let nextId = 3;

fastify.register(require("@fastify/view"), {
  engine: { pug: require("pug") },
  root: path.join(__dirname, "views"),
});

fastify.get("/", async (request, reply) => {
  return reply.view("index.pug", { tasks });
});

fastify.get("/add", async (request, reply) => {
  const title = (request.query.task ?? "").toString().trim();

  if (title.length > 0) {
    tasks.push({ id: nextId++, title, completed: false });
  }

  return reply.redirect("/");
});

fastify.get("/delete", async (request, reply) => {
  const id = Number.parseInt(String(request.query.id), 10);

  const idx = tasks.findIndex((t) => t.id === id);
  if (idx !== -1) {
    tasks.splice(idx, 1);
  }

  return reply.redirect("/");
});

fastify.get("/toggle", async (request, reply) => {
  const id = Number.parseInt(String(request.query.id), 10);

  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
  }

  return reply.redirect("/");
});

fastify.get("/api/tasks", async (request, reply) => {
  return reply.code(200).send(tasks);
});

fastify.post("/api/tasks", async (request, reply) => {
  const title = request.body?.title;

  if (typeof title !== "string" || title.trim().length === 0) {
    return reply
      .code(400)
      .send({ message: 'Field "title" is required (non-empty string).' });
  }

  const task = { id: nextId++, title: title.trim(), completed: false };
  tasks.push(task);

  return reply.code(201).send(task);
});

fastify.put("/api/tasks/:id", async (request, reply) => {
  const id = Number.parseInt(request.params.id, 10);
  if (!Number.isInteger(id)) {
    return reply.code(400).send({ message: "Invalid id" });
  }

  const task = tasks.find((t) => t.id === id);
  if (!task) {
    return reply.code(404).send({ message: "Task not found" });
  }

  const { title, completed } = request.body ?? {};

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length === 0) {
      return reply.code(400).send({
        message: 'Field "title" must be a non-empty string if provided.',
      });
    }
    task.title = title.trim();
  }

  if (completed !== undefined) {
    if (typeof completed !== "boolean") {
      return reply
        .code(400)
        .send({ message: 'Field "completed" must be boolean if provided.' });
    }
    task.completed = completed;
  }

  return reply.code(200).send(task);
});

fastify.delete("/api/tasks/:id", async (request, reply) => {
  const id = Number.parseInt(request.params.id, 10);
  if (!Number.isInteger(id)) {
    return reply.code(400).send({ message: "Invalid id" });
  }

  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) {
    return reply.code(404).send({ message: "Task not found" });
  }

  tasks.splice(idx, 1);
  return reply.code(200).send({ message: "Deleted" });
});

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log("Server started on http://localhost:3000");
});
