import Swal from "sweetalert2";

export const showSuccessAlert = (title = "Success!", message = "") => {
  return Swal.fire({
    title,
    text: message,
    icon: "success",
    confirmButtonText: "OK",
    confirmButtonColor: "#10b981",
  });
};

export const showErrorAlert = (title = "Error!", message = "") => {
  return Swal.fire({
    title,
    text: message,
    icon: "error",
    confirmButtonText: "Try Again",
    confirmButtonColor: "#ef4444",
  });
};

export const showWarningAlert = (title = "Warning!", message = "") => {
  return Swal.fire({
    title,
    text: message,
    icon: "warning",
    confirmButtonText: "OK",
    confirmButtonColor: "#f59e0b",
  });
};

export const showInfoAlert = (title = "Information", message = "") => {
  return Swal.fire({
    title,
    text: message,
    icon: "info",
    confirmButtonText: "OK",
    confirmButtonColor: "#3b82f6",
  });
};

export const showConfirmDialog = (title, message = "") => {
  return Swal.fire({
    title,
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3b82f6",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes, confirm!",
    cancelButtonText: "Cancel",
  });
};

export const showDeleteConfirmation = (
  itemName = "this item",
  additionalMessage = ""
) => {
  return Swal.fire({
    title: `Delete ${itemName}?`,
    text: additionalMessage || "You won't be able to undo this action!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#3b82f6",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  });
};

export const showLoadingAlert = (title = "Loading...") => {
  Swal.fire({
    title,
    didOpen: () => {
      Swal.showLoading();
    },
    allowOutsideClick: false,
    allowEscapeKey: false,
  });
};

export const closeAlert = () => Swal.close();

export const showToast = (message, type = "success") => {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  Toast.fire({
    icon: type,
    title: message,
  });
};

export const showQuestionDialog = (title, message = "") => {
  return Swal.fire({
    title,
    text: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#3b82f6",
    cancelButtonColor: "#ef4444",
    confirmButtonText: "Yes",
    cancelButtonText: "No",
  });
};

export const showInputDialog = (title = "Enter value", placeholder = "") => {
  return Swal.fire({
    title,
    input: "text",
    inputPlaceholder: placeholder,
    showCancelButton: true,
    confirmButtonColor: "#3b82f6",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Submit",
    cancelButtonText: "Cancel",
    inputValidator: (value) => {
      if (!value) {
        return "Please enter a value!";
      }
    },
  });
};

export const showMultiButtonDialog = (title, message = "") => {
  return Swal.fire({
    title,
    text: message,
    icon: "question",
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: "Save",
    denyButtonText: "Delete",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#10b981",
    denyButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
  });
};

export const showHtmlAlert = (title, html, icon = "info") => {
  return Swal.fire({
    title,
    html,
    icon,
    confirmButtonText: "OK",
    confirmButtonColor: "#3b82f6",
  });
};

export const showSuccessAutoClose = (
  title = "Success!",
  message = "",
  timer = 2000
) => {
  return Swal.fire({
    title,
    text: message,
    icon: "success",
    confirmButtonColor: "#10b981",
    timer,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
};

export const showErrorAutoClose = (
  title = "Error!",
  message = "",
  timer = 2000
) => {
  return Swal.fire({
    title,
    text: message,
    icon: "error",
    confirmButtonColor: "#ef4444",
    timer,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
};

export const showCustomAlert = (title, message, customClass = {}) => {
  return Swal.fire({
    title,
    text: message,
    customClass: {
      title: "text-2xl font-bold text-gray-900",
      htmlContainer: "text-base text-gray-600",
      confirmButton:
        "bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded",
      ...customClass,
    },
  });
};

export const showProgressAlert = (title, currentStep, totalSteps) => {
  const progress = (currentStep / totalSteps) * 100;
  return Swal.fire({
    title,
    html: `
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div class="bg-blue-500 h-2 rounded-full transition-all" style="width: ${progress}%"></div>
      </div>
      <p class="mt-3 text-sm text-gray-600">Step ${currentStep} of ${totalSteps}</p>
    `,
    allowOutsideClick: false,
    allowEscapeKey: false,
  });
};

export const showCustomConfirm = (options) => {
  const {
    title = "Confirm",
    message = "",
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmColor = "#3b82f6",
    cancelColor = "#6b7280",
  } = options;

  return Swal.fire({
    title,
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: confirmColor,
    cancelButtonColor: cancelColor,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });
};

export const closeAllAlerts = () => {
  Swal.hideLoading();
  Swal.close();
};

export default {
  showSuccessAlert,
  showErrorAlert,
  showWarningAlert,
  showInfoAlert,
  showConfirmDialog,
  showDeleteConfirmation,
  showLoadingAlert,
  closeAlert,
  showToast,
  showQuestionDialog,
  showInputDialog,
  showMultiButtonDialog,
  showHtmlAlert,
  showSuccessAutoClose,
  showErrorAutoClose,
  showCustomAlert,
  showProgressAlert,
  showCustomConfirm,
  closeAllAlerts,
};
