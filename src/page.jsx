"use client"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModeToggle } from "@/components/mode-toggle"
import DateCalculator from "@/components/date-calculator"
import BirthDateCalculator from "@/components/birth-date-calculator"
import Calendar from "@/components/calendar"
import NotesList from "@/components/notes-list"
import { WeatherWidget } from "@/components/weather-widget"
import { ReminderForm } from "@/components/reminder-form"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { Bell, Calculator, CalendarDays, Info } from "lucide-react"
import { Sidebar } from "@/components/sidebar"

// Alarm sound
const ALARM_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"

export default function Home() {
  const [notes, setNotes] = useState(() => {
    if (typeof window !== "undefined") {
      const savedNotes = localStorage.getItem("calendar-notes")
      return savedNotes ? JSON.parse(savedNotes) : []
    }
    return []
  })

  const [featuredNotes, setFeaturedNotes] = useState(() => {
    if (typeof window !== "undefined") {
      const savedFeaturedNotes = localStorage.getItem("calendar-featured-notes")
      return savedFeaturedNotes ? JSON.parse(savedFeaturedNotes) : []
    }
    return []
  })

  const [reminders, setReminders] = useState(() => {
    if (typeof window !== "undefined") {
      const savedReminders = localStorage.getItem("calendar-reminders")
      return savedReminders ? JSON.parse(savedReminders) : []
    }
    return []
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("calendar")
  const { toast } = useToast()
  const alarmAudioRef = useRef(null)

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== "undefined") {
      alarmAudioRef.current = new Audio(ALARM_SOUND_URL)
    }
  }, [])

  // Check for reminders on load and periodically
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date()
      const today = now.toISOString().split("T")[0]
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()

      // Check regular reminders
      reminders.forEach((reminder) => {
        if (reminder.date === today) {
          const [reminderHour, reminderMinute] = reminder.time.split(":").map(Number)

          // Check if the reminder time matches current time (within the same minute)
          if (reminderHour === currentHour && reminderMinute === currentMinute && !reminder.notified) {
            // Update reminder to mark as notified
            const updatedReminders = reminders.map((r) => (r.id === reminder.id ? { ...r, notified: true } : r))
            setReminders(updatedReminders)
            localStorage.setItem("calendar-reminders", JSON.stringify(updatedReminders))

            // Show toast notification
            toast({
              title: "Reminder",
              description: reminder.title,
            })

            // Show browser notification if enabled
            if (reminder.notificationEnabled && "Notification" in window && Notification.permission === "granted") {
              new Notification("Reminder", {
                body: reminder.title,
                icon: "/favicon.ico",
              })
            }

            // Play sound if enabled
            if (reminder.soundEnabled && alarmAudioRef.current) {
              alarmAudioRef.current.play().catch((err) => {
                console.error("Error playing alarm sound:", err)
              })
            }
          }
        }
      })

      // Check for note reminders
      notes.forEach((note) => {
        if (note.reminderEnabled && note.date === today && !note.reminderNotified) {
          // Update note to mark reminder as notified
          const updatedNotes = notes.map((n) => (n.id === note.id ? { ...n, reminderNotified: true } : n))
          setNotes(updatedNotes)
          localStorage.setItem("calendar-notes", JSON.stringify(updatedNotes))

          // Show toast notification
          toast({
            title: "Note Reminder",
            description: note.title,
          })

          // Show browser notification
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Note Reminder", {
              body: note.title,
              icon: "/favicon.ico",
            })
          }

          // Play sound
          if (alarmAudioRef.current) {
            alarmAudioRef.current.play().catch((err) => {
              console.error("Error playing alarm sound:", err)
            })
          }
        }
      })
    }

    // Check reminders immediately and then every minute
    checkReminders()
    const interval = setInterval(checkReminders, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [reminders, notes, toast])

  const addNote = (note) => {
    const newNotes = [...notes, note]
    setNotes(newNotes)
    localStorage.setItem("calendar-notes", JSON.stringify(newNotes))

    // If note is featured, add to featured notes
    if (note.featured) {
      const newFeaturedNotes = [...featuredNotes, note.id]
      setFeaturedNotes(newFeaturedNotes)
      localStorage.setItem("calendar-featured-notes", JSON.stringify(newFeaturedNotes))
    }

    toast({
      title: "Note added",
      description: `Note "${note.title}" has been added to ${note.date}`,
    })

    // If reminder is enabled, create a reminder for this note
    if (note.reminderEnabled && note.reminderTime) {
      addReminder({
        id: crypto.randomUUID(),
        title: `Note Reminder: ${note.title}`,
        date: note.date,
        time: note.reminderTime,
        priority: "medium",
        notificationEnabled: true,
        soundEnabled: true,
        createdAt: new Date().toISOString(),
        noteId: note.id,
      })
    }
  }

  const updateNote = (updatedNote) => {
    const newNotes = notes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    setNotes(newNotes)
    localStorage.setItem("calendar-notes", JSON.stringify(newNotes))

    // Handle featured status
    if (updatedNote.featured && !featuredNotes.includes(updatedNote.id)) {
      const newFeaturedNotes = [...featuredNotes, updatedNote.id]
      setFeaturedNotes(newFeaturedNotes)
      localStorage.setItem("calendar-featured-notes", JSON.stringify(newFeaturedNotes))
    } else if (!updatedNote.featured && featuredNotes.includes(updatedNote.id)) {
      const newFeaturedNotes = featuredNotes.filter((id) => id !== updatedNote.id)
      setFeaturedNotes(newFeaturedNotes)
      localStorage.setItem("calendar-featured-notes", JSON.stringify(newFeaturedNotes))
    }

    toast({
      title: "Note updated",
      description: `Note "${updatedNote.title}" has been updated`,
    })

    // Handle reminder updates
    if (updatedNote.reminderEnabled && updatedNote.reminderTime) {
      // Check if there's already a reminder for this note
      const existingReminder = reminders.find((r) => r.noteId === updatedNote.id)

      if (existingReminder) {
        // Update existing reminder
        const updatedReminders = reminders.map((r) =>
          r.noteId === updatedNote.id
            ? {
                ...r,
                title: `Note Reminder: ${updatedNote.title}`,
                date: updatedNote.date,
                time: updatedNote.reminderTime,
                notified: false,
              }
            : r,
        )
        setReminders(updatedReminders)
        localStorage.setItem("calendar-reminders", JSON.stringify(updatedReminders))
      } else {
        // Create new reminder
        addReminder({
          id: crypto.randomUUID(),
          title: `Note Reminder: ${updatedNote.title}`,
          date: updatedNote.date,
          time: updatedNote.reminderTime,
          priority: "medium",
          notificationEnabled: true,
          soundEnabled: true,
          createdAt: new Date().toISOString(),
          noteId: updatedNote.id,
        })
      }
    } else {
      // If reminder is disabled, remove any existing reminders for this note
      const filteredReminders = reminders.filter((r) => r.noteId !== updatedNote.id)
      if (filteredReminders.length !== reminders.length) {
        setReminders(filteredReminders)
        localStorage.setItem("calendar-reminders", JSON.stringify(filteredReminders))
      }
    }
  }

  const deleteNote = (id) => {
    const noteToDelete = notes.find((note) => note.id === id)
    const newNotes = notes.filter((note) => note.id !== id)
    setNotes(newNotes)
    localStorage.setItem("calendar-notes", JSON.stringify(newNotes))

    // Remove from featured notes if present
    if (featuredNotes.includes(id)) {
      const newFeaturedNotes = featuredNotes.filter((noteId) => noteId !== id)
      setFeaturedNotes(newFeaturedNotes)
      localStorage.setItem("calendar-featured-notes", JSON.stringify(newFeaturedNotes))
    }

    // Also delete any reminders associated with this note
    const newReminders = reminders.filter((r) => r.noteId !== id)
    if (newReminders.length !== reminders.length) {
      setReminders(newReminders)
      localStorage.setItem("calendar-reminders", JSON.stringify(newReminders))
    }

    toast({
      title: "Note deleted",
      description: noteToDelete ? `Note "${noteToDelete.title}" has been deleted` : "Note has been deleted",
    })
  }

  const addReminder = (reminder) => {
    const newReminders = [...reminders, reminder]
    setReminders(newReminders)
    localStorage.setItem("calendar-reminders", JSON.stringify(newReminders))
  }

  const toggleFeatureNote = (noteId) => {
    // Check if note is already featured
    const isFeatured = featuredNotes.includes(noteId)

    let newFeaturedNotes
    if (isFeatured) {
      // Remove from featured
      newFeaturedNotes = featuredNotes.filter((id) => id !== noteId)
      toast({
        title: "Note unpinned",
        description: "Note has been removed from featured notes",
      })
    } else {
      // Add to featured
      newFeaturedNotes = [...featuredNotes, noteId]
      toast({
        title: "Note pinned",
        description: "Note has been added to featured notes",
      })
    }

    setFeaturedNotes(newFeaturedNotes)
    localStorage.setItem("calendar-featured-notes", JSON.stringify(newFeaturedNotes))

    // Update the note's featured status
    const updatedNotes = notes.map((note) => (note.id === noteId ? { ...note, featured: !isFeatured } : note))
    setNotes(updatedNotes)
    localStorage.setItem("calendar-notes", JSON.stringify(updatedNotes))
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        notes={notes}
        featuredNotes={featuredNotes}
        onAddNote={addNote}
        onUpdateNote={updateNote}
        onDeleteNote={deleteNote}
        onToggleFeature={toggleFeatureNote}
      />

      <main className="flex-1 overflow-auto p-4 md:p-6 transition-all duration-300 ml-12 md:ml-80">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Smart Calendar</h1>
            <div className="flex items-center gap-4">
              <ModeToggle />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="date-calculator" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                <span className="hidden sm:inline">Date Calculator</span>
              </TabsTrigger>
              <TabsTrigger value="birth-calculator" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span className="hidden sm:inline">Birth Calculator</span>
              </TabsTrigger>
              <TabsTrigger value="reminders" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Reminders</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="space-y-8">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="md:col-span-3">
                  <Calendar notes={notes} onAddNote={addNote} onUpdateNote={updateNote} onDeleteNote={deleteNote} />
                </div>
                <div>
                  <WeatherWidget notes={notes} onUpdateNote={updateNote} onDeleteNote={deleteNote} />
                </div>
              </div>
              <NotesList
                notes={notes}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onUpdateNote={updateNote}
                onDeleteNote={deleteNote}
                featuredNotes={featuredNotes}
                onToggleFeature={toggleFeatureNote}
              />
            </TabsContent>

            <TabsContent value="date-calculator">
              <DateCalculator />
            </TabsContent>

            <TabsContent value="birth-calculator">
              <BirthDateCalculator />
            </TabsContent>

            <TabsContent value="reminders">
              <div className="grid gap-8 md:grid-cols-2">
                <ReminderForm onAddReminder={addReminder} />
                <div>
                  {reminders.length > 0 ? (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold">Upcoming Reminders</h2>
                      {reminders.map((reminder) => (
                        <div
                          key={reminder.id}
                          className={`p-4 rounded-lg border ${
                            reminder.priority === "high"
                              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                              : reminder.priority === "medium"
                                ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                                : "border-green-500 bg-green-50 dark:bg-green-900/20"
                          }`}
                        >
                          <div className="font-medium">{reminder.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(reminder.date).toLocaleDateString()} at {reminder.time}
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs">
                            {reminder.notificationEnabled && (
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">Notification</span>
                            )}
                            {reminder.soundEnabled && (
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">Sound Alert</span>
                            )}
                            {reminder.noteId && (
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">Note Reminder</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center p-8">
                        <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No reminders yet</h3>
                        <p className="text-muted-foreground">Create a reminder to get started</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Hidden audio element for alarm sound */}
          <audio id="alarmSound" src={ALARM_SOUND_URL} preload="auto" />

          <Toaster />
        </div>
      </main>
    </div>
  )
}
