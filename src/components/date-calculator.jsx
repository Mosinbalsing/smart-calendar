"use client";

import { useState } from "react";
import { format, add, sub } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";

export default function DateCalculator() {
  const [date, setDate] = useState(new Date());
  const [days, setDays] = useState(0);
  const [operation, setOperation] = useState("add");
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    if (days && date) {
      const newDate =
        operation === "add" ? add(date, { days }) : sub(date, { days });
      setResult(newDate);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <Card>
        <CardHeader>
          <CardTitle>Date Calculator</CardTitle>
          <CardDescription>
            Calculate a date by adding or subtracting days from a selected date
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="days">Number of Days</Label>
              <Input
                id="days"
                type="number"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="operation">Operation</Label>
              <Select
                value={operation}
                onValueChange={(value) => setOperation(value)}
              >
                <SelectTrigger id="operation">
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add</SelectItem>
                  <SelectItem value="subtract">Subtract</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleCalculate} className="w-full">
                Calculate
              </Button>
            </div>
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-4 rounded-lg bg-muted mt-4"
            >
              <h3 className="font-medium mb-2">Result:</h3>
              <p className="text-2xl font-bold">{format(result, "PPPP")}</p>
              <p className="text-muted-foreground">
                Day of week: {format(result, "EEEE")}
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
