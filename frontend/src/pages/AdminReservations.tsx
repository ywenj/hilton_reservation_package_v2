import React, { useState } from "react";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import {
  QUERY_RESERVATIONS,
  MUTATION_SET_STATUS,
  QUERY_RESERVATION,
} from "../graphql/queries";
import {
  DatePicker,
  Select,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  message,
  Modal,
  Descriptions,
  Spin,
} from "antd";
import dayjs from "dayjs";

const STATUS_OPTIONS = ["Approve", "Complete", "Cancel"];

// Mapping from stored / mutation status keywords to display labels (past tense)
const STATUS_DISPLAY: Record<string, string> = {
  Request: "Requested",
  Approve: "Approved",
  Complete: "Completed",
  Cancel: "Cancelled",
};

export default function AdminReservationsPage() {
  const [date, setDate] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const { data, loading, refetch } = useQuery(QUERY_RESERVATIONS, {
    variables: { date, status },
  });
  const [setStatusMutation, { loading: updating }] =
    useMutation(MUTATION_SET_STATUS);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [
    fetchReservation,
    { data: detailData, loading: detailLoading, error: detailError },
  ] = useLazyQuery(QUERY_RESERVATION);

  const onStatusChange = async (id: string, newStatus: string) => {
    try {
      await setStatusMutation({ variables: { id, status: newStatus } });
      message.success("状态已更新");
      refetch();
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const openDetail = (id: string) => {
    setCurrentId(id);
    setDetailOpen(true);
    fetchReservation({ variables: { id } });
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setCurrentId(null);
  };

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3}>Reservation Management</Typography.Title>
      <Space style={{ marginBottom: 16 }} wrap>
        <DatePicker
          value={date ? dayjs(date) : undefined}
          onChange={(d) => setDate(d ? d.format("YYYY-MM-DD") : undefined)}
        />
        <Select
          allowClear
          placeholder="Filter by Status"
          style={{ width: 160 }}
          value={status}
          onChange={setStatus}
          options={Object.values(STATUS_DISPLAY).map((s) => ({
            value: s,
            label: s,
          }))}
        />
        <Button onClick={() => refetch()} type="default">
          Refresh
        </Button>
      </Space>
      <Table
        loading={loading}
        dataSource={(data?.reservations || []) as any[]}
        rowKey={(r: any) => r._id}
        columns={[
          { title: "Guest Name", dataIndex: "guestName" },
          { title: "Phone", dataIndex: "contactPhone" },
          { title: "Arrival", dataIndex: "expectedArrival" },
          { title: "Party Size", dataIndex: "tableSize" },
          {
            title: "Status",
            dataIndex: "status",
            render: (s: string) => <label>{STATUS_DISPLAY[s] ?? s}</label>,
          },
          {
            title: "Actions",
            render: (_: any, r: any) => (
              <Space>
                <Button
                  size="small"
                  onClick={() => openDetail(r._id)}
                  style={{
                    background: "#1677ff",
                    color: "#fff",
                    borderColor: "#1677ff",
                  }}
                >
                  View
                </Button>
                {STATUS_OPTIONS.filter((ns) => ns !== r.status).map((ns) => (
                  <Button
                    size="small"
                    loading={updating}
                    key={ns}
                    onClick={() => onStatusChange(r._id, STATUS_DISPLAY[ns])}
                    style={{
                      background: "#1677ff",
                      color: "#fff",
                      borderColor: "#1677ff",
                    }}
                  >
                    {ns}
                  </Button>
                ))}
              </Space>
            ),
          },
        ]}
      />
      <Modal
        open={detailOpen}
        onCancel={closeDetail}
        title="Reservation Detail"
        footer={null}
        destroyOnClose
      >
        {detailLoading && (
          <div style={{ textAlign: "center", padding: 24 }}>
            <Spin />
          </div>
        )}
        {!detailLoading && detailError && (
          <Typography.Text type="danger">{detailError.message}</Typography.Text>
        )}
        {!detailLoading && !detailError && detailData?.reservation && (
          <Descriptions
            bordered
            size="small"
            column={1}
            labelStyle={{ width: 160 }}
          >
            <Descriptions.Item label="Guest Name">
              {detailData.reservation.guestName}
            </Descriptions.Item>
            <Descriptions.Item label="Contact Phone">
              {detailData.reservation.contactPhone}
            </Descriptions.Item>
            {detailData.reservation.contactEmail && (
              <Descriptions.Item label="Contact Email">
                {detailData.reservation.contactEmail}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Expected Arrival">
              {detailData.reservation.expectedArrival}
            </Descriptions.Item>
            <Descriptions.Item label="Table Size">
              {detailData.reservation.tableSize}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {detailData.reservation.status}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
