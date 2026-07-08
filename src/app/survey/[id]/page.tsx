"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Fraunces, Inter } from "next/font/google";
import { submitSurvey } from "@/lib/api";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

interface Question {
  no: number;
  question: string;
  type: string;
}

interface Participant {
  id: number;
  email: string;
  ratingNo: number;
  status: string;
}

interface HotelRating {
  ratingNo: number;
  score: number;
  review: string;
}

const AGE_OPTIONS = [
  "18 - 24 years",
  "25 - 34 years",
  "35 - 44 years",
  "45 - 54 years",
  "55 - 64 years",
  "65 and above",
];

const GENDER_OPTIONS = ["Male", "Female"];

const EDUCATION_OPTIONS = [
  "School",
  "Diploma",
  "Undergraduate",
  "Graduate",
  "Post Graduate",
];

const DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle",
  "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle",
  "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala",
  "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura",
  "Trincomalee", "Vavuniya",
];

const RATING_OPTIONS = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree",
];

// Survey tab structure
const STEPS = [
  { title: "Personal Information", questions: [] as number[] },
  { title: "Customer Review Behaviour", questions: [5, 6, 7, 8] },
  { title: "Review Influence", questions: [9, 10, 11, 12, 13, 14, 15] },
  { title: "Review Volume", questions: [16, 17, 18] },
  { title: "Review Timeliness", questions: [19, 20, 21] },
  { title: "Hotel Purchase Intention", questions: [22, 23, 24, 25] },
];

/* -------------------------- small inline icons -------------------------- */

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/* -------------------------------------------------------------------------- */

export default function SurveyPage() {
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [hotelRating, setHotelRating] = useState<HotelRating | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // guards browser-back / tab-close navigation until the survey is submitted
  const submittedRef = useRef(false);

  useEffect(() => {
    const survey = sessionStorage.getItem("survey");

    if (!survey) {
      toast.error("Survey session expired");
      router.push("/");
      return;
    }

    const data = JSON.parse(survey);

    setParticipant(data.participant);
    setHotelRating(data.hotelRating);

    setQuestions([...data.commonQuestions, ...data.ratingQuestions]);

    setLoading(false);
  }, [router]);

  // ---- prevent leaving the survey via the browser back button ----
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      if (submittedRef.current) return;
      window.history.pushState(null, "", window.location.href);
      toast.warning("Please fill all tabs before leaving the survey.");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // ---- warn on tab close / refresh while survey is incomplete ----
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (submittedRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const updateAnswer = (key: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const getQuestion = (no: number) => questions.find(q => q.no === no);

  const validateCurrentStep = () => {
    let required: string[] = [];

    if (step === 0) {
      required = ["AGE", "GENDER", "EDUCATION", "DISTRICT"];
    } else {
      required = STEPS[step].questions.map(String);
    }

    const missing = required.find(key => !answers[key]);

    if (missing) {
      toast.warning("Please answer all questions before continuing.");
      return false;
    }

    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const previousStep = () => {
    setStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const createPayload = () => [
    answers["AGE"],
    answers["GENDER"],
    answers["EDUCATION"],
    answers["DISTRICT"],

    answers["5"],
    answers["6"],
    answers["7"],
    answers["8"],

    answers["9"],
    answers["10"],
    answers["11"],
    answers["12"],
    answers["13"],
    answers["14"],
    answers["15"],

    answers["16"],
    answers["17"],
    answers["18"],

    answers["19"],
    answers["20"],
    answers["21"],

    answers["22"],
    answers["23"],
    answers["24"],
    answers["25"],
  ];

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    try {
      setSubmitting(true);

      const response = await submitSurvey(Number(id), createPayload());

      if (response.success) {
        submittedRef.current = true;

        toast.success("Survey submitted successfully 🎉");

        sessionStorage.removeItem("survey");

        setTimeout(() => {
          router.push("/survey/success");
        }, 1200);
      } else {
        toast.error(response.message || "Submission failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to submit survey.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------------------- render helpers ---------------------------- */

  // Compact tile-style single choice, used for Age / Gender
  const renderChoiceTiles = (
    key: string,
    options: string[],
    columns: string
  ) => (
    <div className={`grid ${columns} gap-3`}>
      {options.map(option => {
        const selected = answers[key] === option;
        return (
          <label
            key={option}
            className={`relative flex cursor-pointer items-center justify-center rounded-xl border px-4 py-3.5 text-center text-sm font-medium transition-all
              ${selected
                ? "border-[#1F6F6B] bg-[#1F6F6B]/[0.06] text-[#16233A] ring-1 ring-[#1F6F6B]"
                : "border-[#E4E1D9] bg-white text-[#5B6472] hover:border-[#C6C2B6] hover:bg-[#FAFAF8]"
              }`}
          >
            <input
              type="radio"
              name={key}
              className="sr-only"
              checked={selected}
              onChange={() => updateAnswer(key, option)}
            />
            {option}
            {selected && (
              <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#1F6F6B] text-white">
                <CheckIcon />
              </span>
            )}
          </label>
        );
      })}
    </div>
  );

  // Styled native select used for Education / District
  const renderSelectField = (key: string, options: string[], placeholder: string) => (
    <div className="relative">
      <select
        className="w-full appearance-none rounded-xl border border-[#E4E1D9] bg-white px-4 py-3.5 pr-10 text-sm text-[#16233A] transition-colors focus:border-[#1F6F6B] focus:outline-none focus:ring-1 focus:ring-[#1F6F6B]"
        value={answers[key] || ""}
        onChange={e => updateAnswer(key, e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A8578]">
        <ChevronDown />
      </span>
    </div>
  );

  // Horizontal segmented control used for the Likert-style questions
  const renderLikertScale = (key: string) => (
    <div className="flex flex-col gap-2 sm:flex-row">
      {RATING_OPTIONS.map((option, index) => {
        const selected = answers[key] === option;
        return (
          <label
            key={option}
            className={`flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-lg border px-2 py-3 text-center transition-all
              ${selected
                ? "border-[#16233A] bg-[#16233A] text-white"
                : "border-[#E4E1D9] bg-white text-[#5B6472] hover:border-[#C6C2B6] hover:bg-[#FAFAF8]"
              }`}
          >
            <input
              type="radio"
              name={key}
              className="sr-only"
              checked={selected}
              onChange={() => updateAnswer(key, option)}
            />
            <span className={`text-[11px] font-semibold ${selected ? "text-white/70" : "text-[#B8B2A2]"}`}>
              {index + 1}
            </span>
            <span className="text-xs font-medium leading-tight sm:text-[13px]">
              {option}
            </span>
          </label>
        );
      })}
    </div>
  );

  const renderQuestion = (no: number) => {
    const question = getQuestion(no);
    if (!question) return null;

    const answered = Boolean(answers[String(question.no)]);

    return (
      <div
        key={question.no}
        className="mb-4 rounded-2xl border border-[#E9E6DD] bg-white p-5 sm:p-6"
      >
        <h3 className="mb-4 flex items-start gap-2.5 text-[15px] font-medium leading-snug text-[#16233A]">
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold
              ${answered ? "bg-[#1F6F6B] text-white" : "bg-[#F0EEE9] text-[#8A8578]"}`}
          >
            {answered ? <CheckIcon /> : question.no}
          </span>
          {question.question}
        </h3>

        {renderLikertScale(String(question.no))}
      </div>
    );
  };

  const renderHotelRating = () => {
    if (!hotelRating) return null;

    const scoreOutOfFive = Math.max(0, Math.min(5, Math.round(hotelRating.score)));

    return (
      <div className="mb-6 overflow-hidden rounded-2xl border border-[#E9E6DD] bg-white">
        <div className="border-b border-[#E9E6DD] bg-[#16233A] px-6 py-5 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C9A227]">
            Assigned hotel review
          </p>
          <h2
            className={`${display.variable} mt-1 text-2xl font-semibold text-white`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            Read it, then answer honestly
          </h2>
        </div>

        <div className="px-6 py-6 sm:px-8">
          <div className="mb-5 flex flex-col items-center gap-2">
            <div className="flex gap-1" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill={i < scoreOutOfFive ? "#C9A227" : "none"}
                  stroke="#C9A227"
                  strokeWidth="1.5"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <p className="text-sm font-medium text-[#5B6472]">
              Review score: <span className="font-semibold text-[#16233A]">{hotelRating.score}</span>
            </p>
          </div>

          <div className="relative rounded-xl bg-[#F7F5F0] px-5 py-5 sm:px-6">
            <span className="absolute left-3 top-2 font-serif text-4xl leading-none text-[#E4DEC9]">
              &ldquo;
            </span>
            <p className="relative whitespace-pre-line text-[15px] leading-relaxed text-[#3A4150]">
              {hotelRating.review}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const progressPercent = Math.round(((step + 1) / STEPS.length) * 100);

  const renderStepper = () => (
    <>
      {/* Desktop vertical itinerary */}
      <aside className="hidden shrink-0 md:block md:w-56">
        <div className="sticky top-8 rounded-2xl border border-[#E9E6DD] bg-white p-5">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A8578]">
            Survey progress
          </p>
          <ol className="relative">
            {STEPS.map((s, index) => {
              const isDone = index < step;
              const isActive = index === step;
              return (
                <li key={s.title} className="relative flex gap-3 pb-7 last:pb-0">
                  {index < STEPS.length - 1 && (
                    <span
                      className={`absolute left-[13px] top-6 h-full w-px ${
                        isDone ? "bg-[#1F6F6B]" : "bg-[#E9E6DD]"
                      }`}
                    />
                  )}
                  <span
                    className={`z-10 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold
                      ${isDone
                        ? "border-[#1F6F6B] bg-[#1F6F6B] text-white"
                        : isActive
                        ? "border-[#16233A] bg-[#16233A] text-white"
                        : "border-[#E4E1D9] bg-white text-[#8A8578]"
                      }`}
                  >
                    {isDone ? <CheckIcon /> : index + 1}
                  </span>
                  <span
                    className={`pt-0.5 text-[13px] leading-tight ${
                      isActive ? "font-semibold text-[#16233A]" : isDone ? "text-[#5B6472]" : "text-[#B8B2A2]"
                    }`}
                  >
                    {s.title}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </aside>

      {/* Mobile horizontal progress */}
      <div className="mb-6 md:hidden">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-[#5B6472]">
          <span>{STEPS[step].title}</span>
          <span>{step + 1}/{STEPS.length}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E9E6DD]">
          <div
            className="h-full rounded-full bg-[#1F6F6B] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </>
  );

  /* --------------------------------- render --------------------------------- */

  if (loading) {
    return (
      <div className={`${body.variable} flex min-h-screen items-center justify-center bg-[#F2F1ED]`} style={{ fontFamily: "var(--font-body)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#E4E1D9] border-t-[#1F6F6B]" />
          <p className="text-sm font-medium text-[#5B6472]">Loading survey…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${display.variable} ${body.variable} min-h-screen bg-[#F2F1ED] px-4 py-8 sm:py-12`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1F6F6B]">
            Hospitality research study
          </p>
          <h1
            className="text-[28px] font-semibold text-[#16233A] sm:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Hotel Customer Survey
          </h1>
          {participant && (
            <p className="mt-2 text-sm text-[#8A8578]">
              Signed in as <span className="font-medium text-[#5B6472]">{participant.email}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          {renderStepper()}

          {/* Main content card */}
          <div className="flex-1 rounded-2xl border border-[#E9E6DD] bg-white p-5 sm:p-8">
            {/* ---------------- Step 1 ---------------- */}
            {step === 0 && (
              <>
                <h2
                  className="mb-6 text-xl font-semibold text-[#16233A]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Personal Information
                </h2>

                <div className="mb-7">
                  <label className="mb-3 block text-sm font-semibold text-[#16233A]">Age</label>
                  {renderChoiceTiles("AGE", AGE_OPTIONS, "grid-cols-2 sm:grid-cols-3")}
                </div>

                <div className="mb-7">
                  <label className="mb-3 block text-sm font-semibold text-[#16233A]">Gender</label>
                  {renderChoiceTiles("GENDER", GENDER_OPTIONS, "grid-cols-2")}
                </div>

                <div className="mb-6 grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-3 block text-sm font-semibold text-[#16233A]">
                      Education Level
                    </label>
                    {renderSelectField("EDUCATION", EDUCATION_OPTIONS, "Select education level")}
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-semibold text-[#16233A]">
                      District
                    </label>
                    {renderSelectField("DISTRICT", DISTRICTS, "Select district")}
                  </div>
                </div>
              </>
            )}

            {/* ---------------- Steps 2-5 ---------------- */}
            {step >= 1 && step <= 4 && (
              <>
                <h2
                  className="mb-6 text-xl font-semibold text-[#16233A]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {STEPS[step].title}
                </h2>
                {STEPS[step].questions.map(renderQuestion)}
              </>
            )}

            {/* ---------------- Step 6 ---------------- */}
            {step === 5 && (
              <>
                <h2
                  className="mb-6 text-xl font-semibold text-[#16233A]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {STEPS[5].title}
                </h2>
                {renderHotelRating()}
                {STEPS[5].questions.map(renderQuestion)}
              </>
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between border-t border-[#EFEDE6] pt-6">
              {step > 0 ? (
                <button
                  onClick={previousStep}
                  className="flex items-center gap-1.5 rounded-lg border border-[#E4E1D9] px-5 py-3 text-sm font-medium text-[#5B6472] transition-colors hover:bg-[#FAFAF8]"
                >
                  <ChevronLeft />
                  Back
                </button>
              ) : (
                <span />
              )}

              {step < STEPS.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-1.5 rounded-lg bg-[#16233A] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1F6F6B]"
                >
                  Next
                  <ChevronRight />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-[#1F6F6B] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#16233A] disabled:cursor-not-allowed disabled:bg-[#B8B2A2]"
                >
                  {submitting && (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}
                  {submitting ? "Submitting…" : "Submit Survey"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}