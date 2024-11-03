let drawing = false
let erasing = false
let eraserSize = 25
let brushSize = 5
let brushStyle = 'blue'
let distanceThresh = 50
let prevBrushCoords

const calculateDist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1])

/**
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number }[]} landmarks
 */
export function getDraw(canvas, ctx, landmarks) {
  if (!landmarks) return
  if (!landmarks.length) return

  const indexTip = landmarks[8]
  const middleTip = landmarks[12]
  const ringTip = landmarks[16]

  const indexTipCoords = [indexTip.x * canvas.width, indexTip.y * canvas.height]
  const middleTipCoords = [middleTip.x * canvas.width, middleTip.y * canvas.height]
  const ringTipCoords = [ringTip.x * canvas.width, ringTip.y * canvas.height]

  const indexMiddleDist = calculateDist(indexTipCoords, middleTipCoords)
  const indexRingDist = calculateDist(indexTipCoords, ringTipCoords)

  if (indexMiddleDist > distanceThresh) {
    drawing = true

    if (prevBrushCoords) {
      ctx.save()
      ctx.strokeStyle = brushStyle
      ctx.lineWidth = brushSize
      ctx.beginPath()
      ctx.moveTo(...prevBrushCoords)
      ctx.lineTo(...indexTipCoords)
      ctx.closePath()
      ctx.stroke()
      ctx.restore()
    }

    prevBrushCoords = indexTipCoords
  } else {
    drawing = false
    prevBrushCoords = undefined
  }

  erasing = (indexMiddleDist < distanceThresh) && (indexRingDist < distanceThresh)

  if (erasing) {
    const [x, y] = middleTipCoords

    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, eraserSize, 0, Math.PI * 2, true)
    ctx.fill()
    ctx.restore()
  }
}
