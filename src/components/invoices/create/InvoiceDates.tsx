import { useEffect } from "react";
import { HiOutlineCalendarDays } from "react-icons/hi2";
import DatePicker from "../../form/date-picker";

interface InvoiceDatesProps {
  issueDate: string;
  setIssueDate: (date: string) => void;
  dueDate: string;
  setDueDate: (date: string) => void;
}

export default function InvoiceDates({
  issueDate,
  setIssueDate,
  dueDate,
  setDueDate,
}: InvoiceDatesProps) {
  
  // Logic: If Issue Date pushes past Due Date, auto-update Due Date
  useEffect(() => {
    if (issueDate && dueDate && new Date(issueDate) > new Date(dueDate)) {
      setDueDate(issueDate);
    }
  }, [issueDate, dueDate, setDueDate]);

  return (
    <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/[0.05] shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineCalendarDays className="text-brand-500 size-5" />
        <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
          Dates
        </h3>
      </div> 
      <div className="space-y-4">
        <div>
          <DatePicker
            id="invoice-issue-date"
            label="Invoice Issue Date"
            placeholder="Select date"
            defaultDate={issueDate}
            onChange={(_, dateStr) => setIssueDate(dateStr)}
          />
        </div>
        <div>
          <DatePicker
            id="invoice-due-date"
            label="Settlement Due Date"
            placeholder="Select due date"
            defaultDate={dueDate}
            onChange={(_, dateStr) => setDueDate(dateStr)}
            // Physically disable dates before the issue date
            options={{
              minDate: issueDate,
            }}
          />
        </div>
      </div>
    </div>
  );
}