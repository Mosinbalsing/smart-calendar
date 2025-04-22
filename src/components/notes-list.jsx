"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Search, Edit, Trash2, Bell, Pin, PinOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NoteModal } from "./note-modal"
import { motion, AnimatePresence } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

/**
 * Notes list component for displaying and filtering notes
 * @param {Object} props
 * @param {Array} props.notes - Array of notes
 * @param {string} props.searchTerm - Current search term
 * @param {Function} props.setSearchTerm - Function to update search term
 * @param {Function} props.onUpdateNote - Function to update a note
 * @param {Function} props.onDeleteNote - Function to delete a note
 * @param {Array} props.featuredNotes - Array of featured note IDs
 * @param {Function} props.onToggleFeature - Function to toggle featured status
 */
export default function NotesList({
  notes,
  searchTerm,
  setSearchTerm,
  onUpdateNote,
  onDeleteNote,
  featuredNotes = [],
  onToggleFeature,
}) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [filterTag, setFilterTag] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [showRemindersOnly, setShowRemindersOnly] = useState(false)
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)

  const uniqueEmojis = Array.from(new Set(notes.map((note) => note.emoji)))
  const uniqueCategories = Array.from(new Set(notes.map((note) => note.category || "general")))

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesTag = filterTag ? note.emoji === filterTag : true
    const matchesCategory = filterCategory ? (note.category || "general") === filterCategory : true
    const matchesReminder = showRemindersOnly ? note.reminderEnabled : true
    const matchesFeatured = showFeaturedOnly ? featuredNotes.includes(note.id) : true
    return matchesSearch && matchesTag && matchesCategory && matchesReminder && matchesFeatured
  })

  const handleEditNote = (note) => {
    setEditingNote(note)
    setSelectedDate(new Date(note.date))
    setIsModalOpen(true)
  }

  const handleToggleFeature = (noteId, e) => {
    e.stopPropagation()
    onToggleFeature(noteId)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Notes</CardTitle>
          <div className="text-sm text-muted-foreground">
            {filteredNotes.length} note{filteredNotes.length !== 1 ? "s" : ""}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger className="w-full md:w-[140px]">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tags</SelectItem>
                  {uniqueEmojis.map((emoji) => (
                    <SelectItem key={emoji} value={emoji}>
                      {emoji} {emoji}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant={showRemindersOnly ? "default" : "outline"}
                className="w-full md:w-auto"
                onClick={() => setShowRemindersOnly(!showRemindersOnly)}
              >
                <Bell className="h-4 w-4 mr-2" />
                Reminders
              </Button>

              <Button
                variant={showFeaturedOnly ? "default" : "outline"}
                className="w-full md:w-auto"
                onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
              >
                <Pin className="h-4 w-4 mr-2" />
                Featured
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {filteredNotes.length > 0 ? (
                filteredNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-3 rounded-lg flex items-start justify-between ${
                      note.color ? `bg-${note.color}-100 dark:bg-${note.color}-900/30` : "bg-muted"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{note.emoji}</span>
                        <h3 className="font-medium">{note.title}</h3>
                        <div className="flex gap-1">
                          {note.reminderEnabled && <Bell className="h-4 w-4 text-primary" />}
                          {featuredNotes.includes(note.id) && <Pin className="h-4 w-4 text-primary" />}
                        </div>
                      </div>
                      {note.content && <p className="text-sm text-muted-foreground mt-1 truncate">{note.content}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(note.date), "MMMM d, yyyy")}
                          {note.reminderEnabled && ` • Reminder at ${note.reminderTime}`}
                        </p>
                        {note.category && (
                          <Badge variant="outline" className="text-xs">
                            {note.category.charAt(0).toUpperCase() + note.category.slice(1)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleToggleFeature(note.id, e)}
                        title={featuredNotes.includes(note.id) ? "Unpin note" : "Pin note"}
                      >
                        {featuredNotes.includes(note.id) ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditNote(note)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDeleteNote(note.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No notes found. Try adjusting your filters or add a new note.
                </div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {isModalOpen && selectedDate && (
          <NoteModal
            date={selectedDate}
            note={editingNote}
            onClose={() => setIsModalOpen(false)}
            onSave={(note) => {
              onUpdateNote(note)
              setIsModalOpen(false)
            }}
            onDelete={() => {
              if (editingNote) {
                onDeleteNote(editingNote.id)
              }
              setIsModalOpen(false)
            }}
            allowMultiple={true}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
