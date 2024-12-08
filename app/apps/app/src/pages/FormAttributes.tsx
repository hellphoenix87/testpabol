import { useEffect, useState } from "react";
import { genreList, ageGroupList, attributeList } from "@frontend/listData";
import { DropDown } from "@app/components/DropDown";
import { CreatorBottomButtons } from "@app/components/CreatorBottomButtons";
import { useDispatch, useSelector } from "react-redux";
import { setCreationId, setCreationMeta, setScenes } from "@app/redux/slices/creationSlice";
import useToast from "@app/hooks/useToast";
import ToastTypes from "@app/constants/ToastTypes";
import { useNavigate } from "react-router-dom";
import { firebaseMethods } from "@app/utils/callFirebaseFunction";
import { callMicroservice } from "@app/utils/callFirebaseMicroservice";
import { AutoHeightTextarea } from "@app/components/AutoHeightTextarea";
import { selectCreation } from "@app/redux/selectors/creation";
import { AttributesPicker } from "@app/components/AttributesPicker";
import Scene from "@app/interfaces/Scene";
import { useProgressBar } from "./create/context/ProgressBarContext";
import { MAX_USER_TEXT_LENGTH, USER_TEXT_INVALID_MESSAGE } from "@shared/constants/fieldsLengthValidation";

const removeTag = (attribute: string) => (tags: string[]) => {
  return tags.filter(tag => tag !== attribute);
};

const saveTag = (attribute: string) => (tags: string[]) => {
  return [...tags, attribute];
};

export function FormAttributes({ nextStepFun, prevStepFun, showLockSymbol, setUnlockWarningOpen }) {
  const [tagList, setTagList] = useState<string[]>([]);
  const [tagListUnset, setTagListUnset] = useState(attributeList);
  const [audience, setAudience] = useState(0);
  const [genre, setGenre] = useState(0);
  const [userText, setUserText] = useState("");

  const { openToast } = useToast();
  const store = useSelector(selectCreation);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setShowProgressBar, setProgressBarText, setProgress } = useProgressBar();

  useEffect(() => {
    setGenre(store.genre ?? 0);
    setAudience(store.audience ?? 0);
    setTagList(store.attributes ?? []);
    setUserText(store.userText ?? "");
    // Eliminate selected attributes from tagListUnset
    setTagListUnset(attributeList.filter(item => !store.attributes.includes(item)));
  }, [store.genre, store.audience, store.attributes, store.userText]);

  const handleRemoveAttribute = attribute => {
    if (!showLockSymbol) {
      setTagList(removeTag(attribute));
      setTagListUnset(saveTag(attribute));
    }
  };

  const handleAddAttribute = attribute => {
    if (!showLockSymbol) {
      setTagList(saveTag(attribute));
      setTagListUnset(removeTag(attribute));
    }
  };

  const isUserTextValid = () => userText.length <= MAX_USER_TEXT_LENGTH;

  const handleNextStepClick = async () => {
    if (showLockSymbol) {
      nextStepFun();
      return;
    }
    setProgressBarText("Generating Title and Plot");
    setShowProgressBar(true);
    setProgress(1);

    const newCreation = store.creationId === "new";

    try {
      // Save meta information to database with firestore http function
      const data = await callMicroservice<{ creationId: string; title: string; scenes: Scene[] }>(
        firebaseMethods.GENERATE_TITLE_AND_PLOT,
        {
          newCreation,
          creationId: store.creationId,
          attributes: tagList,
          genre,
          audience,
          userText,
        }
      );

      if (newCreation) {
        dispatch(setCreationId({ creationId: data.creationId }));
        navigate(`/create/${data.creationId}`, { replace: true });
      }

      dispatch(
        setCreationMeta({
          genre,
          audience,
          attributes: tagList,
          title: data.title,
          userText,
        })
      );

      dispatch(setScenes({ scenes: data.scenes }));
      nextStepFun();
    } catch (error) {
      openToast("Something went wrong, please try again.", ToastTypes.ERROR);
    }
  };

  return (
    <>
      <div className="flex place-content-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Attributes</h1>
      </div>
      <p className="mt-1 text-sm text-gray-500">Let&apos;s get started! What movie do you want to create?</p>
      <div className="overflow-hidden rounded-lg bg-white shadow mt-5">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-6 gap-6">
            <DropDown
              desc="Genre"
              name="genre"
              content={genreList}
              className="col-span-6 sm:col-span-3"
              disabled={showLockSymbol}
              value={genre}
              onChange={setGenre}
            />
            <DropDown
              desc="Audience"
              name="audience"
              content={ageGroupList}
              className="col-span-6 sm:col-span-3"
              disabled={showLockSymbol}
              value={audience}
              onChange={setAudience}
            />
          </div>
          <div className="col-span-12 sm:col-span-12">
            <label htmlFor="labels" className="block text-sm text-gray-700 mt-4">
              Attributes
            </label>

            <AttributesPicker
              tagList={tagList}
              tagListUnset={tagListUnset}
              onAddAttribute={handleAddAttribute}
              onRemoveAttribute={handleRemoveAttribute}
            />

            <label htmlFor="labels" className="block text-sm text-gray-700 mt-4">
              Additional Info{" "}
              {!isUserTextValid() && (
                <span data-testid="userTextError" className="text-red-500 text-sm">
                  ({USER_TEXT_INVALID_MESSAGE})
                </span>
              )}
            </label>

            <div className="mt-1">
              <AutoHeightTextarea
                rows={5}
                id="userText"
                className="h-full block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder={"Example: Make a movie that takes place in Berlin with a protagonist named Tom..."}
                disabled={showLockSymbol}
                value={userText}
                onChange={e => {
                  setUserText(e.target.value);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <CreatorBottomButtons
        nextStepFun={handleNextStepClick}
        prevStepFun={prevStepFun}
        showLockSymbol={showLockSymbol}
        disableNextButton={!isUserTextValid()}
        nextButtonString={showLockSymbol ? "Continue" : "Save and Continue"}
        setUnlockWarningOpen={setUnlockWarningOpen}
      />
    </>
  );
}
