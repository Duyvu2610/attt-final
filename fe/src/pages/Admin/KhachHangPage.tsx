import { useEffect, useState } from "react";
import {
  Pagination,
  Table,
  Modal,
  Form,
  Input,
  Button,
  Tag,
  Select,
  DatePicker,
  notification,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { User } from "../../types/types";
import { baseAxios } from "../../api/axios";
import { convertLocalDateTimeToString, convertLocalDateToString } from "../../utils/helper";
import { get } from "http";

const KhachHangPage = () => {
  const [khachHang, setKhachHang] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [form] = Form.useForm();
  const itemsPerPage = 5;

  const [searchText, setSearchText] = useState<string>("");

  // Hàm tìm kiếm cho mỗi cột
  const handleSearch = (
    selectedKeys: string[],
    confirm: () => void,
    dataIndex: string
  ) => {
    setSearchText(selectedKeys[0] || "");
    confirm();
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_: any, record: User, index: number) => {
        return (currentPage - 1) * itemsPerPage + index + 1;
      },
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      // Tính năng tìm kiếm cho cột "Tên"
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            autoFocus
            placeholder={`Search Name`}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys([e.target.value])}
            onPressEnter={() => handleSearch(selectedKeys, confirm, "ten")}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, "ten")}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Refresh
          </Button>
        </div>
      ),
      filterIcon: () => <SearchOutlined />,
      onFilter: (value: any, record: User) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      // Tính năng tìm kiếm cho cột "Số điện thoại"
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            autoFocus
            placeholder={`Search Phone`}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys([e.target.value])}
            onPressEnter={() => handleSearch(selectedKeys, confirm, "sdt")}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, "sdt")}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Refresh
          </Button>
        </div>
      ),
      filterIcon: () => <SearchOutlined />,
      onFilter: (value: any, record: User) =>
        record.phone?.toLowerCase().includes(value.toLowerCase()) || false,
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      render: (value: number) => (value === 0 ? "Nam" : value === 1 ? "Nữ" : "Khác"),
    },
    {
      title: "Date of birth",
      dataIndex: "dob",
      key: "dob",
      render: (dob: [number, number, number]) => (dob ? convertLocalDateToString(dob) : ""),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (text: number) =>
        text === 1 ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Ban</Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: User) => (
        <div>
          <Button
            onClick={() => handleEdit(record)}
            className="mr-2"
            type="primary"
            size="small"
          >
            Edit
          </Button>
          <Button onClick={() => handleDelete(record.id)} size="small">
            Remove
          </Button>
        </div>
      ),
    },
  ];

  const getData = () => {
    baseAxios.get("/admin/users").then((response) => {
      setKhachHang(response.data);
    }
    );
  }

  useEffect(() => {
    getData();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreate = () => {
    setIsEditing(false);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: User) => {
    setSelectedCustomer(record);
    setIsEditing(true);
    form.setFieldsValue({
      ...record,
      dob: record.dob 
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Xóa khách hàng",
      content: "Bạn có chắc chắn muốn xóa khách hàng này?",
      onOk: () => {
        baseAxios.delete(`/admin/users/${id}`).then(() => {
          setKhachHang(
            khachHang.filter((customer) => customer.id !== id)
          );
        });
      },
    });
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (isEditing && selectedCustomer) {
        // Xóa mật khẩu khỏi dữ liệu gửi lên khi chỉnh sửa
        const { password, ...updateData } = values;
        baseAxios
          .put(`/admin/users/${selectedCustomer.id}`, {
            name: updateData.name,
            phone: updateData.phone,
            gender: updateData.gender,
            dob: updateData.dob,
            address: updateData.address,
          })
          .then((response) => {
            getData();
            setIsModalVisible(false);
          }).catch((error) => {
            notification.error({
              message: "Lỗi khi chỉnh sửa",
              description: error.response.data.message,
              })});
      } else {
        // Gửi đầy đủ dữ liệu khi thêm mới
        baseAxios
          .post("/admin/users/register", {
            email: values.email,
            name: values.name,
            phone: values.phone,
            gender: values.gender,
            password: values.password,
            dob: values.dob,
            address: values.address,
            isActive: 1,
          })
          .then((response) => {
            setKhachHang([...khachHang, response.data]);
            setIsModalVisible(false);
          })
          .catch((error) => {
            notification.error({
              message: "Lỗi",
              description: error.response.data.message,
            });
          });
      }
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const paginatedData = khachHang.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <h2 className="text-center font-bold text-3xl my-4">
        User Management
      </h2>
      <div className="flex justify-end my-4">
        <Button type="primary" onClick={handleCreate}>
          Add
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table
          dataSource={paginatedData}
          columns={columns}
          pagination={false}
        />
        <div className="flex justify-center my-4">
          <Pagination
            current={currentPage}
            total={khachHang.length}
            pageSize={itemsPerPage}
            onChange={handlePageChange}
          />
        </div>
      </div>

      {/* Modal for creating or editing customer */}
      <Modal
        title={isEditing ? "Edit" : "Register"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {!isEditing && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: "Please input password" }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true, message: "Please choose gender" }]}
          >
            <Select placeholder="Gender">
              <Select.Option value={0}>Male</Select.Option>
              <Select.Option value={1}>Female</Select.Option>
              <Select.Option value={2}>Other</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="dob"
            label="Date of birth"
            rules={[
              {
                required: true,
                message: "Please choose date of birth",
              },
            ]}
          >
            <DatePicker/>
          </Form.Item>
          {!isEditing && (
            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  type: "email",
                  message: "Please input a valid email",
                },
              ]}
            >
              <Input />
            </Form.Item>
          )}
          <Form.Item name="address" label="Address">
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[
              {
                required: true,
                message: "Please input phone number",
              },
              {
                pattern: /^[0-9]+$/,
                message: "Phone number must be a number",
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default KhachHangPage;