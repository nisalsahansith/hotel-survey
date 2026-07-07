"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startSurvey } from "@/lib/api";
import { toast } from "sonner";

export default function SurveyStartPage() {

  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);



  const handleStart = async () => {


    if (!form.name.trim()) {
      toast.warning("Please enter your full name");
      return;
    }

    if (!form.phone.trim()) {
      toast.warning("Please enter your phone number");
      return;
    }

    if (!form.email.trim()) {
      toast.warning("Please enter your email address");
      return;
    }


    try {


      setLoading(true);


      const res = await startSurvey(
        form.name,
        form.phone,
        form.email
      );


      console.log(
        "API Response:",
        res
      );


      // Next.js API error
      if (!res.success) {


        toast.error(
          res.message || 
          "Unable to start survey"
        );


        return;

      }



      // Google Apps Script error
      if (!res.data.success) {


        toast.error(
          res.data.message ||
          "Survey initialization failed"
        );


        return;

      }



      const surveyData = res.data.data;



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

    <div className="min-h-screen flex items-center justify-center bg-gray-100">


      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">


        <h1 className="text-3xl font-bold text-center mb-6">
          Hotel Survey
        </h1>



        <input

          type="text"

          placeholder="Full Name"

          className="border rounded-md p-3 w-full mb-4"

          value={form.name}

          onChange={(e)=>
            setForm({
              ...form,
              name:e.target.value
            })
          }

        />



        <input

          type="text"

          placeholder="Phone Number"

          className="border rounded-md p-3 w-full mb-4"

          value={form.phone}

          onChange={(e)=>
            setForm({
              ...form,
              phone:e.target.value
            })
          }

        />



        <input

          type="email"

          placeholder="Email Address"

          className="border rounded-md p-3 w-full mb-6"

          value={form.email}

          onChange={(e)=>
            setForm({
              ...form,
              email:e.target.value
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
            ?
            "Starting Survey..."
            :
            "Start Survey"
          }


        </button>



      </div>


    </div>

  );

}