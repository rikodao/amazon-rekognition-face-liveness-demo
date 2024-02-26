import {
    Image,
    Button,
    Alert,
    Card,
    View,
    SelectField
} from '@aws-amplify/ui-react';
import { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
};


export default ({ image, setImage, sessionid }) => {
    const endpoint = process.env.REACT_APP_ENV_API_URL ? process.env.REACT_APP_ENV_API_URL : ''
    const webcamRef = useRef(null);
    const [presignedURL, setPresignedURL] = useState(null);
    const [deviceId, setDeviceId] = useState(videoConstraints);
    const [devices, setDevices] = useState([]);

    const handleDevices = useCallback(
        mediaDevices =>
            setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput")),
        [setDevices]
    );

    useEffect(
        () => {
            navigator.mediaDevices.enumerateDevices().then(handleDevices);
        },
        [handleDevices]
    );
    const cameraSelector = () => {
        const option = devices.map((device) => <option value={device.deviceId}>{device.label}</option>)

        return (
            <SelectField
                label="Select your camera device"
                value={deviceId.deviceId}
                onClick={() => {
                    navigator.mediaDevices.enumerateDevices().then(handleDevices);
                }}
                onChange={(e) => {
                    setDeviceId({...videoConstraints, deviceId: e.target.value})
            }}
                >
                {option}
            </SelectField>
            
        )
    }

    const getPresignedUrl = async () => {
        const response = await fetch(endpoint + 'uploadsignedurl?' + new URLSearchParams({ key: sessionid }));
        const data = await response.json();
        console.log("------ uploadsignedurl response ------");
        console.log(data)

        const url = data.body
        console.log({ url })
        setPresignedURL(url)
    }
    useEffect(() => {
        getPresignedUrl()

    }, [sessionid])




    /*
   * Get the Face Liveness Session Result
   */
    const handleUploadImagetoS3 = async (imageSrc) => {
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
        }
    }, [webcamRef]);

    return (
        <>
            <header>
                <Alert variation="info">Click "Capture" button to Take photo of your identity verification document with face photo.Then "Send" button to upload file. </Alert>
            </header>
            {(
                <>
                    <View as="div" borderRadius="6px" boxShadow="3px 3px 5px 6px var(--amplify-colors-neutral-60)">
                        <Card variation="elevated">
                            <div>
                                <Webcam
                                    audio={false}
                                    width={540}
                                    height={360}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    videoConstraints={deviceId}
                                />
                            </div>
                            <div>{cameraSelector()}</div>
                            <Button onClick={capture}>Capture</Button>
                        </Card>
                    </View>
                </>
            )}
            {image && (
                <>
                    <View as="div" borderRadius="6px" boxShadow="3px 3px 5px 6px var(--amplify-colors-neutral-60)">
                        <Card variation="elevated">
                            <div>
                                <Image src={image} alt="Screenshot" />
                            </div>

                            <div>
                                <Button
                                    onClick={() => {
                                        handleUploadImagetoS3(image)
                                    }}
                                >
                                    Send
                                </Button>
                            </div>
                        </Card>
                    </View>
                </>
            )}
        </>
    );
};
