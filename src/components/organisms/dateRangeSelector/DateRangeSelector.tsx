import { CircularProgress, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { addDays, eachDayOfInterval } from "date-fns";
import React from "react";
import type { Room } from "../../../types/room";
import Button from "../../atoms/button";

// interface DateRangeSelectorProps {}

const DateRangeSelector = () => {
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [results, setResults] = React.useState<Array<Room>>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleSetStartDate = (newStartDate: Date) => {
    if (endDate && newStartDate > endDate) {
      setEndDate(addDays(newStartDate, 1));
    }
    if (results.length > 0) {
      setResults([]);
    }
    setStartDate(newStartDate);
  };

  const handleSetEndDate = (newEndDate: Date) => {
    if (endDate && newEndDate < endDate) {
      return;
    }
    if (results.length > 0) {
      setResults([]);
    }
    setEndDate(newEndDate);
  };

  const resetDates = () => {
    setStartDate(null);
    setEndDate(null);
    setResults([]);
  };

  const handleSelectedDates = async () => {
    setLoading(true);
    if (!startDate || !endDate) return;
    if (startDate > endDate) return;

    const allDatesBetweenStartAndEndDate = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    fetch("/api/room/getRoomAvailabilityByDateRange", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(allDatesBetweenStartAndEndDate),
    })
      .then((response) => response.json())
      .then((data) => {
        setResults(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="flex flex-row items-center">
        <div className="mx-8">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={"Start Date"}
              value={startDate}
              disablePast
              onChange={(newValue: Date | null) => {
                newValue && handleSetStartDate(newValue);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
        </div>
        <div className="mx-8">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={"End Date"}
              value={endDate}
              disablePast
              minDate={startDate ?? undefined}
              disabled={!startDate}
              onChange={(newValue: Date | null) => {
                newValue && handleSetEndDate(newValue);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
        </div>
        <div className="mx-8">
          <Button
            label={results.length > 0 ? "Refresh" : "Search"}
            onClick={results.length > 0 ? resetDates : handleSelectedDates}
          />
        </div>
      </div>
      <div className="m-8 h-full">
        {results.length > 0 ? (
          results.map((room: Partial<Room>) => (
            <div
              className="flex text-black rounded-md border-2 border-gray-600 my-4"
              key={room._id}
            >
              <img
                style={{ width: 240, height: 240 }}
                src={`assets/Gallery/${room.imgPathName}`}
              />
              <div className="flex flex-1 justify-items-center">
                <div className="flex flex-col p-4">
                  <h2 className="block text-2xl">Room Name: {room.name}</h2>
                  <h2 className="block font-bold">Price: {room.priceRange}</h2>
                  <p className="block">Description: {room.description}</p>
                </div>
              </div>
              <button className="px-4 py-2 inline-block bg-transparent outline outline-1 hover:text-white hover:bg-gray-600 transition-colors">
                Book Room
              </button>
            </div>
          ))
        ) : loading ? (
          <div className="flex w-full h-screen justify-center align-middle">
            <CircularProgress />
          </div>
        ) : (
          <h1 className="text-black text-xl h-screen">
            Select a start and end date to see what rooms are available!
          </h1>
        )}
      </div>
    </div>
  );
};
export default DateRangeSelector;
