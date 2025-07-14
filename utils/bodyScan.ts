// utils/bodyScan.ts
export function bodyScan(poseLandmarks: any[]) {
    if (!poseLandmarks || poseLandmarks.length === 0) return null;
  
    const dist = (a: any, b: any) =>
      Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  
    const leftShoulder = poseLandmarks[11];
    const rightShoulder = poseLandmarks[12];
    const leftHip = poseLandmarks[23];
    const rightHip = poseLandmarks[24];
    const nose = poseLandmarks[0];
  
    const leftArmLength =
      dist(poseLandmarks[11], poseLandmarks[13]) +
      dist(poseLandmarks[13], poseLandmarks[15]);
    const rightArmLength =
      dist(poseLandmarks[12], poseLandmarks[14]) +
      dist(poseLandmarks[14], poseLandmarks[16]);
  
    const leftLegLength =
      dist(poseLandmarks[23], poseLandmarks[25]) +
      dist(poseLandmarks[25], poseLandmarks[27]);
    const rightLegLength =
      dist(poseLandmarks[24], poseLandmarks[26]) +
      dist(poseLandmarks[26], poseLandmarks[28]);
  
    const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
    const hipDiff = Math.abs(leftHip.y - rightHip.y);
    const spineTilt = Math.abs(nose.x - (leftHip.x + rightHip.x) / 2);
  
    const observations: string[] = [];
    if (shoulderDiff > 0.05) observations.push('Shoulder imbalance detected');
    if (hipDiff > 0.05) observations.push('Hip tilt present');
    if (spineTilt > 0.05) observations.push('Spine alignment shows forward lean');
  
    return {
      shoulderSymmetry: shoulderDiff < 0.05 ? 'Good' : 'Imbalance',
      spineAlignment: spineTilt < 0.05 ? 'Neutral' : 'Forward Tilt',
      leftArmLength: Number(leftArmLength.toFixed(3)),
      rightArmLength: Number(rightArmLength.toFixed(3)),
      leftLegLength: Number(leftLegLength.toFixed(3)),
      rightLegLength: Number(rightLegLength.toFixed(3)),
      observations,
    };
  }