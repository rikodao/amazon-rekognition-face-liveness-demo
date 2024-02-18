import React, { useState, useEffect } from "react";
import { Loader } from '@aws-amplify/ui-react';
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
                <h2>Face Comparison Results</h2>
                <div> ID Image: <img src={idImage} alt="Face 1" style={{ width: "200px", height: "200px" }} /></div>
                <div>
                    FaceLiveness Image:
                    <img src={"data:image/jpeg;base64," + faceLivenessAnalysis?.ReferenceImage?.Bytes} alt="Face 2" style={{ width: "200px", height: "200px" }} />
                </div>
                <div>
                    <button
                        onClick={checkSimilarity}
                    >
                        送信
                    </button>
                </div>

                <p>Similarity Score: {similarityScore}%</p>
            </div>
        </>
    );
}

export default CompareFaceResult;
