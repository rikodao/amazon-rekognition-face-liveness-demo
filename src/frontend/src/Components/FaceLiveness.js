import React from "react";
import { useEffect } from "react";
import { Loader } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { FaceLivenessDetector } from '@aws-amplify/ui-react-liveness';


function FaceLiveness({faceLivenessAnalysis, sessionid, loading}) {
    
    
   

    const endpoint = process.env.REACT_APP_ENV_API_URL ? process.env.REACT_APP_ENV_API_URL : ''

   /*
   * Get the Face Liveness Session Result
   */
    const handleAnalysisComplete = async () => {
        /*
         * API call to get the Face Liveness Session result
         */
        const response = await fetch(endpoint + 'getfacelivenesssessionresults',
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sessionid: sessionid })
            }

        );
        const data = await response.json();
        faceLivenessAnalysis(data.body)
    };

    return (
        <>
            {loading ? (
                <Loader />
            ) : (
                <FaceLivenessDetector
                    sessionId={sessionid}
                    region="us-east-1"
                    onAnalysisComplete={handleAnalysisComplete}
                    onError={(error) => {
                        console.error(error);
                      }}
                />
            )}
        </>
    );
}

export default FaceLiveness;
