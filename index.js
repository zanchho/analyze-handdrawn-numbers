import express from "express"
import fs from "fs"
import path from "path"
import sharp from "sharp" // sharp is a library for image processing
import multer from "multer"

// import { fileURLToPath } from "url"
//consts -- get the current directory of the file
// const { dirname } = path
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = dirname(__filename)

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/") // Specify the destination folder
  },
  filename: function (req, file, cb) {
    // Generate a unique filename for each uploaded file
    cb(null, `${path.basename(file.originalname)}`)
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
        return res.status(400).json({ message: "No image uploaded" })
      }
      const file = req.files.image[0]
      const filePath = file.path
      const grayImagePath = path.join("uploads", "gray-" + file.filename)

      // Convert image to grayscale using Sharp
      await sharp(filePath).grayscale().toFile(grayImagePath)

      // Assuming you have a function sendToAI that sends the image to your AI service and returns a promise
      const aiResult = await sendToAI(grayImagePath)

      // Delete the original and grayscale images after processing

      // fs.unlinkSync(filePath)
      // fs.unlinkSync(grayImagePath)

      // Send the AI analysis result back to the client
      res.json(Math.floor(Math.random() * 10))
    } catch (error) {
      console.error(`Error processing image: ${error}`)
      res.status(500).send("Failed to process the image")
    }
  }
)

app.post("/api/image", async (req, res) => {
  const image = await resolveImage(req.body)
  const grayImage = await sharp(image).grayscale().toBuffer()
  fs.writeFileSync("./testgray.png", grayImage)
  res.send("res...")
})

app.listen(3000, () =>
  console.log("Server running on port http://127.0.0.1:3000/")
)

//dataset
//schawrz-weiss /// pixel oder grid /// auswerten
async function resolveImage(incomingImage) {
  try {
    const base64Data = incomingImage.data.split(",")[1] // Extracting base64 data
    const buffer = Buffer.from(base64Data, "base64")
    console.log(buffer)
    fs.writeFileSync("./testimg.png", buffer)
    return buffer
  } catch (e) {
    console.log(e)
  }
}

async function sendToAI() {
  console.log("AI not implemented yet.")
  return { successful: true }
}

function getFsPath() {}
