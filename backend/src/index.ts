import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./modules/auth/auth.routes";
import userRouter from "./modules/user/user.routes";
import organisationRouter from "./modules/organisation/organisation.routes";
import boardRouter from "./modules/board/board.routes";
import issueRouter from "./modules/isuue/issue.routes";
import { env } from "./lib/env";

const app = express();

app.use(
  cors({
    origin: env.ALLOWED_ORIGINS,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

const port = env.PORT ?? 8000;

app.get("/", (req, res) => {
  res.send("Server is live");
});

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/org", organisationRouter);
app.use("/api/v1/org/:orgId/board", boardRouter);
app.use("/api/v1/org/:orgId/board/:boardId/issue", issueRouter);

if (env.NODE_ENV !== "production") {
  app.listen(port, () => console.log(`Server running on port ${port}`));
}
