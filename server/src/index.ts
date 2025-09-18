import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "../prisma/generated/client";

// Charger les variables d'environnement
dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || "3000", 10);
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques du frontend en production
if (process.env.NODE_ENV === "production") {
  const clientPath = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientPath));
}

// Routes de base
app.get("/", (req, res) => {
  res.json({
    message: "API Server running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/health", async (req, res) => {
  try {
    // Tester la connexion à la base de données
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
});

// Routes pour les utilisateurs
app.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        posts: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch users",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { email, name } = req.body;
    const user = await prisma.user.create({
      data: {
        email,
        name,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({
      error: "Failed to create user",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Routes pour les posts
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: true,
      },
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch posts",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.post("/api/posts", async (req, res) => {
  try {
    const { title, content, authorId } = req.body;
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: parseInt(authorId),
      },
      include: {
        author: true,
      },
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({
      error: "Failed to create post",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Fallback pour le frontend en production (SPA)
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    // Si c'est une route API qui n'existe pas, retourner 404 JSON
    if (req.path.startsWith("/api")) {
      return res.status(404).json({
        error: "API route not found",
        path: req.originalUrl,
        method: req.method,
      });
    }
    // Sinon, servir le frontend
    const clientPath = path.join(__dirname, "../../client/dist/index.html");
    res.sendFile(clientPath);
  });
} else {
  // Gestion des erreurs 404 en développement
  app.use("*", (req, res) => {
    res.status(404).json({
      error: "Route not found",
      path: req.originalUrl,
      method: req.method,
    });
  });
}

// Gestion des erreurs globales
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Global error:", err);
    res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong",
    });
  }
);

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log("Starting graceful shutdown...");
  await prisma.$disconnect();
  console.log("Database disconnected");
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// Démarrer le serveur
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🗄️  Database URL: ${
      process.env.DATABASE_URL ? "configured" : "not configured"
    }`
  );
});
