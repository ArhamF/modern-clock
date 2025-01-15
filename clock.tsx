'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Settings } from 'lucide-react'

// Types for clock customization
type ClockFaceStyle = 'Classic' | 'Roman' | 'Minimal' | 'Dots' | 'Modern'
type MarkerStyle = 'Lines' | 'Dots' | 'Numbers' | 'Roman' | 'Minimal'

interface ClockCustomization {
  hourHandColor: string;
  minuteHandColor: string;
  secondHandColor: string;
  markerColor: string;
  showSecondHand: boolean;
  showDigitalTime: boolean;
  use24Hour: boolean;
  faceStyle: ClockFaceStyle;
  markerStyle: MarkerStyle;
}

// Roman numeral conversion helper
const romanNumerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI']

function ProjectCardAnimation({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Reduced rotation for subtler effect
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7.5, -7.5]), {
    damping: 30,
    stiffness: 200,
  })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7.5, 7.5]), {
    damping: 30,
    stiffness: 200,
  })

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function onMouseLeave() {
    mouseX.set(0)
    mouseY.set(0)
    setHovered(false)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="relative h-full perspective-1000"
    >
      <div 
        className={`
          w-full h-full rounded-xl
          transform transition-all duration-200
          ${hovered ? 'scale-[1.01]' : 'scale-100'}
        `}
      >
        {children}
      </div>
    </motion.div>
  )
}

const ClockMarkers = ({ style, color }: { 
  style: MarkerStyle; 
  color: string;
}) => {
  switch (style) {
    case 'Dots':
      return (
        <>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full transition-colors duration-500"
              style={{
                left: '50%',
                top: '50%',
                backgroundColor: color,
                transform: `rotate(${i * 30}deg) translate(-50%, -135px)`,
                transformOrigin: 'top center',
              }}
            />
          ))}
        </>
      )
    
    case 'Numbers':
      return (
        <>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute text-lg font-semibold transition-colors duration-500"
              style={{
                left: '50%',
                top: '50%',
                color: color,
                transform: `rotate(${i * 30}deg) translate(-50%, -120px) rotate(-${i * 30}deg)`,
                transformOrigin: 'center',
              }}
            >
              {((i + 3) % 12 || 12)}
            </div>
          ))}
        </>
      )
    
    case 'Roman':
      return (
        <>
          {romanNumerals.map((numeral, i) => (
            <div
              key={i}
              className="absolute text-lg font-serif transition-colors duration-500"
              style={{
                left: '50%',
                top: '50%',
                color: color,
                transform: `rotate(${i * 30}deg) translate(-50%, -120px) rotate(-${i * 30}deg)`,
                transformOrigin: 'center',
              }}
            >
              {numeral}
            </div>
          ))}
        </>
      )
    
    case 'Minimal':
      return (
        <>
          {[3, 6, 9, 12].map((num, i) => (
            <div
              key={i}
              className="absolute text-xl font-light transition-colors duration-500"
              style={{
                left: '50%',
                top: '50%',
                color: color,
                transform: `rotate(${(num * 30) - 90}deg) translate(-50%, -120px) rotate(-${(num * 30) - 90}deg)`,
                transformOrigin: 'center',
              }}
            >
              {num}
            </div>
          ))}
        </>
      )
    
    default: // 'Lines'
      return (
        <>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute transition-colors duration-500"
              style={{
                left: '50%',
                top: '50%',
                backgroundColor: color,
                width: i % 3 === 0 ? '2px' : '1px',
                height: i % 3 === 0 ? '16px' : '8px',
                transform: `rotate(${i * 30}deg) translate(-50%, -140px)`,
                transformOrigin: 'top center',
              }}
            />
          ))}
        </>
      )
  }
}

const getClockFaceStyle = (style: ClockFaceStyle) => {
  switch (style) {
    case 'Roman':
      return 'bg-gray-800/80 border-4 border-gray-700'
    case 'Minimal':
      return 'bg-black/50'
    case 'Dots':
      return 'bg-gray-900/70 border border-gray-800 border-dashed'
    case 'Modern':
      return 'bg-gradient-to-br from-gray-800/80 to-gray-900/80'
    case 'Classic':
    default:
      return 'bg-white/10'
  }
}

export default function Clock() {
  const [time, setTime] = useState(new Date())
  const [customization, setCustomization] = useState<ClockCustomization>({
    hourHandColor: '#FFFFFF',
    minuteHandColor: '#FFFFFF',
    secondHandColor: '#EF4444',
    markerColor: 'rgba(255, 255, 255, 0.5)',
    showSecondHand: true,
    showDigitalTime: true,
    use24Hour: false,
    faceStyle: 'Classic',
    markerStyle: 'Lines'
  })
  const [showSettings, setShowSettings] = useState(false)
  const settingsButtonRef = useRef<HTMLButtonElement>(null)
  const [settingsPosition, setSettingsPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (settingsButtonRef.current) {
      const rect = settingsButtonRef.current.getBoundingClientRect()
      setSettingsPosition({
        x: rect.x,
        y: rect.y
      })
    }
  }, [showSettings])

  const hours = time.getHours()
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()

  const secondDegrees = (seconds / 60) * 360
  const minuteDegrees = ((minutes * 60 + seconds) / 3600) * 360
  const hourDegrees = ((hours % 12) * 3600 + minutes * 60 + seconds) / (12 * 3600) * 360

  const formatDigitalTime = () => {
    let displayHours = customization.use24Hour ? hours : hours % 12 || 12
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const formattedMinutes = minutes.toString().padStart(2, '0')
    const formattedSeconds = seconds.toString().padStart(2, '0')
    
    return `${displayHours}:${formattedMinutes}${
      customization.showSecondHand ? `:${formattedSeconds}` : ''
    }${!customization.use24Hour ? ` ${ampm}` : ''}`
  }

  const clockFaceStyle = getClockFaceStyle(customization.faceStyle)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1B3E] via-[#2D2A54] to-[#1E1E3D] p-8 flex flex-col items-center justify-center">
      <ProjectCardAnimation>
        <motion.div 
          className="backdrop-blur-lg rounded-3xl shadow-2xl bg-white/5 relative overflow-visible"
          animate={{
            padding: showSettings ? "2rem 2rem 6rem 2rem" : "2rem",
            width: showSettings ? "auto" : "fit-content",
            minWidth: showSettings ? "500px" : "400px",
          }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0.0, 0.2, 1], // Smooth easing function
            width: {
              type: "spring",
              stiffness: 100,
              damping: 15
            }
          }}
        >
          <div className="flex flex-col items-center gap-8">
            <h2 className="text-2xl font-semibold text-gray-300">
              {customization.faceStyle} Clock
            </h2>

            <div className="relative w-80 h-80">
              <div className={`absolute inset-0 rounded-full ${clockFaceStyle} backdrop-blur transition-all duration-500`} />
              
              <ClockMarkers 
                style={customization.markerStyle}
                color={customization.markerColor}
              />

              {/* Hour Hand */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 origin-top"
                style={{
                  width: '4px',
                  height: '25%',
                  background: `linear-gradient(to bottom, ${customization.hourHandColor}, transparent)`,
                  transform: `rotate(${hourDegrees}deg)`,
                  opacity: 0.85,
                }}
              />

              {/* Minute Hand */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 origin-top"
                style={{
                  width: '4px',
                  height: '40%',
                  background: `linear-gradient(to bottom, ${customization.minuteHandColor}, transparent)`,
                  transform: `rotate(${minuteDegrees}deg)`,
                  opacity: 0.85,
                }}
              />

              {/* Second Hand */}
              {customization.showSecondHand && (
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 origin-top"
                  style={{
                    width: '2px',
                    height: '45%',
                    backgroundColor: customization.secondHandColor,
                    transform: `rotate(${secondDegrees}deg)`,
                    opacity: 0.7,
                  }}
                />
              )}

              {/* Center Dot */}
              <div className={`absolute left-1/2 top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 bg-gray-300 rounded-full transition-colors duration-500 z-10`} />

              {/* Digital Time Display */}
              {customization.showDigitalTime && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-xl font-mono text-gray-300">
                  {formatDigitalTime()}
                </div>
              )}
            </div>

            <div className="absolute bottom-4 right-4 flex items-center justify-end gap-4" style={{ minWidth: "700px" }}>
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{
                      duration: 0.2,
                      ease: "easeOut"
                    }}
                    className="flex gap-2 items-center bg-gray-900/60 backdrop-blur-md rounded-full p-2 border border-gray-800"
                  >
                    <select
                      value={customization.faceStyle}
                      onChange={(e) => setCustomization(prev => ({
                        ...prev,
                        faceStyle: e.target.value as ClockFaceStyle
                      }))}
                      className="px-3 py-1 rounded-full text-sm bg-gray-800/50 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Classic">Classic</option>
                      <option value="Roman">Roman</option>
                      <option value="Minimal">Minimal</option>
                      <option value="Dots">Dots</option>
                      <option value="Modern">Modern</option>
                    </select>

                    <select
                      value={customization.markerStyle}
                      onChange={(e) => setCustomization(prev => ({
                        ...prev,
                        markerStyle: e.target.value as MarkerStyle
                      }))}
                      className="px-3 py-1 rounded-full text-sm bg-gray-800/50 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Lines">Lines</option>
                      <option value="Dots">Dots</option>
                      <option value="Numbers">Numbers</option>
                      <option value="Roman">Roman</option>
                      <option value="Minimal">Minimal</option>
                    </select>

                    <motion.button
                      onClick={() => setCustomization(prev => ({ ...prev, showSecondHand: !prev.showSecondHand }))}
                      className="px-3 py-1 rounded-full text-sm bg-gray-800/50 text-white border border-gray-700 hover:bg-gray-700/50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {customization.showSecondHand ? 'Hide' : 'Show'} Seconds
                    </motion.button>
                    
                    <motion.button
                      onClick={() => setCustomization(prev => ({ ...prev, use24Hour: !prev.use24Hour }))}
                      className="px-3 py-1 rounded-full text-sm bg-gray-800/50 text-white border border-gray-700 hover:bg-gray-700/50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {customization.use24Hour ? '12h' : '24h'}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                ref={settingsButtonRef}
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-full bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="h-6 w-6" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </ProjectCardAnimation>
    </div>
  )
}

