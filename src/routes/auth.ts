import { sValidator } from "@hono/standard-validator"
import { Hono } from "hono"
import { z } from "zod"
import { UserTable } from "../db/schema.ts"
import { db } from "../db/db.ts"
import { hashPassword, verifyPassword} from "../lib/crypto.ts"
import { sign } from "hono/jwt"
import { env } from "../data/env.ts"

const JWT_EXPIRATION_SECONDS = 5 * 60 // 1 day

const app = new Hono()

const registerSchema = z.object({
  email: z.email().min(1),
  password: z.string().min(6),
})

const loginSchema = z.object({
  email: z.email().min(1),
  password: z.string().min(6),
})

app.get('/list', async (c) => {
  const users = await db.query.UserTable.findMany();
  return c.json(users)
})


app.post('/register', sValidator("json", registerSchema), async (c) => {
  const {email, password} = c.req.valid("json")
  const existingUser = await db.query.UserTable.findFirst({ where: { email } })

  if (existingUser != null) {
    return c.json({ error: "Email already exists" }, 400)
  }

  const passwordHash = await hashPassword(password)

  const [newUser] = await db.insert(UserTable).values({
    email: email,
    passwordHash: passwordHash,
  }).returning({ id: UserTable.id, email: UserTable.email })

  return c.json(newUser, 201)
})

app.post('/login', sValidator("json", loginSchema), async (c) => {
  const {email, password} = c.req.valid("json")
  const user = await db.query.UserTable.findFirst({ where: { email } })

  if (user == null) {
    return c.json({ error: "Invalid email or password" }, 401)
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    return c.json({ error: "Invalid email or password" }, 401)
  }

  const now = Math.floor(Date.now() / 1000)
  
  const token = await sign({exp: now + JWT_EXPIRATION_SECONDS, subject: user.id, email: user.email}, env.JWT_SECRET, "HS256" )

  return c.json({ token })
})

export default app;