import './App.css';
import React from "react";
import { Amplify } from 'aws-amplify';
import { ThemeProvider } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import FaceLiveness from './Components/FaceLiveness';
import ReferenceImage from './Components/ReferenceImage';
import ImageUploader from './Components/ImageUploader';
import CompareFace from './Components/CompareFace';
import { useEffect } from "react";
import {
  View,
  Flex,
  Tabs,
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsexports from './aws-exports';

Amplify.configure(awsexports);
const endpoint = process.env.REACT_APP_ENV_API_URL ? process.env.REACT_APP_ENV_API_URL : ''
function App() {

  const [faceLivenessAnalysis, setFaceLivenessAnalysis] = React.useState(null)
  const [sessionid, setSessionid] = React.useState()
  const [loading, setLoading] = React.useState(true);
  const [idImage, setIdImage] = React.useState(null);

    useEffect(() => {
      /*
      * API call to create the Face Liveness Session
      */
      const fetchCreateLiveness = async () => {
          const response = await fetch(endpoint + 'createfacelivenesssession');
          const data = await response.json();
          console.log("data.sessionid");
          console.log(data.sessionId);
          setSessionid(data.sessionId)
          setLoading(false);

      };
      fetchCreateLiveness();

  },[])

  const getfaceLivenessAnalysis = (faceLivenessAnalysis) => {
    if (faceLivenessAnalysis !== null) {
      setFaceLivenessAnalysis(faceLivenessAnalysis)
    }
  }

  const tryagain = () =>{
    setFaceLivenessAnalysis(null)
  }


  return (
    <ThemeProvider>
      <Flex
        direction="row"
        justifyContent="center"
        alignItems="center"
        alignContent="flex-start"
        wrap="nowrap"
        gap="1rem"
      >
        <View
          as="div"
          maxHeight="600px"
          height="600px"
          width="740px"
          maxWidth="740px"
        >
          SessionID: {sessionid}
           <Tabs
    defaultValue={'Tab 1'}
    items={[
      { label: '本人確認書類アップロード', value: 'Tab 1', content: (<ImageUploader image={idImage} setImage={setIdImage} sessionid={sessionid} />) },
      { label: 'FaceLiveness', value: 'Tab 2', content: (<>{faceLivenessAnalysis && faceLivenessAnalysis.Confidence ? (
        <ReferenceImage faceLivenessAnalysis={faceLivenessAnalysis} tryagain={tryagain}></ReferenceImage>
      ) :
        (<FaceLiveness faceLivenessAnalysis={getfaceLivenessAnalysis} sessionid={sessionid} loading={loading}/>)}</>) },
      { label: '認証結果確認', value: 'Tab 3', content: (<CompareFace idImage={idImage} faceLivenessAnalysis={faceLivenessAnalysis} sessionid={sessionid} />) },
    ]}
  />
          

        </View>
      </Flex>
    </ThemeProvider>


  );
}

export default App;
