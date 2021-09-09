// terrain-travel
let canvas, ctx, map
let viewportX = 0.0, viewportY = 0.0

const KEYS = new Set()
const FLOOR_TILE = 0
const WALL_TILE = 1
const MAP_WIDTH = 40
const MAP_HEIGHT = 30
const SPEED = 10

//////////////////////////

const getImage = (name) => {
  const img = new Image()
  img.src = `./sprites/${name}.png`
  return img
}
let dirtFloorTiles = [getImage('dirt1'), getImage('dirt2'), getImage('dirt3')]
let dirtWallTiles = [getImage('dirt-wall1'), getImage('dirt-wall2')]
let grassFloorTiles = [getImage('grass1'), getImage('grass2'), getImage('grass3')]
let grassWallTiles = [getImage('shrubs1'), getImage('shrubs2')]
let stoneFloorTiles = [getImage('stone1'), getImage('stone2'), getImage('stone3')]
let stoneWallTiles = [getImage('stone-wall1'), getImage('stone-wall2')]

const createNewMap = (fromMap) =>
  new Array(MAP_WIDTH).fill().map((_, x) =>
    new Array(MAP_HEIGHT).fill().map((__, y) => (fromMap?.[x]?.[y] ?? FLOOR_TILE)))

const forEachCell = (map, callback) => {
  const newMap = createNewMap(map)
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      newMap[x][y] = callback(x, y, map[x][y]) ?? map[x][y]
    }
  }
  return newMap
}

const smoothMap = (map) =>
  forEachCell(map, (x, y, cell) => {
    const isEdge = (
      (y === 0 || y === MAP_HEIGHT - 1) ||
      (x === 0 || x === MAP_WIDTH - 1)
    )
    if (isEdge) return WALL_TILE

    // average the surrounding tiles
    const defaultTile = FLOOR_TILE
    const average = (
      (map[x - 1]?.[y - 1] ?? defaultTile) +
      (map[x + 0]?.[y - 1] ?? defaultTile) +
      (map[x + 1]?.[y - 1] ?? defaultTile) +
      (map[x - 1]?.[y + 0] ?? defaultTile) +
      (map[x + 1]?.[y + 0] ?? defaultTile) +
      (map[x - 1]?.[y + 1] ?? defaultTile) +
      (map[x + 0]?.[y + 1] ?? defaultTile) +
      (map[x + 1]?.[y + 1] ?? defaultTile)
    ) / 8

    return Math.round(average)
  })


///////////////////////

const draw = (tick) => {
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = 'green'
  const tileSize = 32
  const numHoriztonalTiles = Math.floor(canvas.width / tileSize) + 1
  const numVerticalTiles = Math.floor(canvas.width / tileSize) + 1
  ctx.beginPath()
  for (let x = 0; x < numHoriztonalTiles; x += 1) {
    for (let y = 0; y < numVerticalTiles; y += 1) {
      if (x < MAP_WIDTH && y < MAP_HEIGHT) {
        const isFloorTile = (map[x][y] === FLOOR_TILE)
        const sprites = isFloorTile ? stoneFloorTiles : stoneWallTiles
        const spriteTileIndex = ((x + y) % sprites.length)
        const sprite = sprites[spriteTileIndex]
        ctx.drawImage(sprite, x * tileSize - viewportX, y * tileSize - viewportY)
      }
    }
  }
  ctx.stroke()

  /*
  ctx.font = '40px Arial'
  ctx.fillStyle = 'white'
  ctx.textBaseline = 'top'
  ctx.fillText(`Accel: ${acceleration.toFixed(2)}`, 20, 20)
  ctx.fillText(`Vel: ${velocity.toFixed(2)}`, 20, 70)
  */
}

const update = (tick) => {
  if (KEYS.has('ArrowDown')) {
    viewportY += SPEED
  }
  if (KEYS.has('ArrowUp')) {
    viewportY -= SPEED
  }
  if (KEYS.has('ArrowLeft')) {
    viewportX -= SPEED
  }
  if (KEYS.has('ArrowRight')) {
    viewportX += SPEED
  }
}

const loop = (tick = 0) => {
  update(tick)
  draw(tick)
  requestAnimationFrame(loop)
}

(function init() {
  console.log('Terrain Travel')

  // initialize canvas
  canvas = document.createElement('canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  document.body.appendChild(canvas)
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })
  window.addEventListener('keyup', (e) => void KEYS.delete(e.key))
  window.addEventListener('keydown', (e) => void KEYS.add(e.key))

  // initialize globals
  ctx = canvas.getContext('2d')
  map = forEachCell(createNewMap(), () => (Math.random() < 0.6 ? FLOOR_TILE : WALL_TILE))
  for (let i = 0; i < 3; i++)
    map = smoothMap(map)

  loop()
})()