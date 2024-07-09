import express from "express"
import fs from "fs"
import path from "path"
import sharp from "sharp" // sharp is a library for image processing
import multer from "multer"
import ImageClassifier from "./ai/ImageClassifier.js"

const aiImageClassifier = new ImageClassifier()
const aiModelPath = path.join("ai", "model.json")

console.log("training AI locally")
await aiImageClassifier.train(path.join("ai", "test"))

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/") // Specify the destination folder
  },
  filename: function (req, file, cb) {
    // TODO Generate a unique filename for each uploaded file
    cb(null, `${Date.now()}-${path.basename(file.originalname)}`)
  },
})
const uploads = multer({ storage: storage })

const app = express()
app.use(express.json())
app.use(express.static("public"))

app.post(
  "/api/upload",
  uploads.fields([{ name: "image", maxCount: 1 }]),
  async (req, res) => {
    try {
      if (!req.files) {
        console.log("File not received")
        return res.status(400).json({ message: "No image uploaded" })
      }
      console.log("File received")
      const file = req.files.image[0]
      const filePath = file.path
      // Assuming you have a function sendToAI that sends the image to your AI service and returns a promise
      const aiResult = await sendToAI(filePath)

      // Delete the original and grayscale images after processing
      fs.unlinkSync(filePath)

      // Send the AI analysis result back to the client
      res.json({ message: "Image uploaded successfully", aiResult })
      // res.json({ message: "succ" })
    } catch (error) {
      console.error(`Error processing image: ${error}`)
      res.status(500).send("Failed to process the image")
    }
  }
)

app.listen(3000, () =>
  console.log("Server running on port http://127.0.0.1:3000/")
)

//dataset
//schawrz-weiss /// pixel oder grid /// auswerten
async function sendToAI(imagePath) {
  const res = await aiImageClassifier.predict(imagePath)
  console.log("res:", res)
  return { successful: true, data: res, test: Math.floor(Math.random() * 10) }
}
