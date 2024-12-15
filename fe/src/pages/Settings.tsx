import { useSelector } from "react-redux";
import { object, string } from "yup";
import { RootState } from "../redux/store";
import { FastField, Form, Formik } from "formik";
import InputField from "../components/InputField";
import { GetUserInfoDto } from "../types/types";
import { callApi } from "../api/axios";
import Swal from "sweetalert2";
import { useState } from "react";
import { uploadToCloudinary } from "../utils/helper";
import { Button, DatePicker, Modal, notification, Table } from "antd";
import {
  FaKey,
  FaUpload,
  FaExclamationTriangle,
  FaSave,
  FaUserCircle,
} from "react-icons/fa";
import { title } from "process";
import { render } from "react-dom";

function Settings() {
  const [isLoading, setIsLoading] = useState(false);
  const [isShowModal, setIsShowModal] = useState<boolean>(false);

  // State for key management
  const [keys, setKeys] = useState({ publicKey: "", privateKey: "" });

  type UpdateUserInfoForm = Omit<GetUserInfoDto, "id">;

  const ProfileSchema = object({
    name: string().required("Name is required"),
    email: string().required("Email is required").email("The email is invalid"),
    phone: string().matches(
      /^(?:\+84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/,
      "The phone is invalid"
    ),
    address: string(),
    dob: string().matches(
      /^\d{4}-\d{2}-\d{2}$/,
      "Date of birth must be in YYYY-MM-DD format"
    ),
  });

  const user: GetUserInfoDto | null = useSelector(
    (state: RootState) => state.auth.currentUser
  );

  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setIsLoading(true);

      try {
        const uploadedUrl = await uploadToCloudinary(
          file,
          "dnp8wwi3r",
          "images"
        );
        setAvatar(uploadedUrl);
        notification.success({
          message: "Upload Success",
          description: "Image has been uploaded successfully.",
        });
      } catch (error) {
        notification.error({
          message: "Upload Failed",
          description: "Failed to upload image.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Key management functions
  const generateKeys = () => {
    // Replace this with actual key generation logic
    const newPublicKey = "GeneratedPublicKey12345";
    const newPrivateKey = "GeneratedPrivateKey67890";
    setKeys({ publicKey: newPublicKey, privateKey: newPrivateKey });
    notification.success({
      message: "Keys Generated",
      description: "Public and private keys have been successfully generated.",
    });
  };

  const loadKeys = () => {
    // Replace this with actual logic to load keys from a secure source
    const loadedPublicKey = "LoadedPublicKey12345";
    const loadedPrivateKey = "LoadedPrivateKey67890";
    setKeys({ publicKey: loadedPublicKey, privateKey: loadedPrivateKey });
    notification.success({
      message: "Keys Loaded",
      description: "Keys have been successfully loaded.",
    });
  };

  const deleteKeys = () => {
    setIsShowModal(true);
    setKeys({ publicKey: "", privateKey: "" });
    notification.success({
      message: "Keys Deleted",
      description: "Public and private keys have been successfully deleted.",
    });
  };

  const columns = [
    {
      title: "Mã hóa đơn",
      dataIndex: "id",
      key: "id",
      render: (text: string) => <span>{text}</span>,
    },
    {
        title: "Action",
        key: "action",
        dataIndex: "action",
        render: (text: string, record: any) => (<Button>Chi tiet</Button>)

    }

]

  return (
    <div className="wrapper">
      <Modal
        title="Xác nhận thời điểm bị lộ key"
        open={isShowModal}
        onOk={() => {}}
        onCancel={() => {
          setIsShowModal(false);
        }}
      >
        <DatePicker
          onChange={(value, dateString) => {
            console.log("Selected Time: ", value);
            console.log("Formatted Selected Time: ", dateString);
          }}
        />
      </Modal>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-20">
        <Formik<UpdateUserInfoForm>
          initialValues={{
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
            address: user?.address || "",
            dob: user?.dob
              ? `${user.dob[0]}-${String(user.dob[1]).padStart(
                  2,
                  "0"
                )}-${String(user.dob[2]).padStart(2, "0")}`
              : "",
            avatar: user?.avatar || "",
          }}
          validationSchema={ProfileSchema}
          onSubmit={async (values) => {
            // Submission logic here
          }}
        >
          {() => (
            <Form className="mt-10 px-4 mx-auto w-full">
              <div className="text-lg font-bold mb-4">User detail</div>
              <div className="flex flex-col items-center my-5">
                <label
                  htmlFor="imageUpload"
                  className="cursor-pointer flex items-center justify-center w-32 h-32 rounded-full bg-gray-200 overflow-hidden border border-gray-300"
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-gray-500">Upload Image</span>
                  )}
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
              <ul className="grid grid-cols-1 gap-5">
                <li>
                  <FastField
                    name="name"
                    placeholder="Enter your name"
                    component={InputField}
                    label="Name"
                  />
                </li>
                <li>
                  <FastField
                    name="email"
                    placeholder="Enter your email"
                    component={InputField}
                    label="Email"
                  />
                </li>
                <li>
                  <FastField
                    name="phone"
                    placeholder="Enter your phone number"
                    component={InputField}
                    label="Phone"
                  />
                </li>
                <li>
                  <FastField
                    name="address"
                    placeholder="Enter your address"
                    component={InputField}
                    label="Address"
                  />
                </li>
                <li>
                  <FastField
                    name="dob"
                    placeholder="Enter your date of birth (YYYY-MM-DD)"
                    component={InputField}
                    label="Date of Birth"
                    type="date"
                  />
                </li>
              </ul>
              <div className="flex justify-center mt-7">
                <Button
                  className={`${
                    isLoading ? " cursor-not-allowed" : " hover:bg-primaryHover"
                  } transition-all duration-300 px-4 py-2 rounded-lg`}
                  disabled={isLoading}
                >
                  {isLoading ? "Uploading..." : "Update Profile"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>

        <div className="mt-10 p-4 border rounded-lg shadow-sm h-[80%] overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Key Management</h2>
          <div className="flex gap-4">
            {" "}
            <Button
              className="px-4 py-2 rounded-lg flex items-center gap-2 "
              onClick={generateKeys}
            >
              Create Key Pair
            </Button>
            <Button
              className=" px-4 py-2 rounded-lg flex items-center gap-2"
              onClick={generateKeys}
            >
              Load key pair
            </Button>
          </div>
          <div className="grid grid-cols-1 my-4">
            <div className="border rounded-lg p-4 mb-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FaKey className="text-gray-500" />
                Key pari 1 <span className="text-green-400">(active)</span>
              </div>
              <Button
                danger
                icon={<FaExclamationTriangle />}
                className="px-4 py-2 rounded-lg flex items-center gap-2"
                onClick={deleteKeys}
              >
                Report
              </Button>
            </div>
            <div className="border rounded-lg p-4 mb-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FaKey className="text-gray-500" />
                Key pari 1 <span className="text-green-400">(active)</span>
              </div>
              <Button
                danger
                icon={<FaExclamationTriangle />}
                className="px-4 py-2 rounded-lg flex items-center gap-2"
                onClick={deleteKeys}
              >
                Report
              </Button>
            </div>
            <div className="border rounded-lg p-4 mb-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FaKey className="text-gray-500" />
                Key pari 1 <span className="text-green-400">(active)</span>
              </div>
              <Button
                danger
                icon={<FaExclamationTriangle />}
                className="px-4 py-2 rounded-lg flex items-center gap-2"
                onClick={deleteKeys}
              >
                Report
              </Button>
            </div>
            <div className="border rounded-lg p-4 mb-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FaKey className="text-gray-500" />
                Key pari 1 <span className="text-green-400">(active)</span>
              </div>
              <Button
                danger
                icon={<FaExclamationTriangle />}
                className="px-4 py-2 rounded-lg flex items-center gap-2"
                onClick={deleteKeys}
              >
                Report
              </Button>
            </div>
            <div className="border rounded-lg p-4 mb-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FaKey className="text-gray-500" />
                Key pari 1 <span className="text-green-400">(active)</span>
              </div>
              <Button
                danger
                icon={<FaExclamationTriangle />}
                className="px-4 py-2 rounded-lg flex items-center gap-2"
                onClick={deleteKeys}
              >
                Report
              </Button>
            </div>
            <div className="border rounded-lg p-4 mb-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FaKey className="text-gray-500" />
                Key pari 1 <span className="text-green-400">(active)</span>
              </div>
              <Button
                danger
                icon={<FaExclamationTriangle />}
                className="px-4 py-2 rounded-lg flex items-center gap-2"
                onClick={deleteKeys}
              >
                Report
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Table className="mb-40 border rounded" columns={columns}></Table>
    </div>
  );
}

export default Settings;
