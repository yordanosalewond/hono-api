import { sValidator } from "@hono/standard-validator"
import { error } from "console"
import { Hono } from "hono"
import { auth } from "hono/utils/basic-auth"
import { z } from "zod"

const app = new Hono()

const authors: Array<{ id: string; name: string; birthday?: Date | null }> = [
  {
    id: crypto.randomUUID(),
    name: "John",
    birthday: new Date("1990-01-01")
  },
  {
    id: crypto.randomUUID(),
    name: "Rice",
    birthday: new Date("1985-05-15")
  }
]

const createAuthorSchema = z.object({
  name: z.string().min(1),
  birthday: z.coerce.date().optional(),
})

const updateAuthorSchema = z.object({
  name: z.string().min(1).optional(),
  birthday: z.coerce.date().nullable().optional(),
})

app.get('/', (c) => {
  return c.json(authors)
})

app.get('/:id', (c) => {
  const id = c.req.param("id")
  
  const author = authors.find(a => a.id === id);

  if(author == null) {
    return c.json({error: "author not found"}, 404)
  }

  return c.json(author)
})


app.post('/', sValidator("json", createAuthorSchema),  (c) => {
  const data = c.req.valid("json")
  
  const newAuthor = {
    id: crypto.randomUUID(), ...data
  }

  authors.push(newAuthor)

  return c.json(newAuthor, 201)
})

app.put('/:id', sValidator("json", updateAuthorSchema),  (c) => {
  const id = c.req.param("id")
  const data = c.req.valid("json")

  const author = authors.find(a => a.id === id)
  if (author === undefined) {
    return c.json({error: "author not found"}, 404)
  }

  if(data.name !== undefined) {
    author.name = data.name
  }

  if(data.birthday !== undefined) {
    author.birthday = data.birthday;
  }

  return c.json(author)
})


app.delete('/:id', (c) => {
  const id = c.req.param("id")

  const index = authors.findIndex(a => a.id === id)

  if (index === -1) {
    return c.json({error: "author not found"}, 404)
  }

  authors.splice(index, 1)

  return c.body(null, 204)
})

export default app;