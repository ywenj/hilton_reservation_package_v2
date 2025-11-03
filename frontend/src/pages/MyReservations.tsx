import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  Table,
  Tag,
  Typography,
  Button,
  Space,
  InputNumber,
  Form,
  Modal,
  DatePicker,
} from "antd";
import { MUTATION_CREATE, QUERY_MY_RESERVATIONS } from "../graphql/queries";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { message } from "antd";

export default function MyReservationsPage() {
  const { data, loading, refetch } = useQuery(QUERY_MY_RESERVATIONS);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [createReservation] = useMutation(MUTATION_CREATE);

  return (
    <div style={{ padding: 24 }}>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Typography.Title level={3} style={{ margin: 0 }}>
          My Reservations
        </Typography.Title>
        <>
          <Button type="primary" onClick={() => setOpen(true)}>
            New Reservation
          </Button>
          <Modal
            open={open}
            title="Create Reservation"
            onCancel={() => {
              form.resetFields();
              setOpen(false);
            }}
            onOk={async () => {
              try {
                setSubmitting(true);
                const values = await form.validateFields();
                const input = {
                  expectedArrival:
                    values.expectedArrival.format("YYYY-MM-DD HH:mm"),
                  tableSize: values.tableSize,
                };
                await createReservation({ variables: { input } });
                await refetch();
                message.success("Reservation created");
                setOpen(false);
                form.resetFields();
              } catch (e: any) {
                message.error(e.message || "Create failed");
              } finally {
                setSubmitting(false);
              }
            }}
            confirmLoading={submitting}
            destroyOnClose
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="expectedArrival"
                label="Expected Arrival"
                rules={[
                  { required: true, message: "Please select arrival time" },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      if (value.isBefore(dayjs())) {
                        return Promise.reject("Time must be in the future");
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                name="tableSize"
                label="Table Size"
                initialValue={2}
                rules={[{ required: true, message: "Please enter table size" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Form>
          </Modal>
        </>
      </Space>
      <Table
        loading={loading}
        dataSource={(data?.myReservations || []) as any[]}
        rowKey={(r: any) => r._id}
        columns={[
          { title: "Arrival", dataIndex: "expectedArrival" },
          { title: "Table Size", dataIndex: "tableSize" },
          {
            title: "Status",
            dataIndex: "status",
            render: (s: string) => <Tag>{s}</Tag>,
          },
        ]}
      />
    </div>
  );
}
