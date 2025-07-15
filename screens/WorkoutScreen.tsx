// screens/WorkoutScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';

// Helper type for the ref
type CameraRef = React.ComponentRef<typeof CameraView>;

export default function WorkoutScreen() {
  const cameraRef = useRef<CameraRef | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  
  // State
  const [tfReady, setTfReady] = useState(false);
  const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // One-time setup
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Request camera permission if not already granted
        if (!permission?.granted) {
          const result = await requestPermission();
          if (!result.granted) {
            setError('Camera permission denied');
            setIsLoading(false);
            return;
          }
        }

        // Initialize TensorFlow
        await tf.ready();
        
        // Set backend based on platform
        if (Platform.OS === 'web') {
          await tf.setBackend('webgl');
        } else {
          // For mobile, use cpu backend as webgl might not be available
          await tf.setBackend('cpu');
        }
        
        setTfReady(true);

        // Load MoveNet (SinglePose Lightning)
        const detectorCfg: poseDetection.MoveNetModelConfig = { 
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING 
        };
        
        const detectorInst = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          detectorCfg,
        );
        
        setDetector(detectorInst);
        setIsLoading(false);
        
      } catch (err) {
        console.error('Error initializing app:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize');
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [permission]);

  // Confirm everything is ready
  useEffect(() => {
    if (tfReady && detector && !error) {
      console.log('✅ Pose detector ready');
    }
  }, [tfReady, detector, error]);

  // Permission guards
  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Requesting camera permission...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Camera access denied</Text>
          <Text style={styles.errorSubtext}>Please enable camera permissions in settings</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
        ratio="16:9"
      />
      <View style={styles.banner}>
        {tfReady && detector && !isLoading ? (
          <Text style={styles.bannerText}>Pose detector ready ✅</Text>
        ) : (
          <>
            <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.bannerText}>Loading model...</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  camera: { 
    flex: 1 
  },
  banner: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerText: { 
    color: '#fff', 
    fontSize: 14 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubtext: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});