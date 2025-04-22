"use client"

import { useState, useEffect } from "react"
import { format, differenceInYears, differenceInMonths, differenceInDays, addYears, isAfter } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function BirthDateCalculator() {
  const [birthDate, setBirthDate] = useState(undefined)
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedDay, setSelectedDay] = useState("")
  const today = new Date()

  // Generate years (100 years back from current year)
  const years = Array.from({ length: 100 }, (_, i) => {
    const year = today.getFullYear() - i
    return { value: year.toString(), label: year.toString() }
  })

  // Generate months
  const months = [
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
  ]

  // Generate days based on selected month and year
  const getDaysInMonth = (year, month) => {
    if (!year || !month) return []

    const daysInMonth = new Date(Number.parseInt(year), Number.parseInt(month) + 1, 0).getDate()
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      return { value: day.toString(), label: day.toString() }
    })
  }

  const days = getDaysInMonth(selectedYear, selectedMonth)

  // Update birthDate when selectors change
  useEffect(() => {
    if (selectedYear && selectedMonth && selectedDay) {
      const newDate = new Date(
        Number.parseInt(selectedYear),
        Number.parseInt(selectedMonth),
        Number.parseInt(selectedDay),
      )
      setBirthDate(newDate)
    }
  }, [selectedYear, selectedMonth, selectedDay])

  // Update selectors when birthDate changes (from calendar)
  useEffect(() => {
    if (birthDate) {
      setSelectedYear(birthDate.getFullYear().toString())
      setSelectedMonth(birthDate.getMonth().toString())
      setSelectedDay(birthDate.getDate().toString())
    }
  }, [birthDate])

  const calculateAge = () => {
    if (!birthDate) return null

    const years = differenceInYears(today, birthDate)

    // Calculate months (after subtracting years)
    const dateWithYearsSubtracted = addYears(birthDate, years)
    const months = differenceInMonths(today, dateWithYearsSubtracted)

    // Calculate remaining days
    const dateWithMonthsSubtracted = new Date(today.getFullYear(), today.getMonth() - months, birthDate.getDate())
    let days = differenceInDays(today, dateWithMonthsSubtracted)

    // Adjust for month length differences
    if (days < 0) {
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate()
    }

    return { years, months, days }
  }

  const calculateNextBirthday = () => {
    if (!birthDate) return null

    const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())

    const nextYearBirthday = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate())

    const nextBirthday = isAfter(thisYearBirthday, today) ? thisYearBirthday : nextYearBirthday

    const daysUntilBirthday = differenceInDays(nextBirthday, today)

    return {
      date: nextBirthday,
      daysRemaining: daysUntilBirthday,
    }
  }

  const calculateZodiacSign = () => {
    if (!birthDate) return null

    const day = birthDate.getDate()
    const month = birthDate.getMonth() + 1 // JavaScript months are 0-indexed

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries ♈"
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus ♉"
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini ♊"
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer ♋"
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo ♌"
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo ♍"
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra ♎"
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio ♏"
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius ♐"
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn ♑"
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius ♒"
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Pisces ♓"

    return null
  }

  const calculateChineseZodiac = () => {
    if (!birthDate) return null

    const year = birthDate.getFullYear()
    const animals = [
      "Monkey",
      "Rooster",
      "Dog",
      "Pig",
      "Rat",
      "Ox",
      "Tiger",
      "Rabbit",
      "Dragon",
      "Snake",
      "Horse",
      "Goat",
    ]
    const index = (year - 4) % 12

    return animals[index]
  }

  const age = birthDate ? calculateAge() : null
  const nextBirthday = birthDate ? calculateNextBirthday() : null
  const zodiacSign = birthDate ? calculateZodiacSign() : null
  const chineseZodiac = birthDate ? calculateChineseZodiac() : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <Card>
        <CardHeader>
          <CardTitle>Birth Date Calculator</CardTitle>
          <CardDescription>Calculate your age and time until your next birthday</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select your birth date</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {years.map((year) => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedDay} onValueChange={setSelectedDay} disabled={!selectedYear || !selectedMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-sm font-medium">Or select from calendar</div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !birthDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {birthDate ? format(birthDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={birthDate}
                    onSelect={setBirthDate}
                    disabled={(date) => isAfter(date, new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {birthDate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4"
              >
                <div className="p-4 rounded-lg bg-muted">
                  <h3 className="font-medium mb-2">Your Age</h3>
                  <p className="text-2xl font-bold">
                    {age?.years} years, {age?.months} months, {age?.days} days
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted">
                  <h3 className="font-medium mb-2">Day of Birth</h3>
                  <p className="text-2xl font-bold">{format(birthDate, "EEEE")}</p>
                </div>
              </motion.div>
            )}
          </div>

          {birthDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="grid gap-4 md:grid-cols-2"
            >
              <div className="p-4 rounded-lg bg-muted">
                <h3 className="font-medium mb-2">Next Birthday</h3>
                <p className="text-xl font-bold">{format(nextBirthday?.date || new Date(), "PPPP")}</p>
                <p className="text-muted-foreground">{nextBirthday?.daysRemaining} days remaining</p>
              </div>

              <div className="p-4 rounded-lg bg-muted">
                <h3 className="font-medium mb-2">Zodiac Signs</h3>
                <p className="text-lg font-medium">{zodiacSign}</p>
                <p className="text-muted-foreground">Chinese Zodiac: {chineseZodiac}</p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
