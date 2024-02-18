import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
};



export default ({image, setImage, sessionid }) => {
    console.log(sessionid);
    const webcamRef = useRef(null);
    const [presignedURL, setPresignedURL] = useState(null);
    const endpoint = process.env.REACT_APP_ENV_API_URL ? process.env.REACT_APP_ENV_API_URL : ''

    const getPresignedUrl = async () => {
        const response = await fetch(endpoint + 'uploadsignedurl?' + new URLSearchParams({key: sessionid}));
        const data = await response.json();
        console.log("------ uploadsignedurl response ------");
        console.log(data)
        
        const url = data.body
        console.log({url})
        setPresignedURL(url)
    }

    /*
   * Get the Face Liveness Session Result
   */
    const handleUploadImagetoS3 = async (presignedURL, imageSrc) => {
        /*
         * API call to get the Face Liveness Session result
         */
        const res = await fetch(imageSrc)
        const blob = await res.blob()

        const response = await fetch(presignedURL, {
            method: 'PUT',
            body: blob,
            headers: {
                'Content-Type': 'image/jpeg',
            }
        })

        if (!response.ok) {
            alert("エラーが発生しました")
            console.error("Erorr")
            console.error(response)
            return {
                body: null
            };
        }
        alert("アップロード完了");
    };

    const capture = useCallback(async () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setImage(imageSrc);
            getPresignedUrl()
        }        
    }, [webcamRef]);

    return (
        <>
            <header>
                <h1>カメラアプリ</h1>
            </header>
            SessionID: {sessionid}
            {(
                <>
                    <div>
                        <Webcam
                            audio={false}
                            width={540}
                            height={360}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                        />
                    </div>
                    <button onClick={capture}>キャプチャ</button>
                </>
            )}
            {image && (
                <>
                    <div>
                        <img src={image} alt="Screenshot" />
                    </div>

                    <div>
                        <button
                            onClick={() => {
                                handleUploadImagetoS3(presignedURL, image)
                            }}
                        >
                            送信
                        </button>
                    </div>
                </>
            )}
        </>
    );
};
