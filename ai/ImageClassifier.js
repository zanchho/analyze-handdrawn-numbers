import { NeuralNetwork } from "brain.js"
import sharp from "sharp"
import fs from "fs"
import path from "path"

class ImageClassifier {
  constructor(debug = false) {
    this.debug = debug
    this.size = 60 * 60
    this.net = new NeuralNetwork({
      inputLayerSize: this.size,
      hiddenLayers: [
        Math.floor(this.size / 2),
        Math.floor(Math.sqrt(this.size)),
      ], // Images have x * Y so it will be sqrt
      outputLayerSize: 10,
      activation: "sigmoid",
      debug: false,
    })
  }

  async train(datasetDir, testsetDir) {
    const trainingData = await this.prepareTrainingData(datasetDir)
    console.log("Training data processed:", trainingData.length)

    console.log("Starting training")
    const trainingStartTime = Date.now()
    this.net.train(trainingData, {
      learningRate: 0.03,
      iterations: 50,
    })

    console.log("Done training")
    const trainingEnd = Date.now()
    const trainingTime = (trainingEnd - trainingStartTime) / 1000
    console.log(`Training took ${trainingTime} seconds.`)

    if (!testsetDir) return
    const testData = await this.prepareTestData(testsetDir)
    this.evaluateModel(this.net, testData)
  }
  async predict(imagePath, shouldReturnRawPrediction) {
    console.log("Predicting on", imagePath)

    const inputData = await this.getUniversalInputData(imagePath)

    const prediction = this.net.run(inputData)
    console.log("Raw prediction", prediction)
    if (!!shouldReturnRawPrediction) {
      return prediction
    }
    const maxIndex = prediction.indexOf(Math.max(...prediction))
    console.log("Predicted Image might be", maxIndex)

    return [maxIndex]
  }

  async prepareTrainingData(datasetDir) {
    const digits = fs.readdirSync(datasetDir)
    const trainingData = []

    for (const digit of digits) {
      const digitPath = path.join(datasetDir, digit)
      const filenames = fs.readdirSync(digitPath)

      for (const filename of filenames) {
        const imagePath = path.join(digitPath, filename)
        const inputData = await this.getUniversalInputData(imagePath)
        const outputData = Array(10).fill(0) // Assuming 10 digits
        outputData[digits.indexOf(digit)] = 1 // Set the output for this digit to 1

        trainingData.push({ input: inputData, output: outputData })
      }
    }
    return shuffleArray(trainingData)
  }
  async prepareTestData(testDir) {
    const digits = fs.readdirSync(testDir)
    const testData = []

    for (const digit of digits) {
      const digitPath = path.join(testDir, digit)
      const filenames = fs.readdirSync(digitPath)

      for (const filename of filenames) {
        const imagePath = path.join(digitPath, filename)
        const inputData = await this.getUniversalInputData(imagePath)
        const outputData = Array(10).fill(0) // Assuming 10 digits
        outputData[digits.indexOf(digit)] = 1 // Set the output for this digit to 1

        testData.push({ input: inputData, output: outputData })
      }
    }

    return shuffleArray(testData)
  }

  async evaluateModel(model, testData) {
    let correctPredictions = 0
    let totalPredictions = testData.length

    for (const { input, output } of testData) {
      const prediction = model.runInput(input)
      const correct = this.getCorrectPrediction(prediction, output)

      if (!correct)
        if (model.debug)
          console.log(
            `AI had guessed ${prediction.indexOf(
              Math.max(...prediction)
            )} but it was ${output.indexOf(Math.max(...output))}`
          )
        else {
          if (model.debug)
            console.log(
              `prediction was ${correct}: (${output.indexOf(
                Math.max(...output)
              )})`
            )
          correctPredictions++
        }
    }

    const accuracy = correctPredictions / totalPredictions
    console.log(`Test Accuracy: ${accuracy * 100}%`)
  }
  getCorrectPrediction(predict, expectedOutcome) {
    const correct =
      predict.indexOf(Math.max(...predict)) ===
      expectedOutcome.indexOf(Math.max(...expectedOutcome))
    return correct
  }
  async getUniversalInputData(imagePath) {
    const imageBuffer = await sharp(imagePath)
      .resize(60, 60)
      .grayscale()
      .toBuffer()

    const inputData = Array.from(imageBuffer)

    let normalizedData = inputData.map(pixelIntensity => {
      const normalized = pixelIntensity / 255
      return isNaN(normalized) ? 0 : normalized
    })

    //normalize to fit the AI-inputs
    if (normalizedData.length < this.size)
      normalizedData = fillMissingElements(normalizedData, this.size)
    if (normalizedData.length > this.size)
      normalizedData = cutOverflow(normalizedData, this.size)

    return normalizedData
  }
}

export default ImageClassifier
function shuffleArray(arr, iterations = 1) {
  if (arr.length === 0 || iterations === 0) return arr

  let counter = 0
  do {
    //fisher Yates shuffle because i used it before and it did good
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = arr[i]
      arr[i] = arr[j]
      arr[j] = temp
    }
    counter++
  } while (iterations >= counter)

  return arr
}

function fillMissingElements(data, expectedSize) {
  while (data.length < expectedSize) {
    data.push(0) // Fill up with zeros
  }
  return data
}
function cutOverflow(data, expectedSize) {
  return data.slice(0, expectedSize)
}
