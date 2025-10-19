import { useState, useRef } from "react";
import { showErrorAlert, showSuccessAlert } from "../utils/alerts";

const ProfilePictureUpload = ({
  currentPicture,
  onUpload,
  isLoading,
  userId,
}) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      showErrorAlert(
        "Invalid File Type",
        "Only JPEG, PNG, and GIF files are allowed"
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showErrorAlert("File Too Large", "File size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("profilePicture", file);
    onUpload(formData);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const imageSrc =
    preview ||
    (currentPicture ? `data:image/png;base64,${currentPicture}` : null);

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-4">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center border-4 border-gray-300">
            <svg
              className="w-16 h-16 text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={isLoading}
          className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 disabled:bg-blue-400"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
          </svg>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={handleUploadClick}
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed"
      >
        {isLoading ? "Uploading..." : "Upload Photo"}
      </button>

      <p className="text-xs text-gray-500 mt-2">JPEG, PNG or GIF • Max 5MB</p>
    </div>
  );
};

export default ProfilePictureUpload;
