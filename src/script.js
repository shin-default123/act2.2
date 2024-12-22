import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const simpleShadow = textureLoader.load('/textures/simpleShadow.jpg')  // Load the new simple shadow texture

/**
 * Lights
 */
// Ambient light with reduced intensity
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)  // Intensity set to 0.3
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
scene.add(ambientLight)

// Directional light with reduced intensity
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3)  // Intensity set to 0.3
directionalLight.position.set(2, 2, -1)
gui.add(directionalLight, 'intensity').min(0).max(1).step(0.001)
gui.add(directionalLight.position, 'x').min(-5).max(5).step(0.001)
gui.add(directionalLight.position, 'y').min(-5).max(5).step(0.001)
gui.add(directionalLight.position, 'z').min(-5).max(5).step(0.001)
directionalLight.castShadow = true  // Enable shadows for directional light

// Increase the shadow map resolution for better shadow quality
directionalLight.shadow.mapSize.width = 1024  // Set shadow map width
directionalLight.shadow.mapSize.height = 1024  // Set shadow map height

// Set shadow camera near and far planes for better control over the shadow rendering range
directionalLight.shadow.camera.near = 1  // Set the near plane of the shadow camera
directionalLight.shadow.camera.far = 6  // Set the far plane of the shadow camera

// Set the boundaries of the shadow camera's frustum
directionalLight.shadow.camera.top = 2
directionalLight.shadow.camera.right = 2
directionalLight.shadow.camera.bottom = -2
directionalLight.shadow.camera.left = -2

// Set the shadow radius for softer shadows
directionalLight.shadow.radius = 10  // Larger radius results in softer shadows

// Add CameraHelper to visualize the shadow camera's frustum
const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
scene.add(directionalLightCameraHelper)

// Hide the CameraHelper (set its visibility to false)
directionalLightCameraHelper.visible = false

scene.add(directionalLight)

// Spot light with reduced intensity
const spotLight = new THREE.SpotLight(0xffffff, 0.3, 10, Math.PI * 0.3)  // Intensity set to 0.3
spotLight.castShadow = true
spotLight.position.set(0, 2, 2)
scene.add(spotLight)
scene.add(spotLight.target)

// Update spotlight shadow settings
spotLight.shadow.mapSize.width = 1024  // Set the shadow map width to 1024
spotLight.shadow.mapSize.height = 1024  // Set the shadow map height to 1024

// Set the field of view for the spotlight's shadow camera (affects the shadow cone width)
spotLight.shadow.camera.fov = 30  // Field of view of 30 degrees

// Update near and far values of the spotlight shadow camera
spotLight.shadow.camera.near = 1  // Set the near plane of the shadow camera
spotLight.shadow.camera.far = 6  // Set the far plane of the shadow camera

// Add CameraHelper for the spotlight shadow camera
const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera)
scene.add(spotLightCameraHelper)

// Hide the spotlight CameraHelper (set its visibility to false)
spotLightCameraHelper.visible = false

// Point light with reduced intensity
const pointLight = new THREE.PointLight(0xffffff, 0.3)  // Intensity set to 0.3
pointLight.castShadow = true
pointLight.position.set(-1, 1, 0)  // Position the point light in the scene
scene.add(pointLight)

// Update point light shadow settings
pointLight.shadow.mapSize.width = 1024  // Set the shadow map width to 1024
pointLight.shadow.mapSize.height = 1024  // Set the shadow map height to 1024
pointLight.shadow.camera.near = 0.1  // Set the near plane of the point light shadow camera
pointLight.shadow.camera.far = 5  // Set the far plane of the point light shadow camera

// Add CameraHelper for the point light shadow camera
const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera)
scene.add(pointLightCameraHelper)

// Hide the point light CameraHelper (set its visibility to false)
pointLightCameraHelper.visible = false

/**
 * Materials
 */
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.7
gui.add(material, 'metalness').min(0).max(1).step(0.001)
gui.add(material, 'roughness').min(0).max(1).step(0.001)

/**
 * Objects
 */
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)
sphere.castShadow = true  // Sphere casts shadows
sphere.receiveShadow = false  // Sphere does not receive its own shadow

// Updated plane with MeshStandardMaterial
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material  // Using MeshStandardMaterial
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.5
plane.receiveShadow = true  // Plane receives shadows

// Apply the new simple shadow texture to the plane
plane.material.map = simpleShadow  // Apply the simple shadow texture

// Create the sphereShadow mesh, using transparency and simpleShadow texture
const sphereShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.5),
    new THREE.MeshBasicMaterial({
        color: 0x000000,  // Set color of the shadow (black)
        transparent: true,  // Enable transparency
        alphaMap: simpleShadow  // Use the simpleShadow texture as the alpha map
    })
)
sphereShadow.rotation.x = - Math.PI * 0.5  // Rotate the shadow plane to lie flat
sphereShadow.position.y = plane.position.y + 0.01  // Slightly raise the shadow above the plane to avoid z-fighting

scene.add(sphere, sphereShadow, plane)  // Add the sphere, shadow, and plane to the scene

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true  // Enable shadow map
renderer.shadowMap.type = THREE.PCFSoftShadowMap  // Use soft shadows

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update the sphere's position
    sphere.position.x = Math.cos(elapsedTime) * 1.5  // Move along the X axis
    sphere.position.z = Math.sin(elapsedTime) * 1.5  // Move along the Z axis
    sphere.position.y = Math.abs(Math.sin(elapsedTime * 3))  // Move up and down with a sine wave

    // Update the shadow's position to match the sphere
    sphereShadow.position.x = sphere.position.x
    sphereShadow.position.z = sphere.position.z

    // Adjust the opacity of the shadow based on the sphere's height
    sphereShadow.material.opacity = (1 - sphere.position.y) * 0.3  // The shadow is more opaque when the sphere is lower

    // Update controls
    controls.update()

    // Render the scene
    renderer.render(scene, camera)

    // Call the tick function again on the next frame
    window.requestAnimationFrame(tick)
}

tick()  // Start the animation loop

