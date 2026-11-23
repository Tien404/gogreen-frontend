import { ToastContainer as ReactToastifyContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function ToastContainer() {
  return (
    <ReactToastifyContainer
      position="bottom-right"
      autoClose={3500}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  );
}
