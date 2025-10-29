import React from "react";
import { useMutation } from "@apollo/client";
import { MUTATION_CREATE } from "../graphql/queries";
import { CreateReservationInput } from "../types/reservation";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  notification,
  Card,
} from "antd";
import dayjs from "dayjs";

interface Props {
  onCreated?: (id: string) => void;
}

export const ReservationForm: React.FC<Props> = ({ onCreated }) => {
  const [createReservation, { loading }] = useMutation(MUTATION_CREATE);
  const [api, contextHolder] = notification.useNotification();

  const onFinish = async (values: any) => {
    const input: CreateReservationInput = {
      guestName: values.guestName,
      contactPhone: values.contactPhone,
      contactEmail: values.contactEmail,
      expectedArrival: values.expectedArrival.toISOString(),
      tableSize: values.tableSize,
    };
    try {
      const res = await createReservation({ variables: { input } });
      const id = res.data?.createReservation?._id;
      api.success({ message: "Reservation created", description: `ID: ${id}` });
      if (id && onCreated) onCreated(id);
    } catch (err: any) {
      api.error({ message: "Create failed", description: err.message });
    }
  };

  return (
    <Card title="Create Reservation" size="small" style={{ maxWidth: 440 }}>
      {contextHolder}
      <Form
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          guestName: "",
          contactPhone: "",
          contactEmail: "",
          expectedArrival: dayjs(),
          tableSize: 2,
        }}
      >
        <Form.Item
          name="guestName"
          label="Guest Name"
          rules={[{ required: true }]}
        >
          <Input placeholder="Guest name" />
        </Form.Item>
        <Form.Item
          name="contactPhone"
          label="Contact Phone"
          rules={[{ required: true }]}
        >
          <Input placeholder="+1-..." />
        </Form.Item>
        <Form.Item
          name="contactEmail"
          label="Contact Email"
          rules={[{ type: "email" }]}
        >
          <Input placeholder="guest@example.com" />
        </Form.Item>
        <Form.Item
          name="expectedArrival"
          label="Expected Arrival"
          rules={[{ required: true }]}
        >
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="tableSize"
          label="Table Size"
          rules={[{ required: true, type: "number", min: 1 }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
