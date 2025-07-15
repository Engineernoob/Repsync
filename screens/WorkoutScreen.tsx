// screens/WorkoutScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';

export default function WorkoutScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isTfReady, setIsTfReady] = useState(false);
  const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<typeof Camera | null>(null); // ✅ correct and safe ref

  useEffect(() => {
    let isMounted = true;
    
    (async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (isMounted) setHasPermission(status === 'granted');

        await tf.setBackend('webgl');
        await tf.ready();
        if (isMounted) setIsTfReady(true);

    const detectorConfig: poseDetection.movenet.ModelConfig = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        };
        
        const detectorInstance = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          detectorConfig
        );
        
        if (isMounted) setDetector(detectorInstance);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    })();

    return () => {
      isMounted = false;
      if (detector) {
        detector.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (isTfReady && detector && cameraRef.current) {
      console.log('✅ TensorFlow ready, pose detector loaded');
      // You can run pose detection on an image frame here later
    }
  }, [isTfReady, detector]);

  if (hasPermission === null) return <View />;
  if (hasPermission === false) return <Text>No access to camera</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Repsync 🧠💪</Text>
      
      {error ? (
        <Text style={styles.errorText}>Error: {error}</Text>
      ) : hasPermission ? (
        <Camera
          style={styles.camera}
          type={Camera.Constants.Type.front}
          ref={cameraRef}
        >
          <View style={styles.overlay}>
            {isTfReady && detector ? (
              <Text style={styles.subtitle}>✅ Pose detector ready</Text>
            ) : (
              <ActivityIndicator size="large" color="#fff" />
            )}
          </View>
        </Camera>
      ) : (
        <Text style={styles.subtitle}>Camera permission required</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    width: '100%',
    height: '70%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});
