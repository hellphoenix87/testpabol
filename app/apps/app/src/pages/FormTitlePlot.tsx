import { useEffect, useState } from "react";
import { CreatorBottomButtons } from "@app/components/CreatorBottomButtons";
import { useDispatch, useSelector } from "react-redux";
import { setCreationMeta, setScenes as setScenesRedux, setSummary } from "@app/redux/slices/creationSlice";
import useToast from "@app/hooks/useToast";
import ToastTypes from "@app/constants/ToastTypes";
import { firebaseMethods } from "@app/utils/callFirebaseFunction";
import { selectCreation } from "@app/redux/selectors/creation";
import { MultiParagraphInput } from "@app/components/multiParagraphInput/MultiParagraphInput";
import Scene from "@app/interfaces/Scene";
import { callMicroservice } from "@app/utils/callFirebaseMicroservice";
import { useValueLengthValidation } from "@app/hooks/useValueLengthValidation";
import { useDebounce } from "@app/hooks/useDebounce";
import useDeepEffect from "@app/hooks/useDeepEffect";
import StringFieldsLength from "@app/constants/StringFiledsLength";
import { useProgressBar } from "./create/context/ProgressBarContext";

const MIN_TITLE_LENGTH = 3;

const MIN_TITLE_LENGTH_ERROR = `Title should be at least ${MIN_TITLE_LENGTH} characters long`;

interface FormTitlePlotProps {
  creationId: string;
  nextStepFun: () => void;
  prevStepFun: () => void;
  showLockSymbol: boolean;
  setUnlockWarningOpen: (value: boolean) => void;
}

export function FormTitlePlot({
  nextStepFun,
  prevStepFun,
  showLockSymbol,
  setUnlockWarningOpen,
  creationId,
}: FormTitlePlotProps) {
  const store = useSelector(selectCreation);

  const [title, setTitle] = useState<string>(store.title ?? "");
  const [scenes, setScenes] = useState<Scene[]>(store.scenes ?? []);

  const dispatch = useDispatch();
  const { openToast } = useToast();

  const isTitleLengthValid = useValueLengthValidation(title, MIN_TITLE_LENGTH);

  const { setShowProgressBar, setProgressBarText, setProgress } = useProgressBar();

  const saveTitleToFirestore = async (title?: string): Promise<void> => {
    if (!isTitleLengthValid) {
      return;
    }

    try {
      await callMicroservice(firebaseMethods.SAVE_TITLE, { title, creationId });
      dispatch(setCreationMeta({ title }));
    } catch (error) {
      setTitle(store.title ?? "");
      openToast("Title auto-save is failed. Old value is restored.", ToastTypes.ERROR);
    }
  };

  const saveScenesToFirestore = async (scenes?: Scene[]): Promise<void> => {
    if (!scenes || !isSceneListValid(scenes)) {
      return;
    }

    try {
      await callMicroservice(firebaseMethods.SAVE_SCENES, { scenes, creationId });
      dispatch(setScenesRedux({ scenes }));
    } catch (error) {
      setScenes(store.scenes ?? []);
      openToast("Scenes auto-save is failed. Old value is restored.", ToastTypes.ERROR);
    }
  };

  const debounceSave = useDebounce(async (title?: string, scenes?: Scene[]): Promise<void> => {
    await Promise.all([saveTitleToFirestore(title), saveScenesToFirestore(scenes)]);
  }, 1200);

  const isSceneListValid = (scenesList?: Scene[]): boolean => {
    const scenesListToValidate = scenesList ?? scenes;

    if (scenesListToValidate.length === 0) {
      return false;
    }

    // Check if all paragraphs have the minimum length
    const someParagraphsAreNotValid = scenesListToValidate.some((scene: Scene) => {
      const desc = scene.desc!;
      return desc.trim().length < StringFieldsLength.MIN_PARAGRAPH_LENGTH;
    });

    return !someParagraphsAreNotValid;
  };

  const handleNextStepClick = async () => {
    if (!isTitleLengthValid && !isSceneListValid()) {
      return;
    }

    setProgressBarText("Generating Summary");
    setShowProgressBar(true);
    setProgress(1);

    try {
      const { summary } = await callMicroservice<{ summary: string }>(firebaseMethods.GENERATE_SUMMARY, {
        creationId,
      });

      dispatch(setSummary({ summary }));
      nextStepFun();
    } catch (err) {
      openToast("Something went wrong, please try again.", ToastTypes.ERROR);
    }
  };

  useEffect(() => {
    if (store.title && store.scenes) {
      setTitle(store.title);
      setScenes(store.scenes);
    }
  }, [creationId, store.title, store.scenes]);

  useDeepEffect(() => {
    void debounceSave(title, scenes);
  }, [title, scenes]);

  return (
    <>
      <div className="flex place-content-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Title and Plot</h1>
      </div>
      <p className="mt-1 text-sm text-gray-500">Edit the title and plot for your movie.</p>

      <div className="rounded-lg bg-white shadow mt-5">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col gap-1 mr-4 w-full">
            <label className="max-w-2xl text-sm text-gray-500">Movie title</label>
            <input
              type="text"
              name="title"
              id="title"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:cursor-not-allowed disabled:opacity-80"
              placeholder="Enter title here"
              value={title}
              disabled={showLockSymbol}
              onChange={e => {
                setTitle(e.target.value);
              }}
            />
            {!isTitleLengthValid && <p className="text-xs text-red-600">{MIN_TITLE_LENGTH_ERROR}</p>}
          </div>

          <div className="mt-4">
            <label className="max-w-2xl text-sm text-gray-500">Plot</label>
            <MultiParagraphInput id="plot" scenes={scenes} disabled={showLockSymbol} onScenesChange={setScenes} />
          </div>
        </div>
      </div>
      <CreatorBottomButtons
        nextStepFun={handleNextStepClick}
        prevStepFun={prevStepFun}
        showLockSymbol={showLockSymbol}
        nextButtonString="Continue"
        prevButtonString="Back"
        setUnlockWarningOpen={setUnlockWarningOpen}
        disableNextButton={showLockSymbol || !isTitleLengthValid || !isSceneListValid()}
      />
    </>
  );
}
