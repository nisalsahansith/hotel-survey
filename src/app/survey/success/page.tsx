"use client";

export default function SurveySuccessPage() {

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white shadow-xl rounded-xl p-10 max-w-md text-center">

        <div className="text-green-600 text-6xl mb-5">
          ✓
        </div>


        <h1 className="text-3xl font-bold mb-4">
          Thank You!
        </h1>


        <p className="text-gray-600 text-lg">

          Your survey response has been submitted successfully.

          <br />

          We appreciate your valuable feedback.

        </p>


        <div className="mt-6 text-sm text-gray-500">

          Have a wonderful day!

        </div>


      </div>

    </div>

  );

}