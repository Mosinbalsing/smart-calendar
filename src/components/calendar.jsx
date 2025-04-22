"use client"

import { useState } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import { ChevronLeft, ChevronRight, Plus, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NoteModal } from "./note-modal"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

/**
 * Calendar component for displaying and managing notes
 * @param {Object} props
 * @param {Array} props.notes - Array of notes
 * @param {Function} props.onAddNote - Function to add a new note
 * @param {Function} props.onUpdateNote - Function to update a note
 * @param {Function} props.onDeleteNote - Function to delete a note
 */
export default function Calendar({ notes, onAddNote, onUpdateNote, onDeleteNote }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const handleDateClick = (day) => {
    setSelectedDate(day)
    setEditingNote(null)
    setIsModalOpen(true)
  }

  const handleNoteClick = (note, e) => {
    e.stopPropagation()
    setEditingNote(note)
    setSelectedDate(new Date(note.date))
    setIsModalOpen(true)
  }

  const getNotesForDate = (date) => {
    return notes.filter((note) => isSameDay(new Date(note.date), date))
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Calendar</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-medium">{format(currentMonth, "MMMM yyyy")}</div>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-medium py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: monthStart.getDay() }).map((_, index) => (
              <div key={`empty-start-${index}`} className="h-24 p-1 rounded-md" />
            ))}

            {monthDays.map((day) => {
              const dayNotes = getNotesForDate(day)
              const isToday = isSameDay(day, new Date())
              const hasReminder = dayNotes.some((note) => note.reminderEnabled)

              return (
                <motion.div
                  key={day.toString()}
                  whileHover={{ scale: 1.02 }}
                  className={`h-24 p-1 rounded-md border cursor-pointer relative ${
                    isSameMonth(day, currentMonth)
                      ? isToday
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                      : "text-muted-foreground bg-muted/50"
                  }`}
                  onClick={() => handleDateClick(day)}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>{format(day, "d")}</span>
                    <div className="flex items-center gap-1">
                      {hasReminder && <Bell className="h-3 w-3 text-primary" />}
                      {dayNotes.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {dayNotes.length}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-1 space-y-1 max-h-[calc(100%-24px)] overflow-hidden">
                    <TooltipProvider>
                      {dayNotes.slice(0, 2).map((note) => (
                        <Tooltip key={note.id}>
                          <TooltipTrigger asChild>
                            <div
                              className={`text-xs truncate rounded px-1 py-0.5 ${
                                note.color ? `bg-${note.color}-100 dark:bg-${note.color}-900/30` : "bg-secondary"
                              }`}
                              onClick={(e) => handleNoteClick(note, e)}
                            >
                              {note.emoji} {note.title}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{note.title}</p>
                            {note.reminderEnabled && (
                              <p className="text-xs flex items-center mt-1">
                                <Bell className="h-3 w-3 mr-1" />
                                Reminder at {note.reminderTime}
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </TooltipProvider>

                    {dayNotes.length > 2 && (
                      <div className="text-xs text-muted-foreground">+{dayNotes.length - 2} more</div>
                    )}
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5 absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedDate(day)
                      setEditingNote(null)
                      setIsModalOpen(true)
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </motion.div>
              )
            })}

            {Array.from({ length: 6 - Math.floor((monthDays.length + monthStart.getDay() - 1) / 7) }).map(
              (_, index) => (
                <div key={`empty-end-${index}`} className="h-24 p-1 rounded-md" />
              ),
            )}
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
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
