const path = require("path");
const fastify = require("fastify")({ logger: true });

let tasks = [];
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
