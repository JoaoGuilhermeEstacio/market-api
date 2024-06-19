import express, { Express, Request, Response } from "express";
import bcrypt from "bcrypt"
import dotenv from "dotenv";
import prisma from "../prisma";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.post("/user", async (req: Request, res: Response) => {
  try {
    const { email, password, type, phoneNumber, username } = await req.body;
    
    let newUser
    await prisma.$connect()

    if (type == "google") {
      newUser = await prisma.users.create({ data: { email, username, type: "google", created_at: new Date() } })
    } else if (type == "email") {
      if (!password || !email) return res.status(400).json({
        message: 'Insufficient data.'
      }
      );
      const hashedPassword = await bcrypt.hash(password, 10);
      newUser = await prisma.users.create({
        data: {
          email,
          username,
          password: hashedPassword,
          type: "email",
          created_at: new Date()
        }
      })
    } else if (type == "phone") {
      if (!phoneNumber) return res.status(400).json({
        message: 'Insufficient data.'
      });
      const hashedPassword = await bcrypt.hash(password, 10);
      newUser = await prisma.users.create({
        data: {
          username,
          phoneNumber,
          password: hashedPassword,
          type: "phone",
          created_at: new Date()
        }
      })
    }
    return res.status(201).json({
      message: 'User created successfully!',
      user: newUser,
      success: true
    });
  } catch (error: any) {
    if (error.meta.target == "email_1") {
      return res.status(400).json({ statusText: "Email already exists." })
    } else if (error.meta.target == "phoneNumber_1") {
      return res.status(400).json({ statusText: "Phone Number already exists." });
    }

    return res.status(500).json({
      error: 'Server Error.'
    });
  }
  finally {
    await prisma.$disconnect()
  }
})

app.get("/users/:id", async (req: Request, res: Response) => {
  try {
    await prisma.$connect()
    let idReq = req.params.id
    let user = await prisma.users.findUnique({ where: { id: idReq } })

    return res.status(200).json({ user })


  } catch (error) {

    console.log(error);
    return res.status(500).json({ message: "Server Error" })
  } finally {
    await prisma.$disconnect()
  }
});

app.get("/users", async (req: Request, res: Response) => {
  try {
    await prisma.$connect()
    let users = await prisma.users.findMany()

    return res.status(200).json({ data: users })


  } catch (error) {

    console.log(error);
    return res.status(500).json({ message: "Server Error" })
  } finally {
    await prisma.$disconnect()
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});