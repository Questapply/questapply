import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import "../find-schools/TourGuide.css";

const FindSchoolsTourGuide = () => {
  const [showTourButton, setShowTourButton] = useState(true);
  const [step, setStep] = useState(0);
  const [activeTourElement, setActiveTourElement] = useState<string | null>(
    null
  );
  const { toast } = useToast();

  const startTour = () => {
    setShowTourButton(false);
    setStep(1);
    toast({
      title: "Tour Started",
      description: "Let's walk through finding schools step by step",
    });
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (step > 0) {
      // Set the active element based on current step
      switch (step) {
        case 1:
          setActiveTourElement("country");
          break;
        case 2:
          setActiveTourElement("state");
          break;
        case 3:
          setActiveTourElement("school");
          break;
        case 4:
          setActiveTourElement("degreeLevel");
          break;
        case 5:
          setActiveTourElement("areaOfStudy");
          break;
        case 6:
          setActiveTourElement("program");
          break;
        case 7:
          setActiveTourElement("orderBy");
          break;
        case 8:
          setActiveTourElement("schoolCard");
          break;
        case 9:
          setActiveTourElement("favorite");
          break;
        case 10:
          setActiveTourElement("details");
          break;
        case 11:
          setActiveTourElement("compare");
          break;
        default:
          setActiveTourElement(null);
      }

      // Auto advance to next step after delay (except for the last step)
      if (step < 12) {
        timer = setTimeout(() => {
          setStep((prevStep) => prevStep + 1);
        }, 3000);
      } else {
        // End tour
        timer = setTimeout(() => {
          setActiveTourElement(null);
          setShowTourButton(true);
          setStep(0);
        }, 3000);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [step]);

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return "First, select your desired country filter";
      case 2:
        return "Now, choose a state if you're looking in a specific region";
      case 3:
        return "Filter by specific schools if you have preferences";
      case 4:
        return "Select your preferred degree level";
      case 5:
        return "Choose your area of study";
      case 6:
        return "Select a specific program you're interested in";
      case 7:
        return "Order results by ranking, cost, or other criteria";
      case 8:
        return "Browse through the school cards with detailed information";
      case 9:
        return "Add schools to favorites for quick access later";
      case 10:
        return "View detailed information about each school";
      case 11:
        return "Compare selected schools side by side";
      default:
        return "";
    }
  };

  if (showTourButton) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={startTour}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full px-6 py-3 flex items-center gap-2 shadow-lg"
        >
          <span className="text-xl">🎓</span>
          Take the Tour
        </Button>
      </div>
    );
  }

  return (
    <>
      {step > 0 && (
        <motion.div
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-purple-800/90 to-indigo-800/90 p-4 rounded-lg shadow-xl max-w-lg text-white border border-purple-500/50 tour-popup"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="mb-2 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Step {step} of 11</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStep(0);
                setShowTourButton(true);
                setActiveTourElement(null);
              }}
              className="text-white hover:bg-purple-700"
            >
              Skip Tour
            </Button>
          </div>

          <p>{getStepDescription()}</p>

          <div className="mt-3 tour-progress-container">
            <div
              className="tour-progress-bar"
              style={{ width: `${(step / 11) * 100}%` }}
            />
          </div>
        </motion.div>
      )}

      {/* The activeTourElement data attribute will be used by CSS to highlight elements */}
      <div
        data-tour-active-element={activeTourElement}
        className="hidden"
      ></div>
    </>
  );
};

export default FindSchoolsTourGuide;
