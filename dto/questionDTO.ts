export interface QuestionDTO {
  question: string;
  answers: [
    {
      text: string;
      isCorrect: boolean;
    },
    {
      text: string;
      isCorrect: boolean;
    },
    {
      text: string;
      isCorrect: boolean;
    },
    {
      text: string;
      isCorrect: boolean;
    }
  ];
}
