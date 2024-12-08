import { useState, useEffect } from "react";
import AlertModal from "@app/components/AlertModal";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTitlePlotMeta,
  fetchScenes,
  resetStore,
  setCreationId,
  setMaxStep as setMaxStepAction,
} from "@app/redux/slices/creationSlice";
import ProgressBar from "@app/components/ProgressBar";
import { MobileMenu } from "@app/components/create/MobileMenu";
import { NAVIGATION } from "@app/components/Navigation";
import { DesktopMenu } from "@app/components/create/DesktopMenu";
import { MobileHeader } from "@app/components/create/MobileHeader";
import { showLockSymbol } from "@app/creatorUtils";
import { classNames } from "@frontend/utils/classNames";
import { useParams, useNavigate } from "react-router-dom";
import { firebaseMethods } from "@app/utils/callFirebaseFunction";
import { callMicroservice } from "@app/utils/callFirebaseMicroservice";
import { logger } from "@app/utils/logger";
import useToast from "@app/hooks/useToast";
import ToastTypes from "@app/constants/ToastTypes";
import { selectCreation } from "@app/redux/selectors/creation";
import { useProgressBar } from "./create/context/ProgressBarContext";

export default function Create() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [unlockWarningOpen, setUnlockWarningOpen] = useState(false);

  const { showProgressBar, setShowProgressBar, setProgressBarText, setProgress } = useProgressBar();

  const { cid } = useParams();
  const navigate = useNavigate();

  const { openToast } = useToast();

  const creation = useSelector(selectCreation);
  const dispatch = useDispatch();

  const onUnlock = () => {
    setMaxStep(currentStep);
  };

  const stepActions = {
    1: fetchTitlePlotMeta,
    2: fetchScenes,
  };

  // Whenever maxStep is changed, call "setMaxStep"
  useEffect(() => {
    if (creation.creationId && creation.creationId !== "" && creation.creationId !== "new" && maxStep > 0) {
      void callMicroservice(firebaseMethods.SET_MAX_STEP, { creationId: creation.creationId, maxStep });
    }
  }, [maxStep]);

  async function initializeCreation() {
    setProgressBarText("Loading your creation");
    setShowProgressBar(true);

    try {
      const response = await callMicroservice(firebaseMethods.GET_CREATION_TITLE_PLOT_META, { creationId: cid });
      const maxStep = response.maxStep > NAVIGATION.length - 1 ? NAVIGATION.length - 1 : response.maxStep;

      dispatch(setCreationId({ creationId: cid }));

      setMaxStep(maxStep);
      setCurrentStep(maxStep);

      // Fetch creation data
      for (const step of Object.keys(stepActions)) {
        await dispatch(stepActions[step](cid));
      }

      setProgress(99);
    } catch (error: any) {
      if (error.response.status === 401) {
        openToast("You are not authorized to access this creation", ToastTypes.ERROR);
        navigate("/creations");
        return;
      }
      // If creation is not found
      logger.error(error);
      navigate("/*");
    }
  }

  useEffect(() => {
    dispatch(resetStore());

    if (cid && cid.match(/[a-zA-Z0-9-]{20}$/g)) {
      // If cid is valid, initilize project
      void initializeCreation();
    } else if (cid && cid === "new") {
      // If cid === new, create a new project (set first step)
      setMaxStep(0);
      setCurrentStep(0);
      setProgressBarText("Creating a new project");
      setShowProgressBar(true);
      setProgress(99);
    } else {
      navigate("/*");
    }
  }, []);

  useEffect(() => {
    setCreationId({ creationId: cid });
    if (cid && cid === "new") {
      // If cid === new, create a new project (set first step)
      setMaxStep(0);
      setCurrentStep(0);
      dispatch(setCreationId({ creationId: cid }));
    }
  }, [cid]);

  // Set maxStep to max(maxStep, currentStep)
  useEffect(() => {
    setMaxStep(Math.max(maxStep, currentStep));
  }, [currentStep]);

  useEffect(() => {
    dispatch(setMaxStepAction({ maxStep }));
  }, [maxStep]);

  const CurrentForm = NAVIGATION[currentStep].form;

  const nextStepFun = () => {
    if (currentStep < NAVIGATION.length - 1) {
      setCurrentStep(currentStep + 1);
      setProgress(98);
    }
  };

  const prevStepFun = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className={showProgressBar ? "pointer-events-none" : ""}>
      <AlertModal open={unlockWarningOpen} setOpen={setUnlockWarningOpen} onAction={onUnlock} />
      <MobileMenu
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentStep={currentStep}
        maxStep={maxStep}
        setCurrentStep={setCurrentStep}
      />
      <DesktopMenu currentStep={currentStep} maxStep={maxStep} setCurrentStep={setCurrentStep} />
      <div className="flex flex-1 flex-col md:pl-64 w-full bg-gray-100 min-h-screen">
        <MobileHeader setSidebarOpen={setSidebarOpen} />
        <div className="py-6">
          <div className={classNames("relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8")}>
            {showProgressBar ? (
              <ProgressBar maxStep={maxStep} />
            ) : (
              <CurrentForm
                nextStepFun={nextStepFun}
                prevStepFun={prevStepFun}
                showLockSymbol={showLockSymbol(currentStep, maxStep)}
                setUnlockWarningOpen={setUnlockWarningOpen}
                creationId={creation.creationId!}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
