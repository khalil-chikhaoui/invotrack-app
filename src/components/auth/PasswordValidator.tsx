import { useTranslation } from "react-i18next";
import { HiCheckCircle, HiMiniShieldCheck, HiMiniShieldExclamation } from "react-icons/hi2";

export default function PasswordValidator({ password }: { password: string }) {
  const { t } = useTranslation("auth");

  const rules = [
    { met: password.length >= 8, label: t("password_rules.length") },
    { met: /[A-Z]/.test(password), label: t("password_rules.uppercase") },
    { met: /[a-z]/.test(password), label: t("password_rules.lowercase") },
    { met: /[!@#$%^&*(),.?":{}|<>]/.test(password), label: t("password_rules.symbol") },
  ];

  const metCount = rules.filter(r => r.met).length;
  
  // Dynamic color logic for the strength bar
  const strengthColor = 
    metCount <= 1 ? "bg-error-500" : 
    metCount <= 3 ? "bg-warning-500" : 
    "bg-success-500";

  return (
    <div className="mt-3 px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
      
      {/* Strength Bar Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
          {metCount === 4 ? (
            <HiMiniShieldCheck className="size-3.5 text-success-500" />
          ) : (
            <HiMiniShieldExclamation className="size-3.5" />
          )}
          {t("signup.password_strength")}
        </span>
        <span className="text-[10px] font-medium text-gray-400">{metCount}/4</span>
      </div>

      {/* The Visual Strength Bar */}
      <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex gap-1">
        {[1, 2, 3, 4].map((step) => (
          <div 
            key={step}
            className={`h-full flex-1 transition-all duration-500 ${
              step <= metCount ? strengthColor : "bg-transparent"
            }`}
          />
        ))}
      </div>

      {/* Interactive Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
        {rules.map((rule, idx) => (
          <div 
            key={idx}
            className={`flex items-center gap-2 text-[11px] transition-all duration-300 ${
              rule.met ? "text-success-600 dark:text-success-400" : "text-gray-400 dark:text-gray-500"
            }`}
          >
            <HiCheckCircle className={`size-3.5 transition-transform duration-300 ${rule.met ? "scale-110" : "scale-100 opacity-20"}`} />
            <span>{rule.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}