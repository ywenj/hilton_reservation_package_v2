import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import dayjs from "dayjs";
import {
  Table,
  Space,
  InputNumber,
  Form,
  Modal,
  DatePicker,
  Typography,
  message,
} from "antd";
import { formatDateTime } from "../utils/datetime";
import {
  QUERY_MY_RESERVATIONS,
  MUTATION_CREATE,
  MUTATION_UPDATE,
  MUTATION_CANCEL_MY,
} from "../graphql/queries";
import { ActionButton } from "../components/ActionButton";

function MyReservations() {
  const { data, loading, refetch } = useQuery(QUERY_MY_RESERVATIONS);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formCreate] = Form.useForm();
  const [formEdit] = Form.useForm();
  const [createReservation] = useMutation(MUTATION_CREATE);
  const [updateReservation, { loading: updating }] =
    useMutation(MUTATION_UPDATE);
  const [cancelMyReservation, { loading: cancelling }] =
    useMutation(MUTATION_CANCEL_MY);
  const [editing, setEditing] = useState<any | null>(null);

  useEffect(() => {
    if (editing && openEdit) {
      formEdit.setFieldsValue({
        expectedArrival: dayjs(editing.expectedArrival),
        tableSize: editing.tableSize,
      });
    } else {
      formEdit.resetFields();
    }
  }, [editing, openEdit, formEdit]);

  const ensureNow = (formRef: any, field: string) => {
    const v = formRef.getFieldValue(field);
    if (!v) {
      formRef.setFieldsValue({ [field]: dayjs() });
    }
  };

  const FINAL_STATUSES = ["Approved", "Cancelled", "Completed"];

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
          <ActionButton
            onClick={() => {
              formCreate.resetFields();
              ensureNow(formCreate, "expectedArrival");
              setOpenCreate(true);
            }}
          >
            New Reservation
          </ActionButton>
          <Modal
            open={openCreate}
            title="Create Reservation"
            onCancel={() => {
              formCreate.resetFields();
              setOpenCreate(false);
            }}
            onOk={async () => {
              try {
                setSubmitting(true);
                const values = await formCreate.validateFields();
                const input = {
                  expectedArrival:
                    values.expectedArrival.format("YYYY-MM-DD HH:mm"),
                  tableSize: values.tableSize,
                };
                await createReservation({ variables: { input } });
                await refetch();
                message.success("Reservation created");
                setOpenCreate(false);
                formCreate.resetFields();
              } catch (e: any) {
                message.error(e.message || "Create failed");
              } finally {
                setSubmitting(false);
              }
            }}
            confirmLoading={submitting}
            destroyOnClose
          >
            <Form form={formCreate} layout="vertical">
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
                  onFocus={() => ensureNow(formCreate, "expectedArrival")}
                  onOpenChange={(open) => {
                    if (open) ensureNow(formCreate, "expectedArrival");
                  }}
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

          <Modal
            open={openEdit}
            title="Edit Reservation"
            onCancel={() => {
              setOpenEdit(false);
              setEditing(null);
              formEdit.resetFields();
            }}
            onOk={async () => {
              if (!editing) return;
              try {
                const values = await formEdit.validateFields();
                await updateReservation({
                  variables: {
                    id: editing._id,
                    input: {
                      expectedArrival:
                        values.expectedArrival.format("YYYY-MM-DD HH:mm"),
                      tableSize: values.tableSize,
                      version: editing.version,
                    },
                  },
                });
                await refetch();
                message.success("Reservation updated");
                setOpenEdit(false);
                setEditing(null);
              } catch (e: any) {
                message.error(e.message || "Update failed");
              }
            }}
            confirmLoading={updating}
            destroyOnClose
          >
            <Form form={formEdit} layout="vertical">
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
                  onFocus={() => ensureNow(formEdit, "expectedArrival")}
                  onOpenChange={(open) => {
                    if (open) ensureNow(formEdit, "expectedArrival");
                  }}
                />
              </Form.Item>
              <Form.Item
                name="tableSize"
                label="Table Size"
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
          {
            title: "Arrival",
            dataIndex: "expectedArrival",
            render: (v: string) => formatDateTime(v),
          },
          { title: "Table Size", dataIndex: "tableSize" },
          {
            title: "Status",
            dataIndex: "status",
            render: (s: string) => <span>{s}</span>,
          },
          {
            title: "Actions",
            render: (_: any, r: any) => {
              const disabled = FINAL_STATUSES.includes(r.status);
              return (
                <Space size="small">
                  <ActionButton
                    disabled={disabled}
                    onClick={() => {
                      setEditing(r);
                      setOpenEdit(true);
                    }}
                  >
                    Edit
                  </ActionButton>
                  <ActionButton
                    danger
                    loading={cancelling}
                    disabled={disabled}
                    onClick={async () => {
                      try {
                        await cancelMyReservation({
                          variables: { id: r._id, version: r.version },
                        });
                        await refetch();
                        message.success("Cancelled");
                      } catch (e: any) {
                        message.error(e.message || "Cancel failed");
                      }
                    }}
                  >
                    Cancel
                  </ActionButton>
                </Space>
              );
            },
          },
        ]}
      />
    </div>
  );
}

export default MyReservations;
