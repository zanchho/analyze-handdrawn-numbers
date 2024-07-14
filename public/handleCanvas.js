const isRandomNoise = false

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("drawn-numbers")
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d")

const offsetX = canvas.offsetLeft
const offsetY = canvas.offsetTop

let isDrawing = false
let startPos
let currentPos
let prevPos

canvas.addEventListener("mousedown", e => {
  isDrawing = true
  startPos = {
    x: e.clientX - canvas.offsetLeft,
    y: e.clientY - canvas.offsetTop,
  }
  prevPos = startPos
  ctx.lineWidth = 60
  ctx.beginPath()
  ctx.arc(startPos.x, startPos.y, 30, 0, 4 * Math.PI, false)
  ctx.fill()
  draw()
})

canvas.addEventListener("mousemove", e => {
  if (!isDrawing) return
  currentPos = {
    x: e.clientX - canvas.offsetLeft,
    y: e.clientY - canvas.offsetTop,
  }
  draw()
})

canvas.addEventListener("mouseup", () => {
  isDrawing = false
  currentPos = null
  prevPos = null
})
canvas.addEventListener("mouseleave", () => {
  isDrawing = false
  currentPos = null
  prevPos = null
})

function draw() {
  if (!currentPos) return
  ctx.beginPath()
  ctx.moveTo(prevPos.x, prevPos.y)
  ctx.quadraticCurveTo(currentPos.x, currentPos.y, prevPos.x, prevPos.y)

  // ctx.lineTo()
  ctx.stroke()
  prevPos = currentPos
}

function drawRandomNoise(numParticles) {
  const oldColor = ctx.fillStyle
  // Set fill style

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF"
    let color = "#"
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    return color
  }
  for (let i = 0; i < numParticles; i++) {
    // Generate random position within the canvas
    ctx.fillStyle = getRandomColor()
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height

    // Draw a small circle at the random position
    ctx.beginPath()
    ctx.arc(x, y, 8, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = oldColor
}

function clearCanvas() {
  const oldfillstyle = ctx.fillStyle
  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = oldfillstyle
  if (isRandomNoise) drawRandomNoise(500)
}

function commitDrawing() {
  let dataUrl = canvas.toDataURL()
  postImage(dataUrl)
  // clearCanvas()
}

async function postImage(dataUrl) {
  const fetchResponse = await fetch(dataUrl)
  const blob = await fetchResponse.blob()

  const formData = new FormData()
  const imageName = "uploaded-image.png"
  formData.append("image", blob, imageName)

  try {
    const response = await fetch("http://127.0.0.1:3000/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    showPrediction(result.data, result.isRaw)
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error)
  }
}

function showPrediction(data, isRaw = false) {
  if (!data) return
  const prediction = isRaw ? data : res.prediction[0]

  if (isRaw) {
    for (let i = 0; i < 10; i++) {
      const el = document.getElementById("value-" + i)
      el.innerHTML = parseFloat(prediction[i] * 100).toFixed(2) + "%"
    }
  }
  //remove highlight
  for (let i = 0; i < 10; i++) {
    const el = document.getElementById("number-" + i)
    el.style = ""
  }
  const maxIndex = isRaw
    ? Object.keys(data).reduce((maxKey, key) => {
        return data[key] > data[maxKey] ? key : maxKey
      }, "0")
    : prediction
  const el = document.getElementById("number-" + maxIndex)
  el.style = "background-color: rgba(255,0,0,0.6)"
}

function createHTMLOptionList() {
  const el = document.getElementById("options")
  const min = 0,
    max = 9
  const innerTemplate =
    "<option id='number-%' value='%'>Number % || <div id='value-%'></div></option>"
  let innerHTMLList = ""
  for (let i = min; i <= max; i++) {
    const option = innerTemplate.replace(/%/g, i)
    innerHTMLList += option
  }
  el.innerHTML = innerHTMLList
}
createHTMLOptionList()
