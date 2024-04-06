"use client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface ScoreModalProps {
  score: number;
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
}

const FlashcardModal: React.FunctionComponent<ScoreModalProps> = ({
  score,
  isOpen,
  onClose,
  onRestart,
}) => {
  const router = useRouter();
  return (
    <Dialog open={isOpen}>
      <DialogContent className="p-8 text-center text-white">
        <DialogTitle className="font-bold text-2xl mb-4 text-black">
          Your Score: {score}
        </DialogTitle>
        <div className="relative mt-4 inline-flex justify-center items-center">
          <span className="score rounded-full text-black font-bold text-2xl px-4 py-2">
            {score}
          </span>
          <div className="absolute rounded-full border-4 border-blue-500 h-16 w-16 animate-spin"></div>
        </div>
        <div className="text-xl font-bold mb-4 text-black mt-4">
          {score === 0
            ? "Complete!"
            : score === 1
            ? "Complete!"
            : "Congratulations!"}
        </div>
        <div className="text-lg mb-4 text-black">
          {score === 0
            ? "You can do better! Do you want to restart the quiz?"
            : score === 1
            ? "Continue to learn more terms that you missed!"
            : "You're already done! Great job!"}
        </div>
        <div className="flex flex-col justify-center gap-4">
          <button
            onClick={onRestart}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-md w-full"
          >
            Restart flashcard
          </button>
          <button
            onClick={() => {
              onClose();
              router.back(); // Go back to the previous page
            }}
            className="px-4 py-2 bg-red-500 hover:bg-red-700 text-white font-bold rounded-md w-full"
          >
            Leave this flashcard
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FlashcardModal;
