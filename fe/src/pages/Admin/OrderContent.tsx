import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, notification, Tag } from "antd";
import { baseAxios } from "../../api/axios";
import { Order, User } from "../../types/types";

const OrderContent: React.FC = () => {
  const mockOrders: Order[] = [
    {
      id: 1,
      createdAt: new Date(),
      paymentMethod: "COD",
      paymentStatus: "UNPAID",
      orderStatus: "PENDING",
      user: {
        id: "1",
        name: "Nguyễn Văn A",
        password: "hashed_password",
        gender: 1,
        dob: [1995, 5, 15],
        email: "nguyenvana@gmail.com",
        address: "123 Đường ABC, TP.HCM",
        phone: "0901234567",
        isActive: "yes",
      },
    },
    {
      id: 2,
      createdAt: new Date(),
      paymentMethod: "Bank Transfer",
      paymentStatus: "PAID",
      orderStatus: "APPROVED",
      user: {
        id: "2",
        name: "Trần Thị B",
        password: "hashed_password",
        gender: 0,
        dob: [1997, 10, 25],
        email: "tranthib@gmail.com",
        address: "456 Đường XYZ, Hà Nội",
        phone: "0987654321",
        isActive: "yes",
      },
    },
    {
      id: 3,
      createdAt: new Date(),
      paymentMethod: "Credit Card",
      paymentStatus: "PAID",
      orderStatus: "DELIVERED",
      user: {
        id: "3",
        name: "Lê Văn C",
        password: "hashed_password",
        gender: 1,
        dob: [1990, 3, 20],
        email: "levanc@gmail.com",
        address: "789 Đường PQR, Đà Nẵng",
        phone: null,
        isActive: "no",
      },
    },
  ];
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [editingRoomType, setEditingRoomType] = useState<Order | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [filteredData, setFilteredData] = useState<Order[]>(mockOrders);

  const [form] = Form.useForm();

  // Hàm gọi API
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await baseAxios.get<Order[]>("admin/orders");
      setData(response.data);
      setFilteredData(response.data); // Lưu dữ liệu vào state
    } catch (error: any) {
      notification.error({
        message: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetchData();
  }, []);

  const handleAddRoomType = async () => {
    setLoading(true);
  };

  const handleAddCancel = () => {
    setAddModalVisible(false);
  };

  // Cấu hình bảng
  const columns = [
    {
      title: "Mã hóa đơn",
      dataIndex: "id",
      key: "id",
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: "Phương thức thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (text: string) => (
        <span>
          <Tag color={`${text === "COD" ? "red" : "green"}`}>{text}</Tag>
        </span>
      ),
    },
    {
      title: "Trạng thái thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (text: string) => (
        <span>
          <Tag color={`${text === "PAID" ? "green" : "red"}`}>{text}</Tag>
        </span>
      ),
    },
    {
      title: "Trạng thái đơn hàng",
      dataIndex: "orderStatus",
      key: "orderStatus",
      render: (text: string) => (
        <span>
          <Tag
            color={
              text === "PENDING"
                ? "blue"
                : text === "APPROVED"
                ? "green"
                : "gray"
            }
          >
            {text}
          </Tag>
        </span>
      ),
    },
    {
      title: "Người đặt",
      dataIndex: "user",
      key: "user",
      render: (user: User) => <span>{user.email}</span>,
    },
    {
      title: "Chi tiết đơn hàng",
      dataIndex: "user",
      key: "user",
      render: (user: User) => <span>{user.email}</span>,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Order) => (
        <>
          
          {record.orderStatus === 'PENDING' && (<Button
            onClick={() => showEditModal(record)}
            type="primary"
            className="mr-2"
          >
            Chấp nhận
          </Button>)}
          {record.orderStatus === 'PENDING' && (<Button
            onClick={() => showDeleteModal(record)}
            danger
            className="mx-4"
          >
            Từ chối
          </Button>)}
          {record.orderStatus === 'APPROVED' && (<Button color="default" onClick={() => checkoutOrder(record)}>Trả phòng</Button>)}
        </>
      ),
    },
  ];

  const showDeleteModal = (order: Order) => {
    baseAxios
      .post(`admin/orders/reject/${order.id}`)
      .then(() => {
        notification.success({
          message: "Từ chối đơn đặt phòng thành công",
          description: "Đã từ chối đơn đặt phòng",
        });
        fetchData();
      })
      .catch((error) => {
        notification.error({
          message: "Lỗi từ chối đơn đặt phòng",
          description: error.message,
        });
      });
  };

  const showEditModal = (order: Order) => {
    setLoading(true);
    baseAxios
      .post(`admin/orders/approve/${order.id}`)
      .then(() => {
        notification.success({
          message: "Chấp nhận đơn hàng thành công",
          description: "Đơn hàng đã được chấp nhận.",
        });
        fetchData();
      })
      .catch((error) => {
        notification.error({
          message: "Lỗi chấp nhận đơn hàng",
          description: error.message,
        });
      }).finally(() => {
        setLoading(false);
      });
  };

  const checkoutOrder = (order: Order) => {
    baseAxios
      .post(`admin/orders/checkout/${order.id}`)
      .then(() => {
        notification.success({
          message: "Trả phòng thành công",
          description: "Phòng đã được trả.",
        });
        fetchData();
      })
      .catch((error) => {
        notification.error({
          message: "Lỗi trả đơn hàng",
          description: error.message,
        });
      });
  };

  const handleOk = () => {
    if (!editingRoomType) return;
    form
      .validateFields()
      .then(async (values) => {
        setLoading(true);
        // try {
        //   // Gửi yêu cầu PUT để cập nhật thông tin loại phòng
        //   const response = await baseAxios.put<RoomType>(
        //     `/admin/room-types/${editingRoomType.id}`,
        //     values
        //   );
        //   if (response.data) {
        //     notification.success({
        //       message: "Cập nhật loại phòng thành công",
        //       description: "Thông tin loại phòng đã được cập nhật.",
        //     });
        //     // Cập nhật thông tin loại phòng trong danh sách
        //     const index = data.findIndex(
        //       (item) => item.id === editingRoomType.id
        //     );
        //     const newData = [...data];
        //     setData(newData);
        //     setFilteredData(newData);
        //   }
        // } catch (error: any) {
        //   notification.error({
        //     message: "Lỗi cập nhật loại phòng",
        //     description: error.message,
        //   });
        // } finally {
        //   setLoading(false);
        //   setModalVisible(false);
        // }
      })
      .catch((error) => {
        console.log(error);
      });
    setModalVisible(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  return (
    <div>
      <h2 className="mb-4">Quản lý lịch đặt hàng</h2>

      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />

      {/* Modal chỉnh sửa */}
      <Modal
        title="Chỉnh sửa Phòng"
        visible={modalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form}>
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal thêm kích cỡ mới */}
      <Modal
        title="Thêm loại phòng"
        visible={addModalVisible}
        onOk={handleAddRoomType}
        onCancel={handleAddCancel}
      >
        <Form
          onFinish={handleAddRoomType}
          initialValues={
            {
              // ten: newRoomType.name,
            }
          }
        >
          {/* <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input
              value={newRoomType.name}
              onChange={(e) => setNewRoomType({ ...newRoomType!, name: e.target.value })}
            />
          </Form.Item> */}
        </Form>
      </Modal>
    </div>
  );
};

export default OrderContent;