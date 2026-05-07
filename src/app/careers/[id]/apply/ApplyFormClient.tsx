"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Upload,
  User,
  Briefcase,
  Award,
  Globe,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Loader2,
} from "lucide-react";

interface ApplyFormProps {
  jobId: string;
  jobTitle: string;
}

const STEPS = [
  { id: 1, label: "Upload Resume", icon: Upload },
  { id: 2, label: "Profile Details", icon: User },
  { id: 3, label: "Geographic Mobility", icon: Globe },
  { id: 4, label: "Job-Specific Information", icon: FileText },
  { id: 5, label: "Review & Submit", icon: CheckCircle2 },
];

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
];

const countries = [
  "India", "United States", "United Kingdom", "Canada", "Australia",
  "Germany", "Japan", "Singapore", "UAE",
];

const graduations = [
  "High School", "Associate Degree", "Bachelor of Science", "Bachelor of Arts",
  "Bachelor of Engineering", "Master of Science", "Master of Arts",
  "Master of Business Administration", "Master of Design", "Ph.D.", "Other",
];

const languages = ["Telugu", "English", "Hindi", "Tamil", "Kannada", "Malayalam", "Bengali", "Marathi"];

/* ── Resume text extraction using pdfjs-dist ── */
async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  // Use the bundled worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => (item.str ? item.str : ""))
      .join(" ");
    fullText += pageText + "\n";
  }

  return fullText;
}


export default function ApplyFormClient({ jobId, jobTitle }: ApplyFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Resume
    resumeFileName: "",
    resumeBase64: "", // Store base64 representation of the file
    // Step 2: Profile Details
    suffix: "Mr.",
    firstName: "",
    lastName: "",
    mobileNumber: "",
    alternateMobile: "",
    email: "",
    address: "",
    state: "",
    city: "",
    country: "India",
    graduation: "",
    gender: "Male",
    languagesKnown: [] as string[],
    jobAlert: true,
    // Step 3: Geographic Mobility
    willingToRelocate: "Yes",
    preferredLocations: "",
    // Step 4: Job-specific
    linkedinUrl: "",
    portfolioUrl: "",
    coverLetter: "",
    noticePeriod: "",
    expectedSalary: "",
  });

  const validateStep = (step: number) => {
    if (step === 2) {
      const requiredFields = [
        { key: 'firstName', label: 'First Name' },
        { key: 'lastName', label: 'Last Name' },
        { key: 'email', label: 'Email ID' },
        { key: 'mobileNumber', label: 'Mobile Number' },
        { key: 'address', label: 'Address' },
        { key: 'state', label: 'State' },
        { key: 'city', label: 'City' },
        { key: 'graduation', label: 'Highest Graduation' }
      ];

      for (const field of requiredFields) {
        const value = formData[field.key as keyof typeof formData];
        if (!value || (typeof value === 'string' && !value.trim())) {
          alert(`Please fill in your ${field.label} before proceeding.`);
          return false;
        }
      }

      if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        alert("Please enter a valid email address.");
        return false;
      }
    }
    return true;
  };

  const updateField = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleLanguage = (lang: string) => {
    setFormData((prev) => ({
      ...prev,
      languagesKnown: prev.languagesKnown.includes(lang)
        ? prev.languagesKnown.filter((l) => l !== lang)
        : [...prev.languagesKnown, lang],
    }));
  };

  /* ── Handle resume upload + auto-fill ── */
  const handleResumeUpload = useCallback(async (file: File) => {
    updateField("resumeFileName", file.name);

    if (file.type === "application/pdf") {
      setIsParsing(true);
      try {
        // Read file for submission via Base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result?.toString().split(",")[1];
          if (base64String) {
            updateField("resumeBase64", base64String);
          }
        };
        reader.readAsDataURL(file);

        const text = await extractTextFromPDF(file);
        
        // Pass the raw text to the NVIDIA LLM extraction API
        const response = await fetch("/api/parse-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (response.ok) {
          const parsed = await response.json();
          
          setFormData((prev) => ({
            ...prev,
            firstName: parsed.firstName || prev.firstName,
            lastName: parsed.lastName || prev.lastName,
            email: parsed.email || prev.email,
            mobileNumber: parsed.mobileNumber || prev.mobileNumber,
            linkedinUrl: parsed.linkedinUrl || prev.linkedinUrl,
            portfolioUrl: parsed.portfolioUrl || prev.portfolioUrl,
            state: parsed.state || prev.state,
            city: parsed.city || prev.city,
            graduation: parsed.graduation || prev.graduation,
            languagesKnown: parsed.languagesKnown
              ? parsed.languagesKnown.split(",").map((l: string) => l.trim())
              : prev.languagesKnown,
          }));
          setAutoFilled(true);
        } else {
          console.error("Failed to parse via LLM server");
          alert("We couldn't auto-fill your details right now. Please fill out the form manually.");
        }
      } catch (err) {
        console.error("Resume parsing error:", err);
        alert("An error occurred while parsing your resume. Please fill out the form manually.");
      } finally {
        setIsParsing(false);
      }
    }
  }, []);

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        jobId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.mobileNumber,
        linkedinUrl: formData.linkedinUrl || null,
        portfolioUrl: formData.portfolioUrl || null,
        message: formData.coverLetter || `Applied via multi-step form. Notice period: ${formData.noticePeriod}. Expected salary: ${formData.expectedSalary}.`,
        jobAlert: formData.jobAlert,
        resumeName: formData.resumeFileName,
        resumeBase64: formData.resumeBase64,
      };
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Shared input styles ── */
  const inputClass =
    "w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C8F542] transition-colors placeholder:text-gray-600";
  const selectClass =
    "w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C8F542] transition-colors appearance-none cursor-pointer";
  const labelClass = "block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider";

  if (submitted) {
    return (
      <div className="pt-40 pb-32 bg-[#0a0a0a] text-white">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block p-5 bg-[#C8F542]/10 rounded-full mb-6">
              <CheckCircle2 size={64} className="text-[#C8F542]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Application Submitted!
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Thank you for applying for <span className="text-white font-medium">{jobTitle}</span>.
              Our talent team will review your application and get back to you soon.
            </p>
            <Link
              href="/careers"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#C8F542] text-black font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(200,245,66,0.3)] transition-all"
            >
              Back to Careers
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 md:pt-36 pb-20 bg-[#0a0a0a] text-white min-h-screen">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href="/careers" className="hover:text-white transition-colors">Careers</Link>
          <ChevronRight size={14} />
          <span className="text-[#C8F542]">Apply</span>
        </div>

        {/* ── Job Title ── */}
        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2 tracking-tight">
          {jobTitle}
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          In this section, we want to learn more about you! Here&rsquo;s your opportunity to share more details about your profile.
        </p>

        {/* ── Stepper ── */}
        <div className="mb-12 overflow-x-auto pb-4">
          <div className="flex items-center min-w-[700px]">
            {STEPS.map((step, i) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <button
                      suppressHydrationWarning
                      onClick={() => {
                        if (isCompleted) setCurrentStep(step.id);
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        isCompleted
                          ? "bg-[#C8F542] text-black cursor-pointer"
                          : isActive
                          ? "bg-[#C8F542] text-black ring-4 ring-[#C8F542]/30"
                          : "bg-[#1a1a1a] border border-white/10 text-gray-500"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        step.id
                      )}
                    </button>
                    <span
                      className={`mt-2 text-[10px] text-center max-w-[80px] leading-tight ${
                        isActive
                          ? "text-white font-medium"
                          : isCompleted
                          ? "text-[#C8F542]"
                          : "text-gray-600"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 mt-[-20px] transition-colors duration-300 ${
                        step.id < currentStep ? "bg-[#C8F542]" : "bg-white/10"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Step Content ── */}
        <div className="bg-[#141414] border border-white/5 rounded-2xl p-8 md:p-10 min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
            >
              {/* ──────── STEP 1: Upload Resume ──────── */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Upload Resume</h2>
                  <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center hover:border-[#C8F542]/40 transition-colors">
                    {isParsing ? (
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 size={48} className="text-[#C8F542] animate-spin" />
                        <p className="text-gray-300 font-medium">Parsing your resume...</p>
                        <p className="text-gray-500 text-sm">Extracting details to auto-fill the form</p>
                      </div>
                    ) : (
                      <>
                        <Upload size={48} className="mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-400 mb-2">
                          Drag and drop your resume here, or click to browse
                        </p>
                        <p className="text-gray-600 text-xs mb-6">
                          Supported formats: PDF (Max 5MB) — <span className="text-[#C8F542]">Auto-fill enabled</span>
                        </p>
                        <label className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#C8F542] text-black text-sm font-medium rounded-xl cursor-pointer hover:bg-[#d4ff6e] transition-colors">
                          <Upload size={16} />
                          Browse Files
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleResumeUpload(file);
                            }}
                          />
                        </label>
                      </>
                    )}
                    {formData.resumeFileName && !isParsing && (
                      <div className="mt-6 space-y-2">
                        <p className="text-[#C8F542] text-sm flex items-center justify-center gap-2">
                          <CheckCircle2 size={16} />
                          {formData.resumeFileName}
                        </p>
                        {autoFilled && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C8F542]/10 border border-[#C8F542]/20 rounded-lg text-[#C8F542] text-xs font-medium"
                          >
                            <Sparkles size={14} />
                            Auto-fill complete! Details extracted from your resume. Click &quot;Next&quot; to review.
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ──────── STEP 2: Profile Details ──────── */}
              {currentStep === 2 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Profile Details</h2>
                    {autoFilled && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C8F542]/10 border border-[#C8F542]/20 rounded-full text-[#C8F542] text-[10px] font-bold uppercase tracking-wider">
                        <Sparkles size={12} />
                        Auto-filled from resume
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className={labelClass}>Suffix:</label>
                      <select
                        value={formData.suffix}
                        onChange={(e) => updateField("suffix", e.target.value)}
                        className={selectClass}
                      >
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Dr.">Dr.</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>First Name:</label>
                      <input
                        value={formData.firstName}
                        onChange={(e) => updateField("firstName", e.target.value)}
                        className={inputClass}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name:</label>
                      <input
                        value={formData.lastName}
                        onChange={(e) => updateField("lastName", e.target.value)}
                        className={inputClass}
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div>
                      <label className={labelClass}>Mobile Number:</label>
                      <input
                        value={formData.mobileNumber}
                        onChange={(e) => updateField("mobileNumber", e.target.value)}
                        className={inputClass}
                        placeholder="8445634765"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Alternate Mobile Number:</label>
                      <input
                        value={formData.alternateMobile}
                        onChange={(e) => updateField("alternateMobile", e.target.value)}
                        className={inputClass}
                        placeholder="3456894326"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Email ID:</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className={inputClass}
                        placeholder="john@gmail.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div>
                      <label className={labelClass}>Address:</label>
                      <input
                        value={formData.address}
                        onChange={(e) => updateField("address", e.target.value)}
                        className={inputClass}
                        placeholder="Your address"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>State:</label>
                      <select
                        value={formData.state}
                        onChange={(e) => updateField("state", e.target.value)}
                        className={selectClass}
                      >
                        <option value="">Select State</option>
                        {indianStates.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>City:</label>
                      <input
                        value={formData.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        className={inputClass}
                        placeholder="Your city"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className={labelClass}>Country:</label>
                      <select
                        value={formData.country}
                        onChange={(e) => updateField("country", e.target.value)}
                        className={selectClass}
                      >
                        {countries.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Highest Graduation Completed:</label>
                      <select
                        value={formData.graduation}
                        onChange={(e) => updateField("graduation", e.target.value)}
                        className={selectClass}
                      >
                        <option value="">Select</option>
                        {graduations.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className={labelClass}>Gender:</label>
                      <div className="flex items-center gap-6 mt-1">
                        {["Male", "Female", "Others"].map((g) => (
                          <label key={g} className="flex items-center gap-2 cursor-pointer text-sm">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                formData.gender === g
                                  ? "border-[#C8F542]"
                                  : "border-white/20"
                              }`}
                            >
                              {formData.gender === g && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#C8F542]" />
                              )}
                            </div>
                            <span className="text-gray-300">{g}</span>
                            <input
                              type="radio"
                              name="gender"
                              value={g}
                              checked={formData.gender === g}
                              onChange={() => updateField("gender", g)}
                              className="hidden"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Languages Known:</label>
                      <div className="flex flex-wrap items-center gap-4 mt-1">
                        {languages.map((lang) => (
                          <label key={lang} className="flex items-center gap-2 cursor-pointer text-sm">
                            <div
                              onClick={() => toggleLanguage(lang)}
                              className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                                formData.languagesKnown.includes(lang)
                                  ? "bg-[#C8F542] border-[#C8F542]"
                                  : "border-white/20"
                              }`}
                            >
                              {formData.languagesKnown.includes(lang) && (
                                <CheckCircle2 size={12} className="text-white" />
                              )}
                            </div>
                            <span className="text-gray-300">{lang}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-4">
                    <label className={labelClass + " mb-0"}>Job Alert is</label>
                    <button
                      suppressHydrationWarning
                      onClick={() => updateField("jobAlert", !formData.jobAlert)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        formData.jobAlert ? "bg-[#22C55E]" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                          formData.jobAlert ? "left-[26px]" : "left-0.5"
                        }`}
                      />
                    </button>
                    <span className="text-xs text-gray-500">
                      {formData.jobAlert ? "on" : "off"}
                    </span>
                  </div>
                  {formData.jobAlert && (
                    <p className="mt-2 text-xs text-gray-500 flex items-center gap-1.5">
                      <span className="text-red-400">◆</span>
                      This Job Alert will notify you about our company further Job Openings
                    </p>
                  )}
                </div>
              )}

              {/* ──────── STEP 3: Geographic Mobility ──────── */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Geographic Mobility</h2>
                  <div className="space-y-6">
                    <div>
                      <label className={labelClass}>Willing to Relocate?</label>
                      <div className="flex items-center gap-6 mt-1">
                        {["Yes", "No", "Open to Discussion"].map((opt) => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                formData.willingToRelocate === opt
                                  ? "border-[#C8F542]"
                                  : "border-white/20"
                              }`}
                            >
                              {formData.willingToRelocate === opt && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#C8F542]" />
                              )}
                            </div>
                            <span className="text-gray-300">{opt}</span>
                            <input
                              type="radio"
                              name="relocate"
                              value={opt}
                              checked={formData.willingToRelocate === opt}
                              onChange={() => updateField("willingToRelocate", opt)}
                              className="hidden"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Preferred Locations:</label>
                      <input
                        value={formData.preferredLocations}
                        onChange={(e) => updateField("preferredLocations", e.target.value)}
                        className={inputClass}
                        placeholder="e.g., Bangalore, Hyderabad, Remote"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ──────── STEP 4: Job-Specific Information ──────── */}
              {currentStep === 4 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Job-Specific Information</h2>
                    {autoFilled && (formData.linkedinUrl || formData.portfolioUrl) && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C8F542]/10 border border-[#C8F542]/20 rounded-full text-[#C8F542] text-[10px] font-bold uppercase tracking-wider">
                        <Sparkles size={12} />
                        Auto-filled
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>LinkedIn Profile URL:</label>
                      <input
                        value={formData.linkedinUrl}
                        onChange={(e) => updateField("linkedinUrl", e.target.value)}
                        className={inputClass}
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Portfolio / Resume URL:</label>
                      <input
                        value={formData.portfolioUrl}
                        onChange={(e) => updateField("portfolioUrl", e.target.value)}
                        className={inputClass}
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Notice Period:</label>
                      <input
                        value={formData.noticePeriod}
                        onChange={(e) => updateField("noticePeriod", e.target.value)}
                        className={inputClass}
                        placeholder="e.g., 30 days, Immediate"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Expected Salary:</label>
                      <input
                        value={formData.expectedSalary}
                        onChange={(e) => updateField("expectedSalary", e.target.value)}
                        className={inputClass}
                        placeholder="e.g., ₹15 LPA"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className={labelClass}>Cover Letter / Additional Message:</label>
                    <textarea
                      value={formData.coverLetter}
                      onChange={(e) => updateField("coverLetter", e.target.value)}
                      className={inputClass + " resize-none"}
                      rows={5}
                      placeholder="Tell us why you're a great fit for this role..."
                    />
                  </div>
                </div>
              )}

              {/* ──────── STEP 5: Review & Submit ──────── */}
              {currentStep === 5 && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Review & Submit</h2>
                  <p className="text-gray-400 text-sm mb-8">
                    Please review your information below before submitting your application.
                  </p>

                  <div className="space-y-6">
                    {/* Personal Info */}
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6">
                      <h3 className="text-sm font-bold text-[#C8F542] uppercase tracking-wider mb-4">
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><span className="text-gray-500">Name:</span> <span className="text-white ml-2">{formData.suffix} {formData.firstName} {formData.lastName}</span></div>
                        <div><span className="text-gray-500">Email:</span> <span className="text-white ml-2">{formData.email}</span></div>
                        <div><span className="text-gray-500">Mobile:</span> <span className="text-white ml-2">{formData.mobileNumber}</span></div>
                        <div><span className="text-gray-500">Location:</span> <span className="text-white ml-2">{formData.city}, {formData.state}, {formData.country}</span></div>
                        <div><span className="text-gray-500">Education:</span> <span className="text-white ml-2">{formData.graduation}</span></div>
                        <div><span className="text-gray-500">Gender:</span> <span className="text-white ml-2">{formData.gender}</span></div>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6">
                      <h3 className="text-sm font-bold text-[#C8F542] uppercase tracking-wider mb-4">
                        Links & Additional Info
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><span className="text-gray-500">LinkedIn:</span> <span className="text-white ml-2">{formData.linkedinUrl || "N/A"}</span></div>
                        <div><span className="text-gray-500">Portfolio:</span> <span className="text-white ml-2">{formData.portfolioUrl || "N/A"}</span></div>
                        <div><span className="text-gray-500">Expected Salary:</span> <span className="text-white ml-2">{formData.expectedSalary || "N/A"}</span></div>
                        <div><span className="text-gray-500">Relocate:</span> <span className="text-white ml-2">{formData.willingToRelocate}</span></div>
                        <div><span className="text-gray-500">Notice Period:</span> <span className="text-white ml-2">{formData.noticePeriod || "N/A"}</span></div>
                      </div>
                    </div>

                    {formData.coverLetter && (
                      <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6">
                        <h3 className="text-sm font-bold text-[#C8F542] uppercase tracking-wider mb-4">
                          Cover Letter
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{formData.coverLetter}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between mt-8">
          <button
            suppressHydrationWarning
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
              currentStep === 1
                ? "text-gray-600 cursor-not-allowed"
                : "border border-[#C8F542] text-[#C8F542] hover:bg-[#C8F542] hover:text-black"
            }`}
          >
            <ArrowLeft size={16} />
            Previous
          </button>

          {currentStep < 5 ? (
            <button
              suppressHydrationWarning
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 bg-[#C8F542] text-black rounded-xl text-sm font-semibold hover:bg-[#d4ff6e] hover:shadow-[0_0_20px_rgba(200,245,66,0.3)] transition-all"
            >
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              suppressHydrationWarning
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-[#C8F542] text-black rounded-xl text-sm font-bold hover:shadow-[0_0_20px_rgba(200,245,66,0.3)] transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
              {!isSubmitting && <ArrowRight size={16} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
