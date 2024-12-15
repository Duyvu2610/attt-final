import React, { useEffect, useState } from "react";
import { Table, Button, notification, Tag, Modal } from "antd";
import { baseAxios } from "../../api/axios";
import { OrderAdmin, UserAdmin } from "../../types/types";
import OrderDetailsTable from "../../components/ListDetailTable";

const OrderContent: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [filteredData, setFilteredData] = useState<OrderAdmin[]>();
  const [isShowOrderDetail, setIsShowOrderDetail] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<number>();

  // Hàm gọi API
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await baseAxios.get<OrderAdmin[]>("admin/orders");
      setFilteredData(response.data);
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
    fetchData();
  }, []);

  // Cấu hình bảng
  const columns = [
    {
      title: "Mã hóa đơn",
      dataIndex: "id",
      key: "id",
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: "Trạng thái đơn hàng",
      dataIndex: "digitalSignature",
      key: "digitalSignature",
      render: (text: string) => (
        <Tag color={text === null ? "warning" : "success"}>
          {text === null ? "Chưa xác thực" : "Đã xác thực"}
        </Tag>
      ),
    },
    {
      title: "Người đặt",
      dataIndex: "user",
      key: "user",
      render: (user: UserAdmin) => <span>{user.email}</span>,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (text: number) => <span>{text} VNĐ</span>,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: OrderAdmin) => (
        <>
          {record.digitalSignature !== null && (<Button
            onClick={() => showEditModal(record)}
            type="primary"
            className="mr-4"
          >
            Chấp nhận
          </Button>)}
          <Button
            onClick={() => showDeleteModal(record)}
            danger
            className="mr-4"
          >
            Từ chối
          </Button>
          <Button color="default" onClick={() => checkoutOrder(record)}>
            Chi tiet
          </Button>
        </>
      ),
    },
  ];

  const showDeleteModal = (order: OrderAdmin) => {
    baseAxios
      .delete(`/admin/orders/${order.id}`)
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
      fetchData();
  };

  const showEditModal = (order: OrderAdmin) => {
    setLoading(true);
    baseAxios
      .get(`orders/${order.id}/verify`)
      .then(() => {
        notification.success({
          message: "Chấp nhận đơn hàng thành công",
          description: "Đơn hàng đã được chấp nhận.",
        });
        fetchData();
      })
      .catch((error) => {
        notification.error({
          message: "Đơn hàng không phải chính chủ",
          description: error.message,
        });
      })
      .finally(() => {
        setLoading(false);
        fetchData();
      });
  };

  const checkoutOrder = (order: OrderAdmin) => {
    setOrderId(order.id);
    setIsShowOrderDetail(true);
  };

  return (
    <div>
      <Modal
        width={1000}
        open={isShowOrderDetail}
        // onOk={loadKeys}
        onCancel={() => setIsShowOrderDetail(false)}
      >
        {orderId !== undefined && <OrderDetailsTable orderId={orderId} />}
      </Modal>

      <h2 className="mb-4">Quản lý lịch đặt hàng</h2>

      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default OrderContent;
