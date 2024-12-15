import React, { useEffect, useState } from "react";
import { Table, Typography, Spin } from "antd";
import axios from "axios";
import { baseAxios } from "../api/axios";

const { Title } = Typography;

interface Product {
  id: number;
  name: string;
  price: number;
  quantitySold: number;
  remainingQuantity: number;
  description: string | null;
  detail: string | null;
  image: string;
  category: string;
  rating: number;
  createdAt: number[];
  updatedAt: number[] | null;
}

interface OrderDetail {
  id: number;
  product: Product;
  amount: number;
  price: number;
}

interface OrderDetailsTableProps {
  orderId: number;
}

const OrderDetailsTable: React.FC<OrderDetailsTableProps> = ({ orderId }) => {
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch order details from API
    const fetchOrderDetails = async () => {
      try {
        const response = await baseAxios.get(`/orders/${orderId}`);
        setOrderDetails(response.data);
      } catch (error) {
        console.error("Failed to fetch order details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const columns = [
    {
      title: "Hình ảnh",
      dataIndex: ["product", "image"],
      key: "image",
      render: (image: string) => <img src={image} alt="product" style={{ width: 50, height: 50, objectFit: "cover" }} />,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: ["product", "name"],
      key: "name",
    },
    {
      title: "Số lượng",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      render: (price: number) => `${price.toLocaleString()} đ`,
    },
    {
      title: "Thành tiền",
      key: "totalPrice",
      render: (_: any, record: OrderDetail) => `${(record.amount * record.price).toLocaleString()} đ`,
    },
  ];

  return (
    <div>
      <Title level={4}>Chi tiết đơn hàng #{orderId}</Title>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          columns={columns}
          dataSource={orderDetails}
          rowKey="id"
          pagination={false}
          bordered
          size="large"
        />
      )}
    </div>
  );
};

export default OrderDetailsTable;
