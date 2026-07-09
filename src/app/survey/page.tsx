"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startSurvey } from "@/lib/api";
import { toast } from "sonner";

export default function SurveyStartPage() {

  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
  });

  const [loading, setLoading] = useState(false);



  const handleStart = async () => {


    if (!form.email.trim()) {

      toast.warning(
        "Please enter your email address"
      );

      return;

    }



    try {


      setLoading(true);

const res = await startSurvey(
  form.email
);


console.log(
  "API Response:",
  res
);


if (!res.success) {

  toast.error(
    res.message || 
    "Unable to start survey"
  );

  return;

}


const surveyData = res.data;


sessionStorage.setItem(
  "survey",
  JSON.stringify(surveyData)
);


toast.success(
  "Survey started successfully 🎉"
);


setTimeout(()=>{

  router.push(
    `/survey/${surveyData.participant.id}`
  );

},1000);



    } catch(error) {


      console.error(
        "START SURVEY ERROR:",
        error
      );


      toast.error(
        "Something went wrong. Please try again."
      );


    } finally {


      setLoading(false);


    }

  };



  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10">


      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg">


        <h1 className="text-2xl font-bold text-center mb-6">
          The Impact of Online Review Valence, Volume, Timeliness, and Sentiment Intensity on Consumers’ Purchase Intention
        </h1>



        {/* Research Information */}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">


          <h2 className="text-lg font-semibold text-blue-800 mb-3">
            Research Information
          </h2>


          <p className="text-gray-700 leading-relaxed text-sm mb-3">

            <strong>
              The Influence of Online Review Valence, Timeliness and Volume on Hotel Purchase Intention
            </strong>

          </p>


          <p className="text-gray-700 leading-relaxed text-sm mb-3">

            I'm Kavindu Prabhash, a final-year undergraduate student in the Department of Industrial Management,
            Faculty of Applied Sciences, Wayamba University of Sri Lanka.

          </p>


          <p className="text-gray-700 leading-relaxed text-sm mb-3">

            This questionnaire is part of an academic research study conducted to examine the influence of online
            review valence, timeliness, and volume on hotel purchase intention.

          </p>


          <p className="text-gray-700 leading-relaxed text-sm">

            Your responses are completely anonymous and will be used only for academic research purposes.
            Please answer all questions honestly and carefully.

          </p>


        </div>



        {/* Email Input */}

        <input

          type="email"

          placeholder="Email Address"

          className="
            border
            rounded-md
            p-3
            w-full
            mb-6
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
          "

          value={form.email}

          onChange={(e) =>
            setForm({
              email: e.target.value
            })
          }

        />



        <button

          onClick={handleStart}

          disabled={loading}

          className="
            w-full
            bg-blue-600
            hover:bg-blue-700
            text-white
            rounded-md
            p-3
            font-semibold
            disabled:bg-gray-400
          "

        >

          {
            loading
            ? "Starting Survey..."
            : "Start Survey"
          }


        </button>



      </div>


    </div>

  );

}