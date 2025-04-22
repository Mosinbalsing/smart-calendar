"use client"

import React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Bell, CalendarIcon, Clock, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"



export function ReminderForm({ onAddReminder }) {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState(undefined)
  const [time, setTime] = useState("")
  const [priority, setPriority] = useState("medium")
  const [notificationEnabled, setNotificationEnabled] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState("default")
  const { toast } = useToast()

  // Check notification permission on component mount
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      try {
        const permission = await Notification.requestPermission()
        setNotificationPermission(permission)

        if (permission === "granted") {
          setNotificationEnabled(true)
          toast({
            title: "Notifications enabled",
            description: "You will receive notifications for your reminders",
          })
        } else {
          toast({
            title: "Notification permission denied",
            description: "Please enable notifications in your browser settings",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error)
        toast({
          title: "Error enabling notifications",
          description: "There was a problem enabling notifications",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Notifications not supported",
        description: "Your browser does not support notifications",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!title || !date || !time) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const reminder = {
      id: crypto.randomUUID(),
      title,
      date: format(date, "yyyy-MM-dd"),
      time,
      priority,
      notificationEnabled,
      soundEnabled,
      createdAt: new Date().toISOString(),
    }

    onAddReminder(reminder)

    // Reset form
    setTitle("")
    setDate(undefined)
    setTime("")
    setPriority("medium")

    toast({
      title: "Reminder set",
      description: `Reminder "${title}" has been set for ${format(date, "PPP")} at ${time}`,
    })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Set Reminder
          </CardTitle>
          <CardDescription>Create a new reminder for your calendar</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter reminder title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications when reminders are due</p>
                </div>
                {notificationPermission === "granted" ? (
                  <Switch id="notifications" checked={notificationEnabled} onCheckedChange={setNotificationEnabled} />
                ) : (
                  <Button type="button" variant="outline" size="sm" onClick={requestNotificationPermission}>
                    Enable
                  </Button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sound"
                  checked={soundEnabled}
                  onCheckedChange={(checked) => setSoundEnabled(checked === true)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="sound" className="flex items-center gap-1">
                    <Volume2 className="h-3 w-3" /> Play sound with notification
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Set Reminder
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
}
