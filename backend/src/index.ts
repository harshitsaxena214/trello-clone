import express from "express";

const app = express();
app.use(express.json());

const port = process.env.PORT ?? 8000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/", (req, res) => {
  res.send("Server is upppp!");
});
