const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "testApi/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

mongoose
  .connect(
    "mongodb+srv://amanyddv:luXI9NeTkJttgDP0@cluster0.3bawqzz.mongodb.net/vedsartest?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

const UserData = mongoose.model(
  "UserData",
  new mongoose.Schema({
    name: { type: String, required: true },
    imageUrl: { type: String, required: false },
  })
);

app.get("/", async (req, res) => {
  res.send("hello");
});

app.get("/info", async (req, res) => {
  try {
    const data = await UserData.find();
    res.json(data);
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.post("/deleteUser", async (req, res) => {
  console.log(req.body);
  try {
    const deletedData = await UserData.findByIdAndDelete(req.body.id);
    if (!deletedData) {
      return res.json({ error: "Data not found" });
    }
    res.json({ message: "Data deleted successfully", deletedData });
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.post("/updateUser", upload.single("image"), async (req, res) => {
  console.log(req.body);

  const { id, name } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const userData = await UserData.findById(id);
    if (!userData) {
      return res.json({ error: "Data not found" });
    }

    userData.name = name || userData.name;
    userData.imageUrl = imageUrl || userData.imageUrl;

    await userData.save();

    res.json(userData);

  } catch (error) {
    console.log(error);
    res.json({ error: error.message });
  }
});

app.post("/userData", upload.single("image"), async (req, res) => {
  console.log(req);
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const newData = new UserData({
      name: req.body.name,
      imageUrl,
    });
    console.log(newData);
    await newData.save();
    res.json(newData);
  } catch (error) {
    res.json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
