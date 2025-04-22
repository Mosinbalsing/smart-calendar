"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { X, Bell, Clock, Plus, Pin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

/**
 * @typedef {Object} Note
 * @property {string} id - Unique identifier
 * @property {string} date - Date in YYYY-MM-DD format
 * @property {string} title - Note title
 * @property {string} emoji - Emoji icon
 * @property {string} [color] - Optional color
 * @property {string} createdAt - Creation timestamp
 * @property {boolean} [reminderEnabled] - Whether reminder is enabled
 * @property {string} [reminderTime] - Time for reminder in HH:MM format
 * @property {boolean} [reminderNotified] - Whether notification was sent
 * @property {boolean} [featured] - Whether note is featured
 * @property {string} [content] - Note content
 * @property {string} [category] - Note category
 */

/**
 * Note modal component for creating and editing notes
 * @param {Object} props
 * @param {Date} props.date - The date for the note
 * @param {Note|null} props.note - Existing note for editing, or null for new note
 * @param {Function} props.onClose - Function to call when closing the modal
 * @param {Function} props.onSave - Function to call when saving the note
 * @param {Function} props.onDelete - Function to call when deleting the note
 * @param {boolean} [props.allowMultiple] - Whether to allow adding multiple notes at once
 */
export function NoteModal({ date, note, onClose, onSave, onDelete, allowMultiple = false }) {
  const [notes, setNotes] = useState([
    {
      id: note?.id || crypto.randomUUID(),
      title: note?.title || "",
      emoji: note?.emoji || "📝",
      color: note?.color || "",
      reminderEnabled: note?.reminderEnabled || false,
      reminderTime: note?.reminderTime || "09:00",
      featured: note?.featured || false,
      content: note?.content || "",
      category: note?.category || "general",
      createdAt: note?.createdAt || new Date().toISOString(),
    },
  ])
  const [activeNoteIndex, setActiveNoteIndex] = useState(0)
  const [notificationPermission, setNotificationPermission] = useState("default")

  const EMOJI_OPTIONS = ["📝", "🎉", "⚠️", "💼", "🏠", "🍔", "🏋️", "🎮", "💤", "🎓", "🎵", "🎬", "📚", "💻", "🚗"]
  const COLOR_OPTIONS = [
    { value: "red", label: "Red" },
    { value: "green", label: "Green" },
    { value: "blue", label: "Blue" },
    { value: "yellow", label: "Yellow" },
    { value: "purple", label: "Purple" },
  ]
  const CATEGORY_OPTIONS = [
    { value: "general", label: "General" },
    { value: "work", label: "Work" },
    { value: "personal", label: "Personal" },
    { value: "health", label: "Health" },
    { value: "finance", label: "Finance" },
    { value: "education", label: "Education" },
    { value: "entertainment", label: "Entertainment" },
  ]

  // Check notification permission on component mount
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [onClose])

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      try {
        const permission = await Notification.requestPermission()
        setNotificationPermission(permission)
      } catch (error) {
        console.error("Error requesting notification permission:", error)
      }
    }
  }

  const handleAddNote = () => {
    setNotes([
      ...notes,
      {
        id: crypto.randomUUID(),
        title: "",
        emoji: "📝",
        color: "",
        reminderEnabled: false,
        reminderTime: "09:00",
        featured: false,
        content: "",
        category: "general",
        createdAt: new Date().toISOString(),
      },
    ])
    setActiveNoteIndex(notes.length)
  }

  const handleRemoveNote = (index) => {
    if (notes.length === 1) {
      onClose()
      return
    }

    const newNotes = [...notes]
    newNotes.splice(index, 1)
    setNotes(newNotes)

    if (activeNoteIndex >= index && activeNoteIndex > 0) {
      setActiveNoteIndex(activeNoteIndex - 1)
    }
  }

  const updateNoteField = (index, field, value) => {
    const newNotes = [...notes]
    newNotes[index] = { ...newNotes[index], [field]: value }
    setNotes(newNotes)
  }

  const handleSaveAll = () => {
    // Filter out notes with empty titles
    const validNotes = notes.filter((n) => n.title.trim() !== "")

    if (validNotes.length === 0) {
      onClose()
      return
    }

    // Save each valid note
    validNotes.forEach((noteData) => {
      const updatedNote = {
        ...noteData,
        date: format(date, "yyyy-MM-dd"),
        reminderTime: noteData.reminderEnabled ? noteData.reminderTime : null,
        reminderNotified: false,
      }

      onSave(updatedNote)
    })
  }

  const activeNote = notes[activeNoteIndex]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-background rounded-lg shadow-lg w-full max-w-2xl p-6"
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 9999 }} // Ensure it's on top of everything
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{note ? "Edit Note" : "Add Note"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {allowMultiple && notes.length > 1 && (
          <div className="flex overflow-x-auto gap-2 mb-4 pb-2">
            {notes.map((note, index) => (
              <Button
                key={note.id}
                variant={activeNoteIndex === index ? "default" : "outline"}
                size="sm"
                className="flex-shrink-0"
                onClick={() => setActiveNoteIndex(index)}
              >
                {note.emoji} {note.title || `Note ${index + 1}`}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="flex-shrink-0" onClick={handleAddNote}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        )}

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-4 pr-2">
            <div>
              <Label className="text-sm font-medium">Date</Label>
              <div className="p-2 bg-muted rounded-md mt-1 text-2xl font-bold">{format(date, "PPPP")}</div>
            </div>

            <div>
              <Label htmlFor="title" className="text-sm font-medium">
                Title
              </Label>
              <Input
                id="title"
                value={activeNote.title}
                onChange={(e) => updateNoteField(activeNoteIndex, "title", e.target.value)}
                placeholder="Enter note title"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="content" className="text-sm font-medium">
                Content
              </Label>
              <Textarea
                id="content"
                value={activeNote.content}
                onChange={(e) => updateNoteField(activeNoteIndex, "content", e.target.value)}
                placeholder="Enter note content"
                className="mt-1 min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emoji" className="text-sm font-medium">
                  Emoji
                </Label>
                <div className="grid grid-cols-5 gap-2 mt-1">
                  {EMOJI_OPTIONS.map((e) => (
                    <Button
                      key={e}
                      type="button"
                      variant={activeNote.emoji === e ? "default" : "outline"}
                      className="h-10 text-lg"
                      onClick={() => updateNoteField(activeNoteIndex, "emoji", e)}
                    >
                      {e}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="color" className="text-sm font-medium">
                    Color Label
                  </Label>
                  <Select
                    value={activeNote.color}
                    onValueChange={(value) => updateNoteField(activeNoteIndex, "color", value)}
                  >
                    <SelectTrigger id="color" className="mt-1">
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No color</SelectItem>
                      {COLOR_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm font-medium">
                    Category
                  </Label>
                  <Select
                    value={activeNote.category}
                    onValueChange={(value) => updateNoteField(activeNoteIndex, "category", value)}
                  >
                    <SelectTrigger id="category" className="mt-1">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="my-2" />

            <div className="grid grid-cols-2 gap-4">
              {/* Reminder Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reminder" className="text-sm font-medium flex items-center gap-2">
                      <Bell className="h-4 w-4" /> Set Reminder
                    </Label>
                    <p className="text-xs text-muted-foreground">Get notified on this date</p>
                  </div>
                  {notificationPermission === "granted" ? (
                    <Switch
                      id="reminder"
                      checked={activeNote.reminderEnabled}
                      onCheckedChange={(checked) => updateNoteField(activeNoteIndex, "reminderEnabled", checked)}
                    />
                  ) : (
                    <Button type="button" variant="outline" size="sm" onClick={requestNotificationPermission}>
                      Enable Notifications
                    </Button>
                  )}
                </div>

                {activeNote.reminderEnabled && (
                  <div className="flex items-center space-x-2 pt-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={activeNote.reminderTime}
                      onChange={(e) => updateNoteField(activeNoteIndex, "reminderTime", e.target.value)}
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              {/* Featured Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="featured" className="text-sm font-medium flex items-center gap-2">
                      <Pin className="h-4 w-4" /> Featured Note
                    </Label>
                    <p className="text-xs text-muted-foreground">Pin this note to sidebar</p>
                  </div>
                  <Switch
                    id="featured"
                    checked={activeNote.featured}
                    onCheckedChange={(checked) => updateNoteField(activeNoteIndex, "featured", checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-between pt-4 mt-4 border-t">
          {allowMultiple && (
            <Button
              variant="outline"
              onClick={() => handleRemoveNote(activeNoteIndex)}
              disabled={notes.length === 1 && !note}
            >
              Remove Note
            </Button>
          )}

          {note && !allowMultiple && (
            <Button variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          )}

          <div className="flex gap-2 ml-auto">
            {allowMultiple && (
              <Button variant="outline" onClick={handleAddNote}>
                <Plus className="h-4 w-4 mr-1" /> Add Another
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={
                allowMultiple
                  ? handleSaveAll
                  : () =>
                      onSave({
                        ...activeNote,
                        date: format(date, "yyyy-MM-dd"),
                        reminderTime: activeNote.reminderEnabled ? activeNote.reminderTime : null,
                        reminderNotified: false,
                      })
              }
              disabled={notes.every((n) => !n.title.trim())}
            >
              {allowMultiple ? "Save All" : "Save"}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
