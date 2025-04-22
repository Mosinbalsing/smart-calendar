"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Cloud,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  MapPin,
  Sun,
  Wind,
  Bell,
  Thermometer,
  Droplets,
  CloudFog,
  CloudLightning,
} from "lucide-react"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { format, addDays } from "date-fns"
import { NoteModal } from "./note-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// /**
//  * Weather widget component that shows current weather and forecast
//  * @param {Object} props
//  * @param {Array} props.notes - Array of notes
//  * @param {Function} props.onUpdateNote - Function to update a note
//  * @param {Function} props.onDeleteNote - Function to delete a note
//  */
export function WeatherWidget({ notes, onUpdateNote, onDeleteNote }) {
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [loading, setLoading] = useState(true)
  const [todayNotes, setTodayNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("today")
  const [location, setLocation] = useState(null)

  // Get current date in YYYY-MM-DD format for comparing with notes
  const today = format(new Date(), "yyyy-MM-dd")

  useEffect(() => {
    // Filter notes for today
    const notesForToday = notes.filter((note) => note.date === today)
    setTodayNotes(notesForToday)
  }, [notes, today])

  useEffect(() => {
    // Start with loading state
    setLoading(true)

    // Function to generate mock weather data
    const generateMockWeather = (date, baseTemp) => {
      const conditions = ["sunny", "cloudy", "rainy", "snowy", "windy", "drizzle", "foggy", "stormy"]
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)]
      // Vary temperature slightly from the base
      const tempVariation = Math.floor(Math.random() * 6) - 3
      const temperature = baseTemp + tempVariation

      return {
        date: format(date, "yyyy-MM-dd"),
        temperature,
        condition: randomCondition,
        humidity: Math.floor(Math.random() * 50) + 30, // 30-80%
        windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
        precipitation: Math.floor(Math.random() * 100), // 0-100%
      }
    }

    // Function to set mock weather data as fallback
    const setMockWeatherData = () => {
      setTimeout(() => {
        const baseTemp = Math.floor(Math.random() * 30) + 5 // Random temp between 5-35°C

        // Current weather
        const currentWeather = {
          temperature: baseTemp,
          condition: ["sunny", "cloudy", "rainy", "snowy", "windy", "drizzle"][Math.floor(Math.random() * 6)],
          location: "Location unavailable",
          city: "Your City",
          humidity: Math.floor(Math.random() * 50) + 30, // 30-80%
          windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
          feelsLike: baseTemp - Math.floor(Math.random() * 5), // Feels slightly cooler
        }

        // 5-day forecast
        const forecastData = []
        for (let i = 1; i <= 5; i++) {
          forecastData.push(generateMockWeather(addDays(new Date(), i), baseTemp))
        }

        setWeather(currentWeather)
        setForecast(forecastData)
        setLoading(false)
      }, 1000)
    }

    // Check if geolocation is available in the browser
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by this browser.")
      setMockWeatherData()
      return
    }

    // Try to get location with a timeout
    const locationTimeout = setTimeout(() => {
      console.log("Geolocation request timed out")
      setMockWeatherData()
    }, 5000) // 5 second timeout

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Clear the timeout since we got a position
          clearTimeout(locationTimeout)

          const { latitude, longitude } = position.coords
          setLocation({ latitude, longitude })

          // In a real app, you would fetch weather data from an API using these coordinates
          // For this example, we'll simulate an API call with mock data
          setTimeout(() => {
            const baseTemp = Math.floor(Math.random() * 30) + 5

            // Current weather
            const currentWeather = {
              temperature: baseTemp,
              condition: ["sunny", "cloudy", "rainy", "snowy", "windy", "drizzle"][Math.floor(Math.random() * 6)],
              location: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
              humidity: Math.floor(Math.random() * 50) + 30,
              windSpeed: Math.floor(Math.random() * 20) + 5,
              feelsLike: baseTemp - Math.floor(Math.random() * 5),
            }

            // 5-day forecast
            const forecastData = []
            for (let i = 1; i <= 5; i++) {
              forecastData.push(generateMockWeather(addDays(new Date(), i), baseTemp))
            }

            // Get city name from coordinates
            getCityFromCoordinates(latitude, longitude).then((city) => {
              setWeather({
                ...currentWeather,
                city: city,
              })
              setForecast(forecastData)
              setLoading(false)
            })
          }, 1000)
        },
        (error) => {
          // Clear the timeout since we got an error
          clearTimeout(locationTimeout)
          console.log("Geolocation error:", error.message)
          setMockWeatherData()
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      )
    } catch (error) {
      // Clear the timeout if there's an exception
      clearTimeout(locationTimeout)
      console.log("Error accessing geolocation:", error)
      setMockWeatherData()
    }
  }, [])

  // In a real app, this would be an API call to a geocoding service
  const getCityFromCoordinates = async (lat, lon) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, you would use a reverse geocoding API
        // For this example, we'll return a random city name
        const cities = [
          "New York",
          "London",
          "Tokyo",
          "Paris",
          "Sydney",
          "Berlin",
          "Toronto",
          "Mumbai",
          "Cairo",
          "Rio de Janeiro",
        ]
        resolve(cities[Math.floor(Math.random() * cities.length)])
      }, 500)
    })
  }

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case "sunny":
        return <Sun className="h-10 w-10 text-yellow-500" />
      case "cloudy":
        return <Cloud className="h-10 w-10 text-gray-400" />
      case "rainy":
        return <CloudRain className="h-10 w-10 text-blue-400" />
      case "snowy":
        return <CloudSnow className="h-10 w-10 text-blue-200" />
      case "windy":
        return <Wind className="h-10 w-10 text-gray-500" />
      case "drizzle":
        return <CloudDrizzle className="h-10 w-10 text-blue-300" />
      case "foggy":
        return <CloudFog className="h-10 w-10 text-gray-300" />
      case "stormy":
        return <CloudLightning className="h-10 w-10 text-purple-400" />
      default:
        return <Sun className="h-10 w-10 text-yellow-500" />
    }
  }

  const getSmallWeatherIcon = (condition) => {
    const iconClass = "h-5 w-5"
    switch (condition) {
      case "sunny":
        return <Sun className={`${iconClass} text-yellow-500`} />
      case "cloudy":
        return <Cloud className={`${iconClass} text-gray-400`} />
      case "rainy":
        return <CloudRain className={`${iconClass} text-blue-400`} />
      case "snowy":
        return <CloudSnow className={`${iconClass} text-blue-200`} />
      case "windy":
        return <Wind className={`${iconClass} text-gray-500`} />
      case "drizzle":
        return <CloudDrizzle className={`${iconClass} text-blue-300`} />
      case "foggy":
        return <CloudFog className={`${iconClass} text-gray-300`} />
      case "stormy":
        return <CloudLightning className={`${iconClass} text-purple-400`} />
      default:
        return <Sun className={`${iconClass} text-yellow-500`} />
    }
  }

  const handleNoteClick = (note) => {
    setSelectedNote(note)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Weather Forecast</CardTitle>
          <CardDescription>{weather ? weather.city : "Loading location..."}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="today" className="flex-1">
                Today
              </TabsTrigger>
              <TabsTrigger value="forecast" className="flex-1">
                5-Day Forecast
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today">
              {loading ? (
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[80px]" />
                  </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  {weather && (
                    <>
                      <div className="flex items-center">
                        <div className="mr-4">{getWeatherIcon(weather.condition)}</div>
                        <div>
                          <div className="text-2xl font-bold">{weather.temperature}°C</div>
                          <div className="text-muted-foreground capitalize">{weather.condition}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                          <Thermometer className="h-4 w-4 mb-1 text-orange-500" />
                          <span className="text-xs text-muted-foreground">Feels Like</span>
                          <span className="font-medium">{weather.feelsLike}°C</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                          <Droplets className="h-4 w-4 mb-1 text-blue-500" />
                          <span className="text-xs text-muted-foreground">Humidity</span>
                          <span className="font-medium">{weather.humidity}%</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                          <Wind className="h-4 w-4 mb-1 text-gray-500" />
                          <span className="text-xs text-muted-foreground">Wind</span>
                          <span className="font-medium">{weather.windSpeed} km/h</span>
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground mt-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{weather.city}</span>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="forecast">
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-[80px]" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-[60px]" />
                    </div>
                  ))}
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                  {forecast.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                      <div className="w-20">
                        <div className="font-medium">{format(new Date(day.date), "EEE")}</div>
                        <div className="text-xs text-muted-foreground">{format(new Date(day.date), "MMM d")}</div>
                      </div>
                      <div>{getSmallWeatherIcon(day.condition)}</div>
                      <div className="text-right">
                        <div className="font-medium">{day.temperature}°C</div>
                        <div className="text-xs text-muted-foreground capitalize">{day.condition}</div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Today's Notes</CardTitle>
          <CardDescription>{format(new Date(), "MMMM d, yyyy")}</CardDescription>
        </CardHeader>
        <CardContent>
          {todayNotes.length > 0 ? (
            <div className="space-y-2">
              {todayNotes.map((note) => (
                <motion.div
                  key={note.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-2 rounded-md cursor-pointer ${
                    note.color ? `bg-${note.color}-100 dark:bg-${note.color}-900/30` : "bg-muted"
                  }`}
                  onClick={() => handleNoteClick(note)}
                >
                  <div className="flex items-center gap-2">
                    <span>{note.emoji}</span>
                    <span className="font-medium truncate">{note.title}</span>
                  </div>
                  {note.content && <p className="text-xs text-muted-foreground mt-1 truncate">{note.content}</p>}
                  {note.reminderEnabled && (
                    <div className="text-xs text-muted-foreground mt-1 flex items-center">
                      <Bell className="h-3 w-3 mr-1" />
                      <span>Reminder at {note.reminderTime}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">No notes for today</p>
          )}
        </CardContent>
      </Card>

      {isModalOpen && selectedNote && (
        <NoteModal
          date={new Date(selectedNote.date)}
          note={selectedNote}
          onClose={() => setIsModalOpen(false)}
          onSave={(note) => {
            onUpdateNote(note)
            setIsModalOpen(false)
          }}
          onDelete={() => {
            onDeleteNote(selectedNote.id)
            setIsModalOpen(false)
          }}
        />
      )}
    </div>
  )
}
