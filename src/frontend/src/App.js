import './App.css';
import React from "react";
import { Amplify } from 'aws-amplify';
import { ThemeProvider } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import FaceLiveness from './Components/FaceLiveness';
import ReferenceImage from './Components/ReferenceImage';
import ImageUploader from './Components/ImageUploader';
import {
  View,
  Flex,
  Tabs,
} from '@aws-amplify/ui-react';
import { StorageManager } from '@aws-amplify/ui-react-storage';
import '@aws-amplify/ui-react/styles.css';
import awsexports from './aws-exports';

Amplify.configure(awsexports);

function App() {

  const [faceLivenessAnalysis, setFaceLivenessAnalysis] = React.useState(null)

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
           <Tabs
    defaultValue={'Tab 1'}
    items={[
      { label: '本人確認書類アップロード', value: 'Tab 1', content: (<ImageUploader />) },
      { label: 'FaceLiveness', value: 'Tab 2', content: (<>{faceLivenessAnalysis && faceLivenessAnalysis.Confidence ? (
        <ReferenceImage faceLivenessAnalysis={faceLivenessAnalysis} tryagain={tryagain}></ReferenceImage>
      ) :
        (<FaceLiveness faceLivenessAnalysis={getfaceLivenessAnalysis} />)}</>) },
    ]}
  />
          

        </View>
      </Flex>
    </ThemeProvider>


  );
}

export default App;
