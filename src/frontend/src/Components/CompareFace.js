import React, { useState, useEffect } from "react";
import { Badge, Button, Card, Alert } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

function CompareFaceResult({ idImage, faceLivenessAnalysis, sessionid }) {

    const endpoint = process.env.REACT_APP_ENV_API_URL ? process.env.REACT_APP_ENV_API_URL : '';
    const [similarityScore, setSimilarityScore] = React.useState(true);


    const checkSimilarity = async () => {
        // この部分では、API呼び出しのためのキー等のデータが必要になります。
        const response = await fetch(`${endpoint}getcomparefaceresult?${new URLSearchParams({ key: sessionid })}`, {
            method: 'GET', // 適切なHTTPメソッドを設定
            // headers: {
            //     'Accept': 'application/json',
            //     'Content-Type': 'application/json'
            // }
            // 必要に応じて認証ヘッダー等を追加
        });
        const data = await response.json();
        // setImageUrls({ url1: data.url1, url2: data.url2 });
        setSimilarityScore(data.similarityScore);
    };

    return (
        <>
            <div>
                <Alert variation="info">Check "ID Image" and image "FaceLiveness Image", and click "Send" button to check Similarity. </Alert>
                <Card>
                    <div> <Badge>ID Image</Badge> </div>
                    <div> <img src={idImage} alt="Face 1" /></div>
                </Card>
                <Card>
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
                <Card>
                    <Alert variation="success">
                        <div>
                            Similarity Score: {similarityScore}%
                        </div>
                    </Alert>
                </Card>
            </div>
        </>
    );
}

export default CompareFaceResult;
