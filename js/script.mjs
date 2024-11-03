import {
  DrawingUtils,
  FilesetResolver,
  HandLandmarker,
} from './packages/@mediapipe-tasks-vision.mjs'
import { getDraw } from './draw.mjs'
import { predictSign } from './sign.mjs'

/** @type HTMLVideoElement */
const video = document.getElementById('video')

/** @type HTMLCanvasElement */
const canvas = document.getElementById('canvas')
const canvasCtx = canvas.getContext('2d')

/** @type HTMLCanvasElement */
const drawCanvas = document.getElementById('drawing')
const drawCanvasCtx = drawCanvas.getContext('2d')

drawCanvasCtx.lineWidth = 5
drawCanvasCtx.strokeStyle = 'white'

/** @type HTMLInputElement */
const drawMode = document.getElementById('draw-mode')

/** @type HTMLButtonElement */
const clearButton = document.getElementById('clear')

/** @type HTMLInputElement */
const signMode = document.getElementById('sign-mode')

const drawingUtils = new DrawingUtils(canvasCtx)
const vision = await FilesetResolver.forVisionTasks('./wasm')
const handLandmarker = await HandLandmarker.createFromOptions(
  vision,
  {
    baseOptions: {
      modelAssetPath: './model/hand_landmarker.task',
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numHands: 2,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5
  }
)

let webcamRunning = false
let lastVideoTime = -1
let results

function predictFrame() {
  const startTimeMs = performance.now()

  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime
    results = handLandmarker.detectForVideo(video, startTimeMs)
  }

  canvasCtx.save()
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height)

  if (results.landmarks) {

    for (const landmarks of results.landmarks) {
      drawMode.checked && getDraw(drawCanvas, drawCanvasCtx, landmarks)
      signMode.checked && console.info(predictSign(landmarks))

      drawingUtils.drawConnectors(
        landmarks,
        HandLandmarker.HAND_CONNECTIONS,
        { color: '#00FF00', lineWidth: 5 }
      )

      drawingUtils.drawLandmarks(
        landmarks,
        { color: '#FF0000', lineWidth: 2 }
      )
    }
  }

  canvasCtx.restore()

  if (webcamRunning) {
    window.requestAnimationFrame(predictFrame)
  }
}

clearButton.addEventListener('click', () => {
  drawCanvasCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height)
})

navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    webcamRunning = true
    video.addEventListener('loadeddata', predictFrame)
    video.addEventListener('resize', () => {
      canvas.style.width = video.videoWidth
      canvas.style.height = video.videoHeight
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      drawCanvas.style.width = video.videoWidth
      drawCanvas.style.height = video.videoHeight
      drawCanvas.width = video.videoWidth
      drawCanvas.height = video.videoHeight
    })

    video.srcObject = stream
    video.play()
  })
  .catch(console.error)
