import { useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("invoice");
  
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
          {t("create.sections.dates")}
        </h3>
      </div> 
      <div className="space-y-4">
        <div>
          <DatePicker
            id="invoice-issue-date"
            label={t("create.sections.issue_date")}
            placeholder={t("create.placeholders.select_date")}
            defaultDate={issueDate}
            onChange={(_, dateStr) => setIssueDate(dateStr)}
          />
        </div>
        <div>
          <DatePicker
            id="invoice-due-date"
            label={t("create.sections.due_date")}
            placeholder={t("create.placeholders.select_due_date")}
            defaultDate={dueDate}
            onChange={(_, dateStr) => setDueDate(dateStr)}
            options={{
              minDate: issueDate,
            }}
          />
        </div>
      </div>
    </div>
  );
}