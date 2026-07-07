"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { submitSurvey } from "@/lib/api";
import { toast } from "sonner";

interface Question {
  no: number;
  question: string;
  type: string;
}

interface Participant {
  id: number;
  name: string;
  phone: string;
  email: string;
  ratingNo: number;
  status: string;
}

interface HotelRating {
  ratingNo: number;
  score: number;
  review: string;
}

export default function SurveyPage() {

  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [hotelRating, setHotelRating] = useState<HotelRating | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);


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


    const allQuestions = [
      ...data.commonQuestions,
      ...data.ratingQuestions
    ];


    setQuestions(allQuestions);
    setAnswers(
      new Array(allQuestions.length).fill("")
    );


    setLoading(false);


  }, [router]);



  const handleAnswerChange = (
    index:number,
    value:string
  ) => {

    const updated = [...answers];

    updated[index] = value;

    setAnswers(updated);

  };



  const handleSubmit = async()=>{


    const emptyAnswers = answers.some(
      answer => answer.trim() === ""
    );


    if(emptyAnswers){

      toast.warning(
        "Please answer all questions before submitting"
      );

      return;

    }



    try{


      setSubmitting(true);


      const response = await submitSurvey(
        Number(id),
        answers
      );



      if(response.success){


        toast.success(
          "Survey submitted successfully 🎉"
        );


        sessionStorage.removeItem("survey");


        setTimeout(()=>{

          router.push("/survey/success");

        },1500);



      }else{


        toast.error(
          response.message || 
          "Survey submission failed"
        );


      }



    }catch(error){


      console.error(error);


      toast.error(
        "Unable to submit survey. Please try again."
      );


    }
    finally{

      setSubmitting(false);

    }


  };



  if(loading){

    return(
      <div className="min-h-screen flex items-center justify-center">

        <p className="text-lg">
          Loading Survey...
        </p>

      </div>
    );

  }



  return (

    <div className="min-h-screen bg-gray-100 py-10">


      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">


        <h1 className="text-3xl font-bold text-center mb-8">
          Hotel Customer Survey
        </h1>



        {
          participant && (

            <div className="bg-blue-50 border rounded-xl p-5 mb-8">

              <h2 className="font-bold text-xl mb-3">
                Participant Information
              </h2>


              <p>
                <b>Name:</b> {participant.name}
              </p>

              <p>
                <b>Email:</b> {participant.email}
              </p>

              <p>
                <b>Phone:</b> {participant.phone}
              </p>


            </div>

          )
        }



        <div className="mb-6">

          <div className="h-3 bg-gray-200 rounded-full">


            <div

              className="h-3 bg-blue-600 rounded-full"

              style={{
                width:
                `${
                  (answers.filter(
                    a=>a!==""
                  ).length /
                  questions.length)
                  *100
                }%`
              }}

            />


          </div>


          <p className="text-sm mt-2 text-gray-600">

            {
              answers.filter(
                a=>a!==""
              ).length
            }
            /
            {questions.length}
            Answered

          </p>


        </div>




        {
          questions.map((question,index)=>(


            <div key={question.no}>

        {index === 20 && hotelRating && (

          <div className="mb-8 rounded-xl border-2 border-yellow-400 bg-yellow-50 p-6 shadow-md">

            <h2 className="text-2xl font-bold text-yellow-700 mb-5 text-center">
              Assigned Hotel Rating
            </h2>


            <div className="flex flex-col items-center gap-4">


              {/* Score */}
              <div className="text-center">

                <p className="text-sm text-gray-600">
                  Score
                </p>

                <p className="text-5xl font-bold text-red-600">
                  {hotelRating.score}
                </p>

              </div>



              {/* Review */}
              <div className="w-full bg-white rounded-lg border p-5">

                <p className="text-sm font-semibold text-gray-500 mb-2">
                  Customer Review
                </p>


                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {hotelRating.review}
                </p>


              </div>


            </div>


          </div>

        )}


              <div className="border rounded-xl p-5 mb-5">


                <h3 className="font-semibold mb-3">

                  {index+1}. {question.question}

                </h3>


                <textarea

                  rows={3}

                  value={answers[index]}

                  onChange={
                    e=>
                    handleAnswerChange(
                      index,
                      e.target.value
                    )
                  }

                  className="border rounded-lg w-full p-3"

                  placeholder="Enter your answer..."

                />


              </div>


            </div>


          ))

        }



        <button

          onClick={handleSubmit}

          disabled={submitting}

          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold"

        >

          {
            submitting
            ?
            "Submitting..."
            :
            "Submit Survey"
          }

        </button>


      </div>


    </div>

  );

}