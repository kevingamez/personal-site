import { useEffect, useRef } from 'preact/hooks'
import { useGameStore } from '../store/gameStore'

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { isDarkMode } = useGameStore()
  const isDarkRef = useRef(isDarkMode)
  const threeRef = useRef<any>(null)

  useEffect(() => {
    isDarkRef.current = isDarkMode
    if (threeRef.current?.scene) {
      import('three').then(THREE => {
        threeRef.current.scene.fog = new THREE.FogExp2(isDarkMode ? 0x0f172a : 0xf8fafc, 0.025)
      })
    }
  }, [isDarkMode])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let raf: number
    let cleanup: (() => void) | null = null

    import('three').then(THREE => {
      if (!container.isConnected) return

      const scene = new THREE.Scene()
      scene.fog = new THREE.FogExp2(isDarkRef.current ? 0x0f172a : 0xf8fafc, 0.025)

      const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100)
      camera.position.z = 5

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      renderer.setSize(innerWidth, innerHeight)
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
      renderer.setClearColor(0x000000, 0)
      container.appendChild(renderer.domElement)

      // Icosahedron wireframe
      const geo = new THREE.IcosahedronGeometry(1.8, 1)
      const mat = new THREE.MeshBasicMaterial({
        color: 0x3b82f6, wireframe: true, transparent: true, opacity: 0.18,
      })
      const mesh = new THREE.Mesh(geo, mat)
      scene.add(mesh)

      // Inner solid
      const innerGeo = new THREE.IcosahedronGeometry(1.2, 2)
      const innerMat = new THREE.MeshBasicMaterial({
        color: 0x3b82f6, transparent: true, opacity: 0.03,
      })
      const innerMesh = new THREE.Mesh(innerGeo, innerMat)
      scene.add(innerMesh)

      // Particles spread wider
      const particleCount = 400
      const positions = new Float32Array(particleCount * 3)
      for (let i = 0; i < particleCount; i++) {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const r = 2.5 + Math.random() * 6
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
        positions[i * 3 + 2] = r * Math.cos(phi)
      }
      const particleGeo = new THREE.BufferGeometry()
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const particleMat = new THREE.PointsMaterial({
        color: 0x3b82f6, size: 0.02, transparent: true, opacity: 0.5, sizeAttenuation: true,
      })
      const particles = new THREE.Points(particleGeo, particleMat)
      scene.add(particles)

      const mouse = new THREE.Vector2(0, 0)
      const onMouseMove = (e: MouseEvent) => {
        mouse.x = (e.clientX / innerWidth) * 2 - 1
        mouse.y = -(e.clientY / innerHeight) * 2 + 1
      }
      addEventListener('mousemove', onMouseMove)

      const clock = new THREE.Clock()
      threeRef.current = { scene, camera, renderer, mesh, particles, mouse, clock }

      const animate = () => {
        raf = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()

        mesh.rotation.x += 0.002
        mesh.rotation.y += 0.003
        mesh.rotation.x += (mouse.y * 0.3 - mesh.rotation.x) * 0.02
        mesh.rotation.y += (mouse.x * 0.3 - mesh.rotation.y) * 0.02

        innerMesh.rotation.x = mesh.rotation.x * 0.8
        innerMesh.rotation.y = mesh.rotation.y * 0.8

        const scale = 1 + Math.sin(t * 0.8) * 0.05
        mesh.scale.setScalar(scale)
        innerMesh.scale.setScalar(scale * 0.95)

        particles.rotation.y += 0.0005
        particles.rotation.x += 0.0002

        ;(mesh.material as THREE.MeshBasicMaterial).opacity = 0.15 + Math.sin(t * 1.2) * 0.06

        renderer.render(scene, camera)
      }
      animate()

      const onResize = () => {
        camera.aspect = innerWidth / innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(innerWidth, innerHeight)
      }
      addEventListener('resize', onResize)

      cleanup = () => {
        cancelAnimationFrame(raf)
        removeEventListener('mousemove', onMouseMove)
        removeEventListener('resize', onResize)
        renderer.dispose()
        geo.dispose(); mat.dispose()
        innerGeo.dispose(); innerMat.dispose()
        particleGeo.dispose(); particleMat.dispose()
        if (renderer.domElement.parentNode) {
          container.removeChild(renderer.domElement)
        }
      }
    })

    return () => {
      if (cleanup) cleanup()
      else cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
