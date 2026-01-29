import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';
import { createWorker } from 'tesseract.js';
import { VisionContext } from '../types';

let model: cocoSsd.ObjectDetection | null = null;

export async function loadObjectDetectionModel(): Promise<void> {
  if (!model) {
    await tf.ready();
    model = await cocoSsd.load();
    console.log('COCO-SSD model loaded');
  }
}

export async function detectObjects(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) {
  if (!model) {
    await loadObjectDetectionModel();
  }
  return await model!.detect(imageElement);
}

export async function extractText(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<string> {
  try {
    const worker = await createWorker('eng');
    const { data } = await worker.recognize(imageElement);
    await worker.terminate();
    return data.text.trim();
  } catch (error) {
    console.error('Error extracting text:', error);
    return '';
  }
}

export function analyzeDepth(objects: Array<{ class: string; score: number; bbox: number[] }>): string {
  if (objects.length === 0) return 'No objects detected for depth analysis.';

  const sortedBySize = [...objects].sort((a, b) => {
    const areaA = a.bbox[2] * a.bbox[3];
    const areaB = b.bbox[2] * b.bbox[3];
    return areaB - areaA;
  });

  const depthDescriptions: string[] = [];

  sortedBySize.forEach((obj, index) => {
    const area = obj.bbox[2] * obj.bbox[3];
    let depthLevel = '';

    if (index === 0 && area > 50000) {
      depthLevel = 'very close/foreground';
    } else if (area > 30000) {
      depthLevel = 'close';
    } else if (area > 10000) {
      depthLevel = 'middle distance';
    } else {
      depthLevel = 'far/background';
    }

    depthDescriptions.push(`${obj.class} (${depthLevel})`);
  });

  return depthDescriptions.join(', ');
}

export async function processVisionSnapshot(
  canvas: HTMLCanvasElement
): Promise<VisionContext> {
  const timestamp = new Date();

  const objects = await detectObjects(canvas);

  const text = await extractText(canvas);

  const depthInfo = analyzeDepth(objects);

  const objectsSummary = objects.length > 0
    ? objects.map(obj => `${obj.class} (${Math.round(obj.score * 100)}%)`).join(', ')
    : 'No objects detected';

  const description = `At ${timestamp.toLocaleTimeString()}, the camera detected: ${objectsSummary}. ${
    text ? `Text visible: "${text}". ` : ''
  }Depth ordering: ${depthInfo}.`;

  return {
    timestamp,
    objects: objects.map(obj => ({
      class: obj.class,
      score: obj.score,
      bbox: obj.bbox
    })),
    text,
    description
  };
}
