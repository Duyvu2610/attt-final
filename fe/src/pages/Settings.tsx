import { useSelector } from "react-redux";
import { object, string } from "yup";
import { RootState } from "../redux/store";
import { FastField, Form, Formik } from "formik";
import InputField from "../components/InputField";
import { GetUserInfoDto, OrderResponse, Key } from "../types/types";
import { baseAxios, callApi } from "../api/axios";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { uploadToCloudinary } from "../utils/helper";
import {
  Button,
  DatePicker,
  Modal,
  notification,
  Table,
  Tag,
  Tooltip,
  Form as AntdForm,
  Input,
} from "antd";
import { FaKey, FaExclamationTriangle } from "react-icons/fa";
import TextArea from "antd/es/input/TextArea";
import Loading from "../components/Loading/Loading";

function Settings() {
  const [isLoading, setIsLoading] = useState(false);
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [isShowModalVerify, setIsShowModalVerify] = useState<boolean>(false);
  const [isShowModalLoad, setIsShowModalLoad] = useState<boolean>(false);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [dateLossKey, setDateLossKey] = useState<string>("");
  const [orderId, setOrderId] = useState<number>(0);
  const [signature, setSignature] = useState<string>("");
  const [form] = AntdForm.useForm();

  // State for key management
  const [keys, setKeys] = useState<Key[]>();

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

  const fetchKeys = async () => {
    try {
      const res = await baseAxios.get(`/keys/list/${user?.id}`);
      setKeys(res.data);
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to fetch keys",
      });
    }
  };

  const fetchOrder = async () => {
    try {
      baseAxios
        .get(`orders/user/${user?.id}`)
        .then((res) => {
          setOrders(res.data);
        })
        .catch((error) => {
          notification.error({
            message: "Error",
            description: "Failed to fetch order",
          });
        });
    } catch (error) {
      Swal.fire("Error", "Failed to fetch order", "error");
    }
  };

  useEffect(() => {
    fetchOrder();
    fetchKeys();
  }, [user]);

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
    callApi(() =>
      baseAxios
        .get(`/keys/generate/${user?.id}`)
        .then((res) => {
          const { privateKey } = res.data;
          const blob = new Blob([privateKey], { type: "text/plain" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "privateKey.txt";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          notification.success({
            message: "Keys Generated",
            description: "Keys have been successfully generated.",
          });
          fetchKeys();
        })
        .catch((error) => {
          notification.error({
            message: "Error",
            description: "Failed to generate keys.",
          });
        })
    );
  };

  const loadKeys = () => {
    form
      .validateFields()
      .then((values) => {
        console.log(values);
        form.resetFields(); // Reset form after successful submission
        setIsShowModalLoad(false);
      })
      .catch((info) => {
        console.error("Validation Failed:", info);
      });
  };

  const deleteKeys = () => {
    setIsShowModal(true);
  };

  const reportKeys = () => {
    callApi(() =>
      baseAxios
        .post(`/keys/report-lost?userId=${user?.id}`, {
          time: dateLossKey.replace(" ", "T"),
        })
        .then((res) => {
          notification.success({
            message: "Keys Deleted",
            description: "Keys have been successfully deleted.",
          });
          fetchKeys();
        })
        .catch((error) => {
          notification.error({
            message: "Error",
            description: "Failed to delete keys.",
          });
        })
        .finally(() => {
          setIsShowModal(false);
        })
    );
  };

  const getInfoOrder = async (id: number) => {
    try {
      const res = await baseAxios.get(`orders/${id}/signature-data`);
      await navigator.clipboard.writeText(JSON.stringify(res.data));
      notification.success({
        message: "Data Copied",
        description: "Order data has been copied to clipboard.",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to copy order data to clipboard.",
      });
    }
  };

  const columns = [
    {
      title: "Mã hóa đơn",
      dataIndex: "id",
      key: "id",
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "digitalSignature",
      key: "digitalSignature",
      render: (digitalSignature: any) =>
        digitalSignature ? (
          <Tag color="green">đã xác thực đơn hàng</Tag>
        ) : (
          <Tag color="red">Chưa xác thực đơn hàng</Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: OrderResponse) => (
        <div className="flex gap-2">
          <Button type="primary" size="small">
            Chi tiet
          </Button>
          <Button size="small" onClick={() => getInfoOrder(record.id)}>
            lay thong tin
          </Button>
          <Button
            size="small"
            onClick={() => {
              setOrderId(record.id);
              setIsShowModalVerify(true);
            }}
          >
            xac thuc
          </Button>
        </div>
      ),
    },
  ];

  const handleAddSignature = (): void => {
    setIsShowModalVerify(false);
    baseAxios
      .post(`orders/${orderId}/digital-signature`, {
        digitalSignature: signature,
      })
      .then((res) => {
        notification.success({
          message: "Signature Added",
          description: "Signature has been successfully added.",
        });
      })
      .catch((error) => {
        notification.error({
          message: "Error",
          description: "Failed to add signature.",
        });
      });
    fetchOrder();
  };

  return (
    <div className="wrapper">
      {isLoading ?? <Loading />}
      <Modal
        title="load key"
        open={isShowModalLoad}
        onOk={loadKeys}
        onCancel={() => setIsShowModalLoad(false)}
      >
        <AntdForm form={form} layout="vertical">
          <AntdForm.Item
            label="Public Key"
            name="publicKey"
            rules={[
              { required: true, message: "Please enter the public key!" },
            ]}
          >
            <Input placeholder="Enter your public key" />
          </AntdForm.Item>

          <AntdForm.Item
            label="Private Key"
            name="privateKey"
            rules={[
              { required: true, message: "Please enter the private key!" },
            ]}
          >
            <Input.Password placeholder="Enter your private key" />
          </AntdForm.Item>
        </AntdForm>
      </Modal>
      <Modal
        title="Xác nhận thời điểm bị lộ key"
        open={isShowModal}
        onOk={reportKeys}
        onCancel={() => {
          setIsShowModal(false);
        }}
      >
        <DatePicker
          showTime
          onChange={(value, dateString) => {
            setDateLossKey(
              Array.isArray(dateString) ? dateString[0] : dateString
            );
          }}
        />
      </Modal>
      <Modal
        title="Nhập chữ ký để xác thực đơn hàng"
        open={isShowModalVerify}
        onOk={handleAddSignature}
        onCancel={() => setIsShowModalVerify(false)}
      >
        <TextArea
          className="w-full h-40 border rounded-lg p-2"
          placeholder="Nhập chữ ký vào đây"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
        ></TextArea>
      </Modal>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-20 max-h-[700px] mb-8">
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

        <div className="mt-10 p-4 border rounded-lg shadow-sm max-h-[570px] overflow-y-auto">
          <div className="flex gap-4  mb-4 items-center">
            <h2 className="text-lg font-bold">Key Management </h2>{" "}
            <span>({keys?.length})</span>
          </div>
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
              onClick={() => setIsShowModalLoad(true)}
            >
              Load key pair
            </Button>
          </div>
          <div className="grid grid-cols-1 my-4">
            {keys?.map((key, index) => (
              <div
                className="border rounded-lg p-4 mb-4 flex justify-between items-center"
                key={index}
              >
                <div className="flex items-center gap-2">
                  <FaKey className="text-gray-500" />
                  <Tooltip title={key.publicKey}>
                    <span className="truncate max-w-xs block">
                      {key.publicKey.length > 30
                        ? `${key.publicKey.slice(0, 30)}...`
                        : key.publicKey}
                    </span>
                  </Tooltip>
                  {key.endTime ? (
                    <Tag color="red">Invalid</Tag>
                  ) : (
                    <Tag color="green">Valid</Tag>
                  )}
                </div>
                {key.endTime ? (
                  <></>
                ) : (
                  <Button
                    danger
                    icon={<FaExclamationTriangle />}
                    className="px-4 py-2 rounded-lg flex items-center gap-2"
                    onClick={deleteKeys}
                  >
                    Report
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Table
        className="mb-40 border rounded"
        columns={columns}
        dataSource={orders}
        rowKey="id"
      ></Table>
    </div>
  );
}

export default Settings;
