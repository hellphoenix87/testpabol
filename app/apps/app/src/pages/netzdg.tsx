import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { PrimaryButton } from "@frontend/buttons";
import NavBar from "../Navbar";
import callFirebaseFunction, { firebaseMethods } from "../utils/callFirebaseFunction";
import useToast from "../hooks/useToast";
import ToastTypes from "../constants/ToastTypes";
import { SyntheticEvent, useState } from "react";
import NetzdgInput from "../components/netzdg/NetzdgInput";
import NetzdgSelect from "../components/netzdg/NetzdgSelect";
import { useNavigate } from "react-router-dom";

interface NetzdgFormValues {
  email: string;
  affiliation: string;
  issueType: string;
  contentUrl: string;
  description: string;
  signature: string;
}

const NETZDG_DEFAULT_VALUES: NetzdgFormValues = {
  email: "",
  affiliation: "",
  issueType: "",
  contentUrl: "",
  description: "",
  signature: "",
};

function areFieldsNonEmpty(obj: NetzdgFormValues): boolean {
  for (const key in obj) {
    if (obj[key].trim() === "") {
      return false;
    }
  }
  return true;
}

export default function NetzdgPage() {
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState<NetzdgFormValues>(NETZDG_DEFAULT_VALUES);
  const [formError, setFormError] = useState<boolean>(false);

  const { openToast } = useToast();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = (event: SyntheticEvent<Element, Event>) => {
    event.preventDefault();
    setFormError(false);

    if (!areFieldsNonEmpty(formValues) || !formValues.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setFormError(true);
      return;
    }
    callFirebaseFunction(firebaseMethods.SEND_NETZDG_EMAIL, formValues)
      .then(() => {
        setFormValues(NETZDG_DEFAULT_VALUES);
        navigate("/");
        openToast("Your complaint is successfully submitted.", ToastTypes.SUCCESS);
      })
      .catch(() => {
        openToast("Something went wrong. Please try again.", ToastTypes.ERROR);
      });
  };

  return (
    <div className="App">
      <NavBar />
      <div className="bg-white px-4 pt-10 pb-24 lg:px-4">
        <div className="flex flex-col items-center justify-center mx-auto max-w-4xl text-base leading-7 text-gray-700">
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Report content under the Network Enforcement Law
          </h1>

          <div className="mt-10 max-w-3xl">
            <p>
              On June 30, 2017, the German government adopted the Network Enforcement Law (NetzDG). NetzDG sets
              requirements for how some social media networks have to process legal complaints against content that may
              violate specific German criminal codes concerning the following issues:
            </p>
            <ul role="list" className="mt-2 ml-4 max-w-xl space-y-1 text-gray-600 list-disc">
              <li className="gap-x-3">Sexual content</li>
              <li className="gap-x-3">Violence</li>
              <li className="gap-x-3">Hate speech or political extremism</li>
              <li className="gap-x-3">Harmful or dangerous acts</li>
              <li className="gap-x-3">Terrorist or unconstitutional content</li>
              <li className="gap-x-3">Defamation or insult</li>
              <li className="gap-x-3">Privacy</li>
            </ul>

            <p className="mt-3">The specific criminal codes covered under NetzDG are listed in Art. 1 §1(3).</p>
            <div className="flex flex-row gap-5 p-5 items-center justify-center bg-orange-100 rounded-lg mt-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-orange-600" />
              <p className="font-bold">
                Please note abuse of our legal forms may result in the termination of a pabolo account where
                applicable.
              </p>
            </div>
            <p className="mt-6 text-sm">* Required field</p>

            <NetzdgInput label="Contact email address *" type="email" name="email" handleChange={handleChange} />

            <NetzdgSelect label="Affiliation *" name="affiliation" handleChange={handleChange}>
              <option value="User">User</option>
              <option value="Reporting Agency">Reporting Agency</option>
            </NetzdgSelect>

            <NetzdgInput
              label="Content URL at issue *"
              type="text"
              name="contentUrl"
              handleChange={handleChange}
              comment="(submit channel, video, or comment URLs)"
            />

            <NetzdgSelect label="Issue Type *" name="issueType" handleChange={handleChange}>
              <option value="Sexual content">Sexual content</option>
              <option value="Violence">Violence</option>
              <option value="Hate speech or political extremism">Hate speech or political extremism</option>
              <option value="Harmful or dangerous acts">Harmful or dangerous acts</option>
              <option value="Terrorist or unconstitutional content">Terrorist or unconstitutional content</option>
              <option value="Defamation or insult">Defamation or insult</option>
              <option value="Privacy">Privacy</option>
            </NetzdgSelect>

            <div className="max-w-3xl mt-10">
              <label htmlFor="description" className="block text-sm leading-6">
                Briefly describe in your words why the content is objectionable. If your complaint relates to a video,
                indicate where in the video the content in question is located (e.g. "Inappropriate images at minute
                0:20"). *
              </label>
              <div className="mt-2">
                <textarea
                  name="description"
                  id="description"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  rows={3}
                  onChange={handleChange}
                />
              </div>
            </div>

            <NetzdgInput
              label="Agree to the following statement: I declare that the information in this notice is true and complete.
                Typing your full name in the box below will act as your digital signature. *"
              type="text"
              name="signature"
              handleChange={handleChange}
            />

            <p className="mt-10 text-sm">
              Please note that data will be stored in accordance with pabolo's privacy policy.
            </p>
            <p className="mt-10 text-sm">
              By submitting a legal complaint to pabolo, you agree that pabolo may publish information about your
              notice in an anonymised form.
            </p>
            <p className="mt-4 text-sm">
              In accordance with the Network Enforcement Law, we may forward your complaint to the user, to give them
              an opportunity to respond to the complaint.
            </p>
          </div>

          <PrimaryButton className="mt-6" onClick={handleSubmit}>
            Submit
          </PrimaryButton>

          {formError && (
            <div className="flex flex-col items-center justify-center text-sm text-red-600 mt-1">
              <p>We couldn't submit your form yet.</p> <p> Please make sure that all fields are filled up.</p>
            </div>
          )}

          <p className="text-xs max-w-3xl mt-8">
            Some account and system information will be sent to pabolo, and support calls and chats may be recorded. We
            will use this information to improve support quality and training, to help address technical issues, and to
            improve our products and services, subject to our Privacy Policy and Terms of Service. Translation services
            may be used in chats and email.
          </p>
        </div>
      </div>
    </div>
  );
}
