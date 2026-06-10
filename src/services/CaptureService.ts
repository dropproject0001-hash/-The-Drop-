/**
 * CaptureService.ts
 * Browser-based tactical media capture for drop proof evidence.
 * 
 * DESIGN PRINCIPLE: Operational Reliability.
 * Handles camera stream acquisition, photo capture, and video recording
 * with proper permission handling and cleanup.
 */

export interface CaptureResult {
  blob: Blob;
  url: string;
  type: 'image' | 'video';
  timestamp: string;
}

class CaptureService {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  /**
   * Initializes the camera and microphone stream.
   * @param constraints Custom MediaStreamConstraints (optional)
   */
  async initialize(constraints: MediaStreamConstraints = { 
    video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, 
    audio: true 
  }): Promise<MediaStream> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.stream;
    } catch (error) {
      console.error(' [CaptureService] Failed to initialize media stream:', error);
      throw new Error('Access to camera/microphone denied or unavailable.');
    }
  }

  /**
   * Captures a single frame from the current stream as a photo.
   * @returns CaptureResult containing the photo Blob and URL
   */
  async takePhoto(): Promise<CaptureResult> {
    if (!this.stream) throw new Error('CaptureService not initialized');

    const videoTrack = this.stream.getVideoTracks()[0];
    if (!videoTrack) throw new Error('No video track available');

    // Create a temporary video element to grab the frame
    const video = document.createElement('video');
    video.srcObject = this.stream;
    video.muted = true;
    await video.play();

    // Create a canvas to draw the frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create photo blob'));
          return;
        }

        const url = URL.createObjectURL(blob);
        resolve({
          blob,
          url,
          type: 'image',
          timestamp: new Date().toISOString()
        });
      }, 'image/jpeg', 0.85); // 85% quality for tactical balance
    });
  }

  /**
   * Starts recording video from the current stream.
   */
  startRecording(): void {
    if (!this.stream) throw new Error('CaptureService not initialized');
    
    this.recordedChunks = [];
    
    // Check supported mime types
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') 
      ? 'video/webm;codecs=vp9,opus' 
      : 'video/webm';

    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.start();
    console.log(' [CaptureService] Video recording started');
  }

  /**
   * Stops the current recording and returns the video file.
   */
  async stopRecording(): Promise<CaptureResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recorder found'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: this.mediaRecorder?.mimeType || 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        resolve({
          blob,
          url,
          type: 'video',
          timestamp: new Date().toISOString()
        });
        
        this.mediaRecorder = null;
        this.recordedChunks = [];
        console.log(' [CaptureService] Video recording stopped');
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Stops all tracks in the stream and cleans up.
   */
  stopStream(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.recordedChunks = [];
    console.log(' [CaptureService] Media stream stopped and cleaned up');
  }

  /**
   * Checks if permissions are likely granted.
   */
  async checkPermissions(): Promise<boolean> {
    try {
      const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      const microphonePermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return cameraPermission.state === 'granted' && microphonePermission.state === 'granted';
    } catch (e) {
      // Some browsers don't support querying camera/mic directly
      return false;
    }
  }
}

export const captureService = new CaptureService();
