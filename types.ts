
export type RatingLevel = 1 | 2 | 3 | 4; // 1: Poor, 2: Needs Improvement, 3: Average, 4: Good

export interface RatingOption {
  level: RatingLevel;
  label: string;
  emoji: string;
  color: string;
}

export interface Question {
  id: number;
  text: string;
}

export interface FeedbackResponse {
  questionId: number;
  rating: RatingLevel;
}

export interface FeedbackSubmission {
  id: string;
  timestamp: number;
  site: string;
  canteen: string;
  name?: string;
  username?: string;
  responses: FeedbackResponse[];
}
