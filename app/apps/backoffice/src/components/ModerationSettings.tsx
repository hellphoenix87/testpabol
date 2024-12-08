import { useState } from "react";
import SelectMenu from "./selectMenu";
import { useNavigate } from "react-router-dom";
import { callBackofficeMicroservice, backofficeFirebaseMethods } from "../utils/callFirebaseMicroservice";
import Video from "@backoffice/interfaces/video";

interface ModerationSettingsProps {
  video: Video;
  videoId?: string;
  refuseOnly?: boolean;
}

const REFUSE_REASONS = [
  "Copyright violation of characters",
  "Illegal content",
  "Sexual content",
  "Insulting or defamatory to existing persons",
  "Video reported by users",
  "Others",
];

export function ModerationSettings({ video, videoId, refuseOnly }: ModerationSettingsProps) {
  const [refuseSelected, setRefuseSelected] = useState(false);
  const [refuseReasonText, setRefuseReasonText] = useState("");
  const [selectedRefuseReason, setSelectedRefuseReason] = useState(REFUSE_REASONS[0]);

  const navigate = useNavigate();

  const acceptVideo = () => {
    // Ask the user to confirm the action
    const confirm = window.confirm("Are you sure you want to accept this video?");
    if (!confirm) {
      return;
    }

    callBackofficeMicroservice(backofficeFirebaseMethods.ACCEPT_VIDEO, {
      videoId,
      checkedByModeration: video.checked_by_moderation,
    })
      .then(() => {
        alert("Movie accepted");
        navigate("/moderation");
      })
      .catch(() => alert("Something went wrong"));
  };

  const refuseVideo = () => {
    if (refuseReasonText.trim() === "" && selectedRefuseReason === "Others") {
      alert("Provide refuse reason");
      return;
    }

    // Ask the user to confirm the action
    const confirm = window.confirm("Are you sure you want to refuse this movie?");
    if (!confirm) {
      return;
    }

    callBackofficeMicroservice(backofficeFirebaseMethods.REFUSE_VIDEO, {
      videoId,
      reason: {
        selected_reason: selectedRefuseReason,
        text: refuseReasonText,
      },
    })
      .then(() => {
        alert("Movie refused");
        navigate("/moderation");
      })
      .catch(() => alert("Something went wrong"));
  };

  return (
    <div className="flex flex-col justify-center items-center m-10">
      <ul>
        <li>- If you accept the video, it will be visible for all users.</li>
        <li>
          - If you refuse the video, it will not be visible for all users. Please provide refuse reason, it will be
          sent to the user to explain to him why his video is refused.
        </li>
      </ul>
      <div>
        {!refuseOnly && (
          <button
            type="button"
            className="inline-flex m-4 items-center rounded-md border border-green-300 bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            onClick={acceptVideo}
          >
            Accept
          </button>
        )}

        <button
          type="button"
          className="inline-flex m-4 items-center rounded-md border border-red-300 bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          onClick={() => setRefuseSelected(value => !value)}
        >
          Refuse
        </button>
      </div>
      {refuseSelected && (
        <div className="flex flex-col justify-center items-center">
          <div className="m-6">
            <h1>Select the reason why the video has been refused.</h1>
            <SelectMenu
              label="Refuse reason"
              value={selectedRefuseReason}
              valuesList={REFUSE_REASONS}
              displayedOptionsLsit={REFUSE_REASONS}
              onChange={e => setSelectedRefuseReason(e.target.value)}
            />
          </div>

          <div className="m-6">
            <h1>Type the reason why the video has been refused. This message will be sent to video creator.</h1>
            <h1>This text field is optional but mandatory if 'Others' is selected.</h1>
            <textarea
              className="w-full mt-1"
              value={refuseReasonText}
              onChange={e => setRefuseReasonText(e.target.value)}
            ></textarea>
          </div>

          <button
            type="button"
            className="text-center m-2 items-center rounded-md border border-red-300 bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-60"
            disabled={refuseReasonText.trim() === "" && selectedRefuseReason === "Others"}
            onClick={refuseVideo}
          >
            Confirm Refuse
          </button>
        </div>
      )}
    </div>
  );
}
