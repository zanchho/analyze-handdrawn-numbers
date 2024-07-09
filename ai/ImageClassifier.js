import { NeuralNetwork } from "brain.js"
import sharp from "sharp"
import fs from "fs"
import path from "path"

class ImageClassifier {
  constructor(debug = false) {
    this.debug = debug
    this.size = 60 * 60
    this.net = new NeuralNetwork({
      inputLayerSize: this.size, // Adjusted based on expected input size
      hiddenLayers: [60],
      outputLayerSize: 10,
      activation: "sigmoid",
      debug: this.debug,
      log: details => {
        console.log(details)
      },
    })
  }

  async train(datasetDir) {
    console.log("Start Training")

    const trainingData = await this.prepareTrainingData(datasetDir)
    console.log("Training data processed:", trainingData.length)

    const maxIterations = trainingData.length // Maximum number of iterations
    let iterationCount = 0
    let bestValidationLoss = Infinity //TODO
    let earlyStopCounter = 0
    const patience = 50 // Number of epochs with no improvement after which training will be stopped

    while (iterationCount < maxIterations && earlyStopCounter < patience) {
      const training = trainingData.flatMap(({ input, output }) => ({
        input,
        output,
      }))

      const trained = this.net.train(training, {
        learningRate: 0.02, // Adjust based on experimentation
        iterations: 10,
        errorThresh: 0.001,
      })

      //   const validationLoss = this.validate(trainingData) // TODO

      //   if (validationLoss < bestValidationLoss) {
      //     bestValidationLoss = validationLoss
      //     earlyStopCounter = 0
      //   } else {
      //     earlyStopCounter++
      //   }
      console.log(
        `Iteration: ${iterationCount},\tError: ${trained.error}, \tValidation Loss: \${validationLoss}`
      )
      iterationCount += trained.iterations
    }

    console.log("Done training")
    console.log()
    const testData = await this.prepareTestData(path.join("ai", "test"))
    this.evaluateModel(this.net, testData)
  }
  async predict(imagePath) {
    console.log("Predicting on", imagePath)

    const inputData = await this.getUniversalInputData(imagePath)

    const prediction = this.net.run(inputData)
    console.log("Raw prediction", prediction)

    const maxIndex = prediction.indexOf(Math.max(...prediction))
    console.log("Predicted Image might be", maxIndex)

    return prediction
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
    return trainingData
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

    return testData
  }

  async evaluateModel(model, testData) {
    let correctPredictions = 0
    let totalPredictions = testData.length

    for (const { input, output } of testData) {
      const prediction = model.runInput(input)
      const correct = this.getCorrectPrediction(prediction, output)
      // i think its cool to see this
      if (!correct)
        console.log(
          `AI had guessed ${prediction.indexOf(
            Math.max(...prediction)
          )} but it was ${output.indexOf(Math.max(...output))}`
        )
      else
        console.log(
          `prediction was ${correct}: (${output.indexOf(Math.max(...output))})`
        )
      if (correct) correctPredictions++
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
function fillMissingElements(data, expectedSize) {
  while (data.length < expectedSize) {
    data.push(0) // Fill up with zeros
  }
  return data
}
function cutOverflow(data, expectedSize) {
  return data.slice(0, expectedSize)
}
