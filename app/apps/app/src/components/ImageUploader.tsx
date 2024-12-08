import { PropsWithChildren, useRef } from "react";
import { storage } from "../firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useSelector } from "react-redux";
import { selectUser } from "@app/redux/selectors/user";

interface ImageUploaderProps {
  fieldName: string;
  onUpload?: (metadata: string) => void;
  onChange?: (file: File) => void;
}

export default function ImageUploader({
  fieldName,
  children,
  onUpload,
  onChange,
}: PropsWithChildren<ImageUploaderProps>) {
  // If onUpload is not provided, the file will be uploaded to Firebase Storage when image changes
  // If onChange is not provided, the file will be handled by parent component

  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = useSelector(selectUser);

  const changeHandler = event => {
    const file = event.target.files[0];

    // Return if no file is selected
    if (!file) {
      return;
    }

    // Check if image is not too large (More than 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image is too large");
      return;
    }

    if (onChange) {
      onChange(file);
    }

    // 'file' comes from the Blob or File API
    if (onUpload) {
      const storageFilename = user.uid + "/images/" + fieldName + "_" + Date.now() + ".jpg";
      const imgRef = ref(storage, storageFilename);
      void uploadBytes(imgRef, file).then(() => {
        void getDownloadURL(imgRef).then(metadata => {
          onUpload(metadata);
        });
      });
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        name="file"
        accept="image/*"
        onChange={changeHandler}
        ref={fileInputRef}
        style={{ display: "none" }}
      />
      <div onClick={handleClick}>{children}</div>
    </div>
  );
}
