import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es"; // si quieres español
registerLocale("es", es);

function FechaPicker({ initialDate, onChange }) {
  // initialDate puede ser null o un Date object
  const [startDate, setStartDate] = useState(initialDate ? new Date(initialDate) : null);

  const handleChange = (date) => {
    setStartDate(date);
    if (onChange) {
      // envía ISO (UTC) o solo fecha 'YYYY-MM-DD' según necesites
      const iso = date ? date.toISOString() : null;
      const ymd = date ? date.toISOString().slice(0, 10) : null; // 'YYYY-MM-DD'
      onChange({ dateObj: date, iso, ymd });
    }
  };

  return (
    <DatePicker
      selected={startDate}
      onChange={handleChange}
      dateFormat="yyyy-MM-dd"
      locale="es"
      placeholderText="Selecciona una fecha"
      className="form-control w-100 d-block"
      isClearable
      showPopperArrow={false}
      // minDate={new Date()} // ejemplo min
      // maxDate={new Date(2030, 11, 31)}
    />
  );
}

export default FechaPicker;
