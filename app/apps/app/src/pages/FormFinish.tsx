import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AutoHeightTextarea } from "@app/components/AutoHeightTextarea";
import { CreatorBottomButtons } from "@app/components/CreatorBottomButtons";
import { AlertBanner } from "@app/components/finalStep/AlertBanner";
import useToast from "@app/hooks/useToast";
import ToastTypes from "@app/constants/ToastTypes";
import { firebaseMethods } from "@app/utils/callFirebaseFunction";
import { selectCreation } from "@app/redux/selectors/creation";
import { Messages } from "@app/constants/Messages";
import { AgeRestricationInformation } from "@app/components/AgeRestrictionInformation";
import { LegalPreviewModal } from "@app/components/LegalPreviewModal";
import { callMicroservice } from "@app/utils/callFirebaseMicroservice";

interface FormFinishProps {
  creationId: string;
  prevStepFun: () => void;
}

export function FormFinish({ creationId, prevStepFun }: FormFinishProps) {
  const [summaryText, setSummaryText] = useState<string>("");
  const [isAgeRestricted, setIsAgeRestricted] = useState(false);
  const [disableNextButton, setDisableNextButton] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { openToast } = useToast();

  const { title, audience, genre, attributes, summary } = useSelector(selectCreation);
  const navigate = useNavigate();

  const saveSummaryToFirestore = async () => {
    try {
      await callMicroservice(firebaseMethods.UPDATE_SUMMARY, { creationId, summary: summaryText });
    } catch (error) {
      setSummaryText(summary ?? "");
      openToast(Messages.AUTO_SAVE_FAILED_OLD_VALUE_RESTORED, ToastTypes.ERROR);
    }
  };

  const handleNextStepClick = async () => {
    setDisableNextButton(true);

    const commonnBody = {
      creationId,
      title: title ?? "",
      audience: audience ?? 0,
      genre: genre ?? 0,
      tags: attributes,
      description: summaryText,
      isAgeRestricted,
    };

    try {
      // Trigger bake video
      // This is an asynchronous call, we don't wait for it to finish
      // The status flag will be updated when the video is ready
      // if the video not created it will create it.
      void callMicroservice(firebaseMethods.GENERATE_MOVIE, commonnBody);

      // finish creation
      await callMicroservice(firebaseMethods.FINISH_CREATION, commonnBody);

      // Navigate to creations page
      navigate("/creations");
      openToast("Movie is being generated.", ToastTypes.SUCCESS);
    } catch (err) {
      openToast(Messages.SOMETING_WENT_WRONG, ToastTypes.ERROR);
    } finally {
      setDisableNextButton(false);
    }
  };

  const isSummaryTextValid = (): boolean => {
    return summaryText.trim() !== "";
  };

  useEffect(() => {
    setSummaryText(summary ?? "");
  }, [summary]);

  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900">Finish your movie</h1>
      <p className="mt-1 text-sm text-gray-500">Add final information before your movie is published.</p>

      <div className="overflow-hidden rounded-lg bg-white shadow mt-5">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-end gap-2">
            <div>
              <label htmlFor="summary" className="block text-xl font-medium text-gray-700">
                Preview description
              </label>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Will be shown below your movie and shouldn&apos;t contain spoilers.
              </p>
            </div>
          </div>
          <div>
            <div className="mt-2">
              <AutoHeightTextarea
                rows={6}
                id="summary"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="The text that's being displayed with your movie."
                value={summaryText}
                onChange={e => setSummaryText(e.target.value)}
                onBlur={() => void saveSummaryToFirestore()}
              />
              {!isSummaryTextValid() && (
                <p className="mt-2 text-sm text-red-600" id="email-error">
                  Preview description is required
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 sm:col-span-2 max-w-lg relative flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="isAgeRestricted"
                name="isAgeRestricted"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                onChange={e => setIsAgeRestricted(e.target.checked)}
                checked={isAgeRestricted}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="isAgeRestricted" className="font-medium text-gray-700">
                Age restriction
              </label>
            </div>
            <div className="ml-1 text-sm">
              &#40;
              <span
                className="text-indigo-600 hover:text-indigo-500 cursor-pointer"
                onClick={e => {
                  setShowModal(true);
                  e.stopPropagation();
                }}
              >
                More information
              </span>
              &#41;
            </div>
          </div>
        </div>
      </div>
      <AlertBanner />

      <CreatorBottomButtons
        nextStepFun={handleNextStepClick}
        prevStepFun={prevStepFun}
        nextButtonString="Publish Movie"
        prevButtonString="Back"
        disableNextButton={disableNextButton || !isSummaryTextValid()}
      />
      <LegalPreviewModal
        title="Creator Content Guidelines"
        subtitle="Info about age restriction and undesired content."
        buttonTxt="Close"
        show={showModal}
        onClose={() => setShowModal(false)}
      >
        <AgeRestricationInformation />
      </LegalPreviewModal>
    </>
  );
}
