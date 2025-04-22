"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PanelLeft, Plus, Bell, PinOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NoteModal } from "./note-modal"

/**
 * Sidebar component for displaying featured notes
 * @param {Object} props
 * @param {Array} props.notes - Array of all notes
 * @param {Array} props.featuredNotes - Array of featured note IDs
 * @param {Function} props.onAddNote - Function to add a new note
 * @param {Function} props.onUpdateNote - Function to update a note
 * @param {Function} props.onDeleteNote - Function to delete a note
 * @param {Function} props.onToggleFeature - Function to toggle featured status
 */
export function Sidebar({ notes, featuredNotes, onAddNote, onUpdateNote, onDeleteNote, onToggleFeature }) {
  const [isOpen, setIsOpen] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [editingNote, setEditingNote] = useState(null)

  // Filter notes that are featured
  const featuredNotesList = notes.filter((note) => featuredNotes.includes(note.id))

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const handleAddNote = () => {
    setSelectedDate(new Date())
    setEditingNote(null)
    setIsModalOpen(true)
  }

  const handleEditNote = (note) => {
    setEditingNote(note)
    setSelectedDate(new Date(note.date))
    setIsModalOpen(true)
  }

  const handleToggleFeature = (noteId) => {
    onToggleFeature(noteId)
  }

  return (
    <>
      <div className={`fixed top-0 left-0 h-full transition-all duration-300 z-30 ${isOpen ? "w-80" : "w-12"}`}>
        <Card className="h-full rounded-none rounded-r-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
            {isOpen && <CardTitle className="text-lg">Featured Notes</CardTitle>}
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="ml-auto">
              <PanelLeft className="h-5 w-5" />
            </Button>
          </CardHeader>

          {isOpen && (
            <CardContent className="p-3">
              <Button variant="outline" className="w-full mb-4" onClick={handleAddNote}>
                <Plus className="h-4 w-4 mr-2" /> Add Note
              </Button>

              <ScrollArea className="h-[calc(100vh-140px)]">
                <div className="space-y-4 pr-2">
                  <AnimatePresence>
                    {featuredNotesList.length > 0 ? (
                      featuredNotesList.map((note, index) => (
                        <motion.div
                          key={note.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`relative p-4 rounded-lg shadow-md cursor-pointer ${
                            note.color ? `bg-${note.color}-100 dark:bg-${note.color}-900/30` : "bg-card"
                          }`}
                          style={{
                            marginTop: index > 0 ? "-10px" : "0",
                            zIndex: 10 - index,
                          }}
                          onClick={() => handleEditNote(note)}
                        >
                          <div className="absolute top-2 right-2 flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleFeature(note.id)
                              }}
                            >
                              <PinOff className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="text-2xl font-bold mb-1">{format(new Date(note.date), "d")}</div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {format(new Date(note.date), "MMMM yyyy")}
                          </div>

                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{note.emoji}</span>
                            <h3 className="font-medium">{note.title}</h3>
                          </div>

                          {note.reminderEnabled && (
                            <div className="flex items-center text-xs text-muted-foreground mt-2">
                              <Bell className="h-3 w-3 mr-1" />
                              <span>Reminder at {note.reminderTime}</span>
                            </div>
                          )}
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No featured notes yet. Pin notes to see them here.
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </CardContent>
          )}
        </Card>
      </div>

      <div className={`transition-all duration-300 ${isOpen ? "ml-80" : "ml-12"}`}>
        {/* This is where the main content will go */}
      </div>

      <AnimatePresence>
        {isModalOpen && selectedDate && (
          <NoteModal
            date={selectedDate}
            note={editingNote}
            onClose={() => setIsModalOpen(false)}
            onSave={(note) => {
              if (editingNote) {
                onUpdateNote(note)
              } else {
                onAddNote(note)
              }
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
    </>
  )
}
