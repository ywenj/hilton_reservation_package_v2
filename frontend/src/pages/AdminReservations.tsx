import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_RESERVATIONS, MUTATION_SET_STATUS } from "../graphql/queries";
import {
  DatePicker,
  Select,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  message,
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

  const onStatusChange = async (id: string, newStatus: string) => {
    try {
      await setStatusMutation({ variables: { id, status: newStatus } });
      message.success("状态已更新");
      refetch();
    } catch (e: any) {
      message.error(e.message);
    }
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
    </div>
  );
}
