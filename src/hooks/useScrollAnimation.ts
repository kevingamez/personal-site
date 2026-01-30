import { useEffect, useRef } from 'preact/hooks'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface ScrollAnimationOptions {
  animation?: 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scale'
  delay?: number
  duration?: number
  stagger?: number
  start?: string
}

export function useScrollAnimation<T extends HTMLElement>(
  options: ScrollAnimationOptions = {}
) {
  const ref = useRef<T>(null)
  const {
    animation = 'fadeUp',
    delay = 0,
    duration = 0.8,
    start = 'top 85%'
  } = options

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current

    // Set initial state based on animation type
    const initialState: gsap.TweenVars = { opacity: 0 }
    const animateState: gsap.TweenVars = {
      opacity: 1,
      duration,
      delay,
      ease: 'power3.out'
    }

    switch (animation) {
      case 'fadeUp':
        initialState.y = 60
        animateState.y = 0
        break
      case 'fadeIn':
        // Just opacity
        break
      case 'slideLeft':
        initialState.x = 100
        animateState.x = 0
        break
      case 'slideRight':
        initialState.x = -100
        animateState.x = 0
        break
      case 'scale':
        initialState.scale = 0.8
        animateState.scale = 1
        break
    }

    gsap.set(element, initialState)

    const trigger = ScrollTrigger.create({
      trigger: element,
      start,
      onEnter: () => {
        gsap.to(element, animateState)
      },
      once: true
    })

    return () => {
      trigger.kill()
    }
  }, [animation, delay, duration, start])

  return ref
}

export function useStaggerAnimation<T extends HTMLElement>(
  options: ScrollAnimationOptions & { childSelector?: string } = {}
) {
  const ref = useRef<T>(null)
  const {
    animation = 'fadeUp',
    delay = 0,
    duration = 0.6,
    stagger = 0.1,
    start = 'top 85%',
    childSelector = ':scope > *'
  } = options

  useEffect(() => {
    if (!ref.current) return

    const container = ref.current
    const children = container.querySelectorAll(childSelector)

    if (children.length === 0) return

    // Set initial state
    const initialState: gsap.TweenVars = { opacity: 0 }
    const animateState: gsap.TweenVars = {
      opacity: 1,
      duration,
      delay,
      stagger,
      ease: 'power3.out'
    }

    switch (animation) {
      case 'fadeUp':
        initialState.y = 40
        animateState.y = 0
        break
      case 'fadeIn':
        break
      case 'slideLeft':
        initialState.x = 60
        animateState.x = 0
        break
      case 'slideRight':
        initialState.x = -60
        animateState.x = 0
        break
      case 'scale':
        initialState.scale = 0.9
        animateState.scale = 1
        break
    }

    gsap.set(children, initialState)

    const trigger = ScrollTrigger.create({
      trigger: container,
      start,
      onEnter: () => {
        gsap.to(children, animateState)
      },
      once: true
    })

    return () => {
      trigger.kill()
    }
  }, [animation, delay, duration, stagger, start, childSelector])

  return ref
}
