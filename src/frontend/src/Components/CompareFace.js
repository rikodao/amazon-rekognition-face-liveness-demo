import  { useState } from "react";
import { Badge, Button, Card, Alert } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

function CompareFaceResult({ idImage, faceLivenessAnalysis, sessionid }) {

    const endpoint = process.env.REACT_APP_ENV_API_URL ? process.env.REACT_APP_ENV_API_URL : '';
    const [similarityScore, setSimilarityScore] = useState();
    const [croppedImageUrl, setCroppedImageUrl] = useState();


    const checkSimilarity = async () => {
        // この部分では、API呼び出しのためのキー等のデータが必要になります。
        const response = await fetch(`${endpoint}getcomparefaceresult?${new URLSearchParams({ key: sessionid })}`, {
            method: 'GET',
        });
        const data = await response.json();

        setSimilarityScore(data.similarityScore);
        setCroppedImageUrl(data.croppedImage)

    };

    const resultComponet = (similarityScore, croppedImageUrl) => {
        if (similarityScore==null) return <></>
        
        return (<><Card variation="elevated">
            <Alert variation="success">
                <div>
                    Similarity Score: {similarityScore}%
                </div>
            </Alert>
            <div>
                <div>
                    <Badge>ID doc face crop image</Badge>
                </div>
                <img src={croppedImageUrl} />

            </div>

        </Card >
        </>)
    }

    return (
        <>
            <div>
                <Alert variation="info">Check "ID Image" and image "FaceLiveness Image", and click "Send" button to check Similarity. </Alert>
                <Card variation="elevated">
                    <div> <Badge>ID Image</Badge> </div>
                    <div> <img src={idImage} alt="Face 1" /></div>
                </Card>
                <Card variation="elevated">
                    <div>
                        <Badge>FaceLiveness Image</Badge> </div>
                    <div>
                        <img src={"data:image/jpeg;base64," + faceLivenessAnalysis?.ReferenceImage?.Bytes} alt="Face 2" />
                    </div>
                </Card>
                <div>
                    <Button
                        onClick={checkSimilarity}
                    >
                        Check
                    </Button>
                </div>
                {resultComponet(similarityScore, croppedImageUrl)}
            </div>
        </>
    );
}

export default CompareFaceResult;
