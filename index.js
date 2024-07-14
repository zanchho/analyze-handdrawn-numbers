import express from "express"
import fs from "fs"
import path from "path"
import multer from "multer"
import ImageClassifier from "./ai/ImageClassifier.js"

const aiImageClassifier = new ImageClassifier()

//setting this to false is pretty good to generate Data by Drawing
const doTraining = true // Enables/Disables Training and File deletion

console.log("training AI locally")
if (doTraining)
  await aiImageClassifier.train(
    path.join("ai", "datasets"),
    path.join("ai", "test")
  )

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/") // Save the file to the uploads directory
  },
  filename: function (req, file, cb) {
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

      const aiResult = doTraining ? await sendToAI(filePath) : {}

      // Delete the Image after processing
      if (doTraining) fs.unlinkSync(filePath)

      // Send the AI analysis result back to the client
      res.json({ message: "Image uploaded successfully", ...aiResult })
    } catch (error) {
      console.error(`Error processing image: ${error}`)
      res.status(500).send("Failed to process the image")
    }
  }
)

app.listen(3000, () =>
  console.log("Server running on port http://127.0.0.1:3000/")
)

async function sendToAI(imagePath) {
  const isRaw = true
  const res = await aiImageClassifier.predict(imagePath, isRaw)
  return { successful: true, data: res, isRaw: isRaw }
}
