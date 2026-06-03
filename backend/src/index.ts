import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./modules/auth/auth.routes";
import userRouter from "./modules/user/user.routes";

const app = express();
app.use(express.json());
app.use(cookieParser());

const port = process.env.PORT ?? 8000;

app.get("/", (req, res) => {
  res.send("Server is live");
});

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => console.log(`Server running on port ${port}`));
}
